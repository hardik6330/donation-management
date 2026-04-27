import { Donation, DonationInstallment, User, Category, Gaushala, Katha, Location } from '../models/index.js';
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
    amount,
    name,
    email,
    address,
    city,
    state,
    country,
    categoryId,
    gaushalaId,
    kathaId,
    companyName,
    mobileNumber,
    paymentMode,
    status,
    referenceName,
    paidAmount,
    slipNo,
    paymentDate,
    donationDate,
    notes
  } = req.body;

  let finalSlipNo = slipNo;
  if (!finalSlipNo) {
    const lastDonation = await Donation.findOne({
      where: { slipNo: { [Op.ne]: null } },
      order: [['createdAt', 'DESC']],
      attributes: ['slipNo']
    });

    if (lastDonation && !isNaN(lastDonation.slipNo)) {
      finalSlipNo = (parseInt(lastDonation.slipNo) + 1).toString();
    } else {
      finalSlipNo = "1";
    }
  }

  let causeString = '';
  let categoryName = 'General Donation';
  let kathaName = '';
  let gaushalaName = '';

  if (categoryId) {
    const category = await Category.findByPk(categoryId);
    if (category) categoryName = category.name;
  }

  if (gaushalaId) {
    const gaushala = await Gaushala.findByPk(gaushalaId);
    if (gaushala) gaushalaName = gaushala.name;
  }

  if (kathaId) {
    const katha = await Katha.findByPk(kathaId);
    if (katha) kathaName = katha.name;
  }

  const targetName = kathaName || gaushalaName || categoryName;
  const fromCity = city ? `${city} માંથી ` : '';
  causeString = `${targetName} માટે ${fromCity}${name} એ દાન આપ્યું`;

  let user;
  if (mobileNumber) {
    user = await User.findOne({ where: { mobileNumber } });
  } else if (email && isValidEmail(email)) {
    user = await User.findOne({ where: { email } });
  }

  if (user && user.id) {
    await user.update({
      name: name || user.name,
      email: email || user.email,
      address: address || user.address,
      city: city?.toUpperCase() || user.city,
      state: state?.toUpperCase() || user.state,
      country: country?.toUpperCase() || user.country,
      companyName: companyName || user.companyName
    });
  } else {
    const tempPassword = crypto.randomBytes(8).toString('hex');
    user = await User.create({
      name,
      email: email || null,
      address,
      city: city?.toUpperCase() || null,
      state: state?.toUpperCase() || null,
      country: country?.toUpperCase() || null,
      companyName,
      mobileNumber: mobileNumber || null,
      password: tempPassword
    });
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

  const donation = await Donation.create(donationData);

  if (isDirectPay || isPartialPay) {
    await DonationInstallment.create({
      donationId: donation.id,
      amount: isPartialPay ? partialPaidAmount : amount,
      paymentMode: paymentMode,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      notes: isPartialPay ? 'Initial partial payment' : 'Full payment'
    });
  }

  if (isPartialPay && user.id) {
    await managePartialPaymentReminder(donation.id, user.id, 'partially_paid');
  }

  if (isDirectPay) {
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
