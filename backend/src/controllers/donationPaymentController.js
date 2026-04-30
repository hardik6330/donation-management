import { Donation, DonationInstallment, User, Category, Gaushala, Katha, Location } from '../models/index.js';
import { sequelize } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { Op } from 'sequelize';
import { FRONTEND_URL, VERCEL } from '../config/env.js';
import { sendEmail, getDonationEmailTemplate, isValidEmail } from '../utils/services/email.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from '../utils/services/whatsapp.service.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from '../utils/services/donationSlip.service.js';
import { donationQueue } from '../utils/services/donationQueue.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import logger from '../utils/logger.js';
import { retryAction, managePartialPaymentReminder } from '../utils/donationHelpers.js';
import { runBackground } from '../utils/backgroundTask.js';

export const generateQRCode = asyncHandler(async (req, res) => {
  const frontendURL = FRONTEND_URL + '/donate';
  const qrCodeData = await QRCode.toDataURL(frontendURL);
  return sendSuccess(res, { qrCodeData, frontendURL }, 'QR code generated successfully');
});

export const createDonationOrder = asyncHandler(async (req, res) => {
  const {
    amount, name, email, address, city, state, country, categoryId, gaushalaId, kathaId,
    companyName, mobileNumber, paymentMode, status, referenceName, paidAmount,
    slipNo, paymentDate, donationDate, notes, birthDate
  } = req.body;

  // Run the create inside a transaction; retry on slipNo unique-constraint collision
  // (multiple devices can race on MAX(slipNo)+1 — the DB unique index is the final
  // guarantee, this loop just regenerates a fresh number and retries).
  const skipSlip = status === 'pay_later' || status === 'partially_paid';

  const runCreate = async () => sequelize.transaction(async (t) => {
    let finalSlipNo = slipNo ? String(slipNo).trim() : null;
    if (finalSlipNo) {
      const dup = await Donation.findOne({ where: { slipNo: finalSlipNo }, attributes: ['id'], transaction: t });
      if (dup) {
        const err = new Error(`Slip number ${finalSlipNo} is already in use`);
        err.statusCode = 400;
        throw err;
      }
    }
    if (!finalSlipNo && !skipSlip) {
      // Atomic max-based numbering: works across the whole table, not just the
      // most recent row by createdAt (which can tie to the second).
      const row = await Donation.findOne({
        attributes: [[sequelize.fn('MAX', sequelize.cast(sequelize.col('slipNo'), 'UNSIGNED')), 'maxSlip']],
        where: sequelize.where(sequelize.col('slipNo'), { [Op.regexp]: '^[0-9]+$' }),
        lock: t.LOCK.UPDATE,
        raw: true,
        transaction: t,
      });
      finalSlipNo = (Number(row?.maxSlip || 0) + 1).toString();
    }

    let causeString = '';
    let categoryName = 'General Donation';
    let kathaName = '';
    let gaushalaName = '';

    if (categoryId) {
      const category = await Category.findByPk(categoryId, { transaction: t });
      if (category) categoryName = category.name;
    }

    if (gaushalaId) {
      const gaushala = await Gaushala.findByPk(gaushalaId, { transaction: t });
      if (gaushala) gaushalaName = gaushala.name;
    }

    if (kathaId) {
      const katha = await Katha.findByPk(kathaId, { transaction: t });
      if (katha) kathaName = katha.name;
    }

    const targetName = kathaName || gaushalaName || categoryName;
    const fromCity = city ? `${city} માંથી ` : '';
    causeString = `${targetName} માટે ${fromCity}${name} એ દાન આપ્યું`;

    let user;
    if (mobileNumber) {
      user = await User.findOne({ where: { mobileNumber }, transaction: t });
    } else if (email && isValidEmail(email)) {
      user = await User.findOne({ where: { email }, transaction: t });
    }

    if (user && user.id) {
      await user.update({
        name: name || user.name,
        email: email || user.email,
        address: address || user.address,
        city: city?.toUpperCase() || user.city,
        state: state?.toUpperCase() || user.state,
        country: country?.toUpperCase() || user.country,
        companyName: companyName || user.companyName,
        birthDate: birthDate || user.birthDate
      }, { transaction: t });
    } else {
      const tempPassword = crypto.randomBytes(8).toString('hex');
      try {
        user = await User.create({
          name,
          email: email || null,
          address,
          city: city?.toUpperCase() || null,
          state: state?.toUpperCase() || null,
          country: country?.toUpperCase() || null,
          companyName,
          birthDate: birthDate || null,
          mobileNumber: mobileNumber || null,
          password: tempPassword
        }, { transaction: t });
      } catch (err) {
        // Two devices created the same donor at once — re-fetch the winner.
        if (err?.name === 'SequelizeUniqueConstraintError') {
          user = mobileNumber
            ? await User.findOne({ where: { mobileNumber }, transaction: t })
            : await User.findOne({ where: { email }, transaction: t });
          if (!user) throw err;
        } else {
          throw err;
        }
      }
    }

    const isDirectPay = status === 'completed';
    const isPartialPay = status === 'partially_paid';
    const totalAmount = Number(amount);
    const partialPaidAmount = Number(paidAmount);

    if (isPartialPay) {
      if (!Number.isFinite(partialPaidAmount) || partialPaidAmount <= 0) {
        throw badRequest('Paid amount is required for partial payment');
      }
      if (partialPaidAmount >= totalAmount) {
        throw badRequest('Paid amount must be less than total donation amount');
      }
    }

    const donationData = {
      donorId: user.id,
      amount,
      cause: causeString,
      categoryId: categoryId || null,
      gaushalaId: gaushalaId || null,
      kathaId: kathaId || null,
      paymentMode,
      referenceName,
      status: status || 'pending',
      donationDate: donationDate ? new Date(donationDate) : new Date(),
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      paidAmount: isPartialPay ? partialPaidAmount : isDirectPay ? amount : null,
      remainingAmount: isPartialPay ? (amount - partialPaidAmount) : null,
      slipNo: finalSlipNo,
      notes: notes || null,
    };

    const donation = await Donation.create(donationData, { transaction: t });

    if (isPartialPay) {
      await DonationInstallment.create({
        donationId: donation.id,
        amount: partialPaidAmount,
        paymentMode: paymentMode,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        notes: 'Initial partial payment',
        slipNo: 'Part 1'
      }, { transaction: t });
    }

    return { donation, user, categoryName, causeString, finalSlipNo };
  });

  let result;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      result = await runCreate();
      break;
    } catch (err) {
      const isSlipCollision =
        err?.name === 'SequelizeUniqueConstraintError' &&
        (err?.fields?.slipNo || err?.errors?.some(e => e.path === 'slipNo'));
      if (isSlipCollision && !slipNo && attempt < 4) {
        logger.warn(`Slip number collision on attempt ${attempt + 1}, retrying...`);
        continue;
      }
      throw err;
    }
  }

  const { donation, user, categoryName, causeString, finalSlipNo } = result;

  if (donation.status === 'partially_paid' && user.id) {
    await managePartialPaymentReminder(donation.id, user.id, 'partially_paid');
  }

  if (donation.status === 'completed') {
    if (donationQueue && !VERCEL) {
      await donationQueue.add('process-donation', {
        donationId: donation.id,
        userId: user.id,
        amount,
        categoryId,
        gaushalaId,
        kathaId,
        causeString,
        slipNo: finalSlipNo
      });
    } else {
      const processSlip = async () => {
        try {
          const [gaushala, katha] = await Promise.all([
            gaushalaId ? Gaushala.findByPk(gaushalaId, { include: [{ model: Location, as: 'location' }] }) : Promise.resolve(null),
            kathaId ? Katha.findByPk(kathaId) : Promise.resolve(null),
          ]);

          let locationAddress = user.city || user.state || user.country || '';

          const pdfBuffer = await generateDonationSlipBuffer(
            user,
            amount,
            causeString,
            donation.id,
            paymentMode,
            donation.donationDate || donation.paymentDate,
            gaushala,
            katha,
            locationAddress,
            finalSlipNo,
            categoryName,
            donation.notes || notes || ''
          );

          const tasks = [];

          const uploadTask = retryAction(async () => {
            const url = await uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id);
            await donation.update({ slipUrl: url });

            if (user.mobileNumber) {
              const category = categoryId ? await Category.findByPk(categoryId) : null;
              const catName = category?.name || causeString || 'ગૌસેવા';
              const locationName = user.city || user.state || user.country || 'કોબડી';

              await retryAction(
                () => sendDetailedDonationSuccessWhatsAppPDF(user.mobileNumber, user.name, amount, catName, locationName, url),
                `WhatsApp [Donation ${donation.id}]`
              );
            }
            return url;
          }, `Cloudinary/WhatsApp [Donation ${donation.id}]`);

          tasks.push(uploadTask);

          if (isValidEmail(user.email)) {
            const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
            const emailTask = retryAction(
              () => sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
                { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
              ]),
              `Email [Donation ${donation.id}]`
            );
            tasks.push(emailTask);
          }

          await Promise.all(tasks);
        } catch (error) {
          logger.error(`[Donation ${donation.id}] Fallback background processing error:`, error);
        }
      };

      // Send the response immediately and let the slip generation continue in
      // the background. On Vercel `waitUntil` keeps the lambda alive until the
      // promise resolves (so concurrent device creates don't block each other).
      // Locally it just runs as a normal pending promise.
      runBackground(processSlip(), `Donation ${donation.id} slip`);
    }
  }

  return sendSuccess(res, donation, 'Donation order created successfully');
});

export const verifyPayment = asyncHandler(async (req, res) => {
  throw badRequest('Razorpay payment verification is currently disabled. Online donations are saved directly.');
});
