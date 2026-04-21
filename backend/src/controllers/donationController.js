import { Donation, DonationInstallment, User, Category, Gaushala, Katha, Location, Notification } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { findOrCreateLocationStructure, formatLocationAddress, extractLocationHierarchy } from '../utils/locationHelper.js';
// import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { FRONTEND_URL } from '../config/env.js';
// import { RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } from '../config/env.js';
import { Op } from 'sequelize';
import { sendEmail, getDonationEmailTemplate, isValidEmail } from '../utils/services/email.service.js';
import { sendDetailedDonationSMS } from '../utils/services/sms.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from '../utils/services/whatsapp.service.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from '../utils/services/donationSlip.service.js';
import { donationQueue } from '../utils/services/donationQueue.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';
import logger from '../utils/logger.js';
import { VERCEL } from '../config/env.js';

// Helper for retrying background tasks in non-queue environments
const retryAction = async (action, label, attempts = 3, delay = 5000) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await action();
    } catch (err) {
      logger.error(`[Retry] ⚠️ ${label} attempt ${i} failed:`, err);
      if (i === attempts) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * i));
    }
  }
};

// Constants for reminder scheduling
const REMINDER_DAYS_AFTER = 5;
const REMINDER_HOUR_OF_DAY = 10;

// Helper function to manage partial payment reminders
const managePartialPaymentReminder = async (donationId, userId, status) => {
  try {
    if (status === 'partially_paid') {
      // Schedule reminder for 5 days later at 10:00 AM
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + REMINDER_DAYS_AFTER);
      scheduledAt.setHours(REMINDER_HOUR_OF_DAY, 0, 0, 0); // Set time to exactly 10:00:00.000 AM

      // Upsert notification (one per donation)
      const [notification, created] = await Notification.findOrCreate({
        where: { donationId, type: 'partial_payment_reminder' },
        defaults: { userId, scheduledAt, status: 'pending' }
      });

      if (!created && notification.status !== 'sent') {
        await notification.update({ scheduledAt, status: 'pending' });
      }
    } else if (status === 'completed') {
      // Cancel any pending reminders if donation is fully paid
      await Notification.update(
        { status: 'cancelled' },
        { where: { donationId, status: 'pending', type: 'partial_payment_reminder' } }
      );
    }
  } catch (error) {
    console.error(`Error managing reminder for donation ${donationId}:`, error);
  }
};

// 1. QR Code Generate Karo
export const generateQRCode = asyncHandler(async (req, res) => {
  const frontendURL = FRONTEND_URL + '/donate';

  const qrCodeData = await QRCode.toDataURL(frontendURL);
  return sendSuccess(res, { qrCodeData, frontendURL }, 'QR code generated successfully');
});

// 2. Razorpay Order Create Karo
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
    slipNo
  } = req.body;

  // 1. Handle Slip Number (Auto-increment if not provided)
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
      finalSlipNo = "1"; // Fallback for first donation
    }
  }

  // 1. Generate Cause String based on Category, Location, and Katha
  let causeString = '';
  let categoryName = 'General Donation';
  let locationName = city || state || country || '';
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

  // New Cause Format: "[Category/Gaushala/Katha] માટે [City] માંથી [Name] એ દાન આપ્યું"
  const targetName = kathaName || gaushalaName || categoryName;
  const fromCity = city ? `${city} માંથી ` : '';
  causeString = `${targetName} માટે ${fromCity}${name} એ દાન આપ્યું`;

  // 2. Check user (create or update if exists)
  let user = await User.findOne({ where: { mobileNumber } });
  if (!user) {
    // Generate a secure random temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    
    user = await User.create({
      name,
      email: email || null,
      address,
      city: city?.toUpperCase() || null,
      state: state?.toUpperCase() || null,
      country: country?.toUpperCase() || null,
      companyName,
      mobileNumber,
      password: tempPassword
    });
  } else {
    // Update existing user details if provided
    await user.update({
      name: name || user.name,
      email: email || user.email,
      address: address || user.address,
      city: city?.toUpperCase() || user.city,
      state: state?.toUpperCase() || user.state,
      country: country?.toUpperCase() || user.country,
      companyName: companyName || user.companyName
    });
  }

  // 3. Handle Donation creation
  const isDirectPay = status === 'completed';
  const isPartialPay = status === 'partially_paid';
  const isPayLater = status === 'pay_later';
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
    locationId: null,
    paymentMode,
    referenceName,
    status: status || 'pending',
    paymentDate: (isDirectPay || isPartialPay) ? new Date() : null,
    paidAmount: isPartialPay ? partialPaidAmount : isDirectPay ? amount : null,
    remainingAmount: isPartialPay ? (amount - partialPaidAmount) : null,
    slipNo: finalSlipNo,
  };

  const donation = await Donation.create(donationData);

  // 4. Create Initial Installment Record
  if (isDirectPay || isPartialPay) {
    await DonationInstallment.create({
      donationId: donation.id,
      amount: isPartialPay ? partialPaidAmount : amount,
      paymentMode: paymentMode,
      paymentDate: new Date(),
      notes: isPartialPay ? 'Initial partial payment' : 'Full payment'
    });
  }

  // 4. Handle Partial Payment Reminder (Send email after 5 days)
  if (isPartialPay) {
    await managePartialPaymentReminder(donation.id, user.id, 'partially_paid');
  }

  // --- Background Tasks (Queue-based or Fallback) ---
  if (isDirectPay) {
    // Skip queue on Vercel as worker won't run reliably in serverless
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
      // Fallback for non-Redis environments (Legacy fire-and-forget)
      (async () => {
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
            donation.paymentDate,
            gaushala,
            katha,
            locationAddress,
            finalSlipNo
          );

          const tasks = [];

          // Upload to Cloudinary with Retry
          const uploadTask = retryAction(async () => {
            const url = await uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id);
            await donation.update({ slipUrl: url });
            
            // Send WhatsApp notification with Retry inside
            if (user.mobileNumber) {
              const category = categoryId ? await Category.findByPk(categoryId) : null;
              const categoryName = category?.name || causeString || 'ગૌસેવા';
              const locationName = user.city || user.state || user.country || 'કોબડી';
              
              await retryAction(
                () => sendDetailedDonationSuccessWhatsAppPDF(user.mobileNumber, user.name, amount, categoryName, locationName, url),
                `WhatsApp [Donation ${donation.id}]`
              );
            }
            return url;
          }, `Cloudinary/WhatsApp [Donation ${donation.id}]`);
          
          tasks.push(uploadTask);

          // Email Notification with Retry
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
      })();
    }
  }

  return sendSuccess(res, donation, 'Donation order created successfully');
});

// 3. Payment Verify (Razorpay - commented out)
// Razorpay verification is disabled. Online donations are now saved directly.
export const verifyPayment = asyncHandler(async (req, res) => {
  throw badRequest('Razorpay payment verification is currently disabled. Online donations are saved directly.');
});

export const getDonations = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');

  const { whereClause, donorWhere } = await buildDonationFilter(req.query, '');

  const { count, rows: donations } = await Donation.findAndCountAll({
    where: whereClause,
    attributes: mainAttributes,
    include: [{ 
      model: User, 
      as: 'donor', 
      where: Object.keys(donorWhere).length > 0 ? donorWhere : null,
      attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'city', 'state', 'country']
    }],
    order: [['createdAt', 'DESC']],
    limit: queryLimit,
    offset: offset,
    distinct: true, // Needed when using include with pagination
  });

  const responseData = getPaginatedResponse({
    rows: donations,
    count,
    limit,
    page,
    isFetchAll,
  });

  return sendSuccess(res, responseData, 'All donations records fetched successfully');
});

export const getDonationInstallments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const installments = await DonationInstallment.findAll({
    where: { donationId: id },
    order: [['paymentDate', 'ASC']]
  });

  return sendSuccess(res, installments, 'Donation installments fetched successfully');
});

// Lightweight endpoint: returns whether the donation slip (PDF) is ready.
// Frontend polls this after creating a donation so the list can refetch once the worker finishes.
export const getDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findByPk(id, { attributes: ['id', 'slipUrl'] });
  if (!donation) throw notFound('Donation');
  return sendSuccess(res, { ready: !!donation.slipUrl, slipUrl: donation.slipUrl || null });
});

// New endpoint: Fetch the latest slip number to pre-fill in frontend
export const getLatestSlipNo = asyncHandler(async (req, res) => {
  try {
    const lastDonation = await Donation.findOne({
      where: { slipNo: { [Op.ne]: null } },
      order: [['createdAt', 'DESC']],
      attributes: ['slipNo']
    });

    let nextSlipNo = "1";
    if (lastDonation && !isNaN(lastDonation.slipNo)) {
      nextSlipNo = (parseInt(lastDonation.slipNo) + 1).toString();
    }

    return sendSuccess(res, { nextSlipNo }, 'Latest slip number fetched successfully');
  } catch (error) {
    logger.error('[Donation] Error fetching latest slipNo:', error);
    // If column doesn't exist yet, return a graceful fallback instead of 500
    return sendSuccess(res, { nextSlipNo: "1" }, 'Fallback slip number (DB error)');
  }
});

export const getDonors = asyncHandler(async (req, res) => {
  const {
    search,
    name,
    mobileNumber,
    city,
    state,
    countryId,
    stateId,
    cityId,
    minAmount,
    maxAmount
  } = req.query;
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  
  // Use scopes for filtering
  const activeScopes = ['donor'];
  
  if (search) activeScopes.push({ method: ['search', search] });
  
  // Custom filters
  const donorWhere = {};
  if (name) donorWhere.name = { [Op.like]: `%${name}%` };
  if (mobileNumber) donorWhere.mobileNumber = { [Op.like]: `%${mobileNumber}%` };
  if (city) donorWhere.city = { [Op.like]: `%${city}%` };
  if (state) donorWhere.state = { [Op.like]: `%${state}%` };

  if (cityId || stateId || countryId) {
    const targetId = cityId || stateId || countryId;
    const location = await Location.findByPk(targetId);
    if (location) {
      if (location.type === 'city') donorWhere.city = location.name;
      else if (location.type === 'state') donorWhere.state = location.name;
      else donorWhere.country = location.name;
    }
  }

  // Filter out any invalid/null scopes to prevent errors
  const sanitizedScopes = activeScopes.filter(scope => scope !== null && scope !== undefined);

  // Handle attributes and virtual fields (donationCount, totalDonated)
  let attributes = requestedFields || { include: [] };
  
  const totalDonatedLiteral = [
    sequelize.literal(`(
      SELECT COALESCE(SUM(amount), 0)
      FROM Donations
      WHERE Donations.donorId = User.id AND Donations.status = 'completed'
    )`),
    'totalDonated'
  ];

  const donationCountLiteral = [
    sequelize.literal(`(
      SELECT COUNT(*)
      FROM Donations
      WHERE Donations.donorId = User.id AND Donations.status = 'completed'
    )`),
    'donationCount'
  ];

  const lastMessageLiteral = [
    sequelize.literal(`(
      SELECT message
      FROM Announcements
      WHERE Announcements.userId = User.id 
         OR Announcements.mobileNumber = User.mobileNumber
         OR Announcements.mobileNumber = CONCAT('91', User.mobileNumber)
         OR User.mobileNumber = CONCAT('91', Announcements.mobileNumber)
      ORDER BY Announcements.sentAt DESC
      LIMIT 1
    )`),
    'lastMessage'
  ];

  const lastMessageTimeLiteral = [
    sequelize.literal(`(
      SELECT sentAt
      FROM Announcements
      WHERE Announcements.userId = User.id 
         OR Announcements.mobileNumber = User.mobileNumber
         OR Announcements.mobileNumber = CONCAT('91', User.mobileNumber)
         OR User.mobileNumber = CONCAT('91', Announcements.mobileNumber)
      ORDER BY Announcements.sentAt DESC
      LIMIT 1
    )`),
    'lastMessageTime'
  ];

  if (Array.isArray(attributes)) {
    // If specific fields are requested, filter out virtual ones from main selection
    // and add them back as literals
    const baseFields = attributes.filter(f => !['donationCount', 'totalDonated', 'lastMessage', 'lastMessageTime'].includes(f));
    const includeLiterals = [];
    if (attributes.includes('totalDonated')) includeLiterals.push(totalDonatedLiteral);
    if (attributes.includes('donationCount')) includeLiterals.push(donationCountLiteral);
    if (attributes.includes('lastMessage')) includeLiterals.push(lastMessageLiteral);
    if (attributes.includes('lastMessageTime')) includeLiterals.push(lastMessageTimeLiteral);
    
    attributes = [...baseFields, ...includeLiterals];
  } else {
    // Default behavior (fetch all + virtual fields)
    attributes = {
      include: [totalDonatedLiteral, donationCountLiteral, lastMessageLiteral, lastMessageTimeLiteral]
    };
  }

  const { count, rows: donors } = await User.scope(sanitizedScopes).findAndCountAll({
    where: donorWhere,
    attributes,
    order: [
      [sequelize.literal(`(
        SELECT COALESCE(MAX(sentAt), '1970-01-01')
        FROM Announcements
        WHERE Announcements.userId = User.id
      )`), 'DESC'],
      requestedFields ? [sequelize.literal('donationCount'), 'DESC'] : [sequelize.literal('totalDonated'), 'DESC'],
      ['name', 'ASC']
    ],
    limit: queryLimit,
    offset
  });

  // Apply amount filters if present (since totalDonated is a virtual field)
  let filteredDonors = donors;
  if (minAmount || maxAmount) {
    filteredDonors = donors.filter(d => {
      const total = parseFloat(d.getDataValue('totalDonated'));
      if (minAmount && total < parseFloat(minAmount)) return false;
      if (maxAmount && total > parseFloat(maxAmount)) return false;
      return true;
    });
  }

  const responseData = getPaginatedResponse({
    rows: filteredDonors,
    count: minAmount || maxAmount ? filteredDonors.length : count,
    limit,
    page,
    isFetchAll,
  });

  return sendSuccess(res, responseData, 'All donors records fetched successfully');
});

// 4. Update Donation
export const updateDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, cause, status, paymentMode, paymentDate, categoryId, locationId, paidAmount, remainingAmount, notes, slipNo } = req.body;

  const donation = await Donation.findByPk(id);
  if (!donation) {
    throw notFound('Donation');
  }

  const nextAmount = amount ?? donation.amount;
  const nextPaymentMode = paymentMode || donation.paymentMode;
  const nextStatus = status || donation.status;
  const incomingPaidAmount = paidAmount !== undefined && paidAmount !== null ? Number(paidAmount) : null;
  const incomingRemainingAmount = remainingAmount !== undefined && remainingAmount !== null ? Number(remainingAmount) : null;

  const updateData = {
    amount: nextAmount,
    cause: cause || donation.cause,
    status: nextStatus,
    paymentMode: nextPaymentMode,
    paymentDate: paymentDate || donation.paymentDate,
    categoryId: categoryId || donation.categoryId,
    locationId: locationId || donation.locationId,
    slipNo: slipNo || donation.slipNo,
  };

  if (nextStatus === 'partially_paid') {
    const currentPaidAmount = Number(donation.paidAmount || 0);
    const finalPaidAmount = incomingRemainingAmount !== null
      ? Number(nextAmount) - incomingRemainingAmount
      : (incomingPaidAmount !== null ? incomingPaidAmount : currentPaidAmount);

    if (!Number.isFinite(finalPaidAmount) || finalPaidAmount <= 0) {
      throw badRequest('Paid amount is required for partially paid donations');
    }
    if (finalPaidAmount > Number(nextAmount)) {
      throw badRequest('Paid amount cannot exceed total donation amount');
    }

    updateData.paidAmount = finalPaidAmount;
    updateData.remainingAmount = Number(nextAmount) - finalPaidAmount;
    updateData.status = finalPaidAmount === Number(nextAmount) ? 'completed' : 'partially_paid';
    if (finalPaidAmount === Number(nextAmount) && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }
  } else if (incomingPaidAmount !== null || incomingRemainingAmount !== null) {
    const finalPaidAmount = incomingRemainingAmount !== null
      ? Number(nextAmount) - incomingRemainingAmount
      : incomingPaidAmount;

    if (!Number.isFinite(finalPaidAmount) || finalPaidAmount < 0) {
      throw badRequest('Invalid paid amount');
    }
    if (finalPaidAmount > Number(nextAmount)) {
      throw badRequest('Paid amount cannot exceed total donation amount');
    }

    updateData.paidAmount = finalPaidAmount;
    updateData.remainingAmount = Number(nextAmount) - finalPaidAmount;
    updateData.status = finalPaidAmount === Number(nextAmount) ? 'completed' : 'partially_paid';
    if (finalPaidAmount === Number(nextAmount) && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }
  }

  // If status is being updated to completed and it wasn't before
  const wasNotCompleted = donation.status !== 'completed';
  if (updateData.status === 'completed' && wasNotCompleted && !updateData.paymentDate) {
    updateData.paymentDate = new Date();
  }

  // Create installment record if paid amount increased
  if (updateData.paidAmount !== undefined) {
    const currentPaid = Number(donation.paidAmount || 0);
    const newPaid = Number(updateData.paidAmount);
    if (newPaid > currentPaid) {
      await DonationInstallment.create({
        donationId: donation.id,
        amount: newPaid - currentPaid,
        paymentMode: nextPaymentMode,
        paymentDate: new Date(),
        notes: notes || (updateData.status === 'completed' ? 'Final payment' : 'Partial payment installment')
      });
    }
  }

  await donation.update(updateData);

  // Manage reminders if status changed to partially_paid or completed
  if (updateData.status === 'partially_paid' || updateData.status === 'completed') {
    await managePartialPaymentReminder(donation.id, donation.donorId, updateData.status);
  }

  // Generate slip/email/SMS in background when donation becomes fully completed
  if (updateData.status === 'completed' && wasNotCompleted) {
    // Run background tasks without awaiting them to speed up response
    (async () => {
      try {
        const donor = await User.findByPk(donation.donorId);
        if (donor) {
          const [gaushala, katha] = await Promise.all([
            donation.gaushalaId ? Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null,
            donation.kathaId ? Katha.findByPk(donation.kathaId) : null,
          ]);

          let locationAddress = '';
          if (donation.locationId) {
            const loc = await Location.findByPk(donation.locationId, {
              include: [{ model: Location, as: 'parent', include: [{ model: Location, as: 'parent' }] }]
            });
            locationAddress = formatLocationAddress(loc);
          }

          const pdfBuffer = await generateDonationSlipBuffer(
            donor, 
            donation.amount, 
            donation.cause, 
            donation.id, 
            donation.paymentMode, 
            donation.paymentDate, 
            gaushala, 
            katha,
            locationAddress,
            donation.slipNo || '-'
          );
          
          const tasks = [];

          // Upload to Cloudinary with Retry
          const uploadTask = retryAction(async () => {
            const cloudinaryUrl = await uploadSlipToCloudinary(pdfBuffer, donor.name, donor.mobileNumber, donation.id);
            await donation.update({ slipUrl: cloudinaryUrl });
            
            // Send WhatsApp notification with PDF slip
            if (donor.mobileNumber) {
              const category = donation.categoryId ? await Category.findByPk(donation.categoryId) : null;
              const categoryName = category?.name || donation.cause || 'ગૌસેવા';
              
              let locationName = '';
              if (donation.locationId) {
                const loc = await Location.findByPk(donation.locationId);
                locationName = loc?.nameGuj || loc?.name || 'કોબડી';
              } else {
                locationName = donor.city || donor.state || donor.country || 'કોબડી';
              }

              await retryAction(
                () => sendDetailedDonationSuccessWhatsAppPDF(donor.mobileNumber, donor.name, donation.amount, categoryName, locationName, cloudinaryUrl),
                `WhatsApp Update [Donation ${donation.id}]`
              );
            }
            return cloudinaryUrl;
          }, `Cloudinary Update [Donation ${donation.id}]`);
          
          tasks.push(uploadTask);

          // Email Notification with Retry
          if (isValidEmail(donor.email)) {
            const emailHtml = getDonationEmailTemplate(donor.name, donation.amount, donation.cause, donation.id);
            const emailTask = retryAction(
              () => sendEmail(donor.email, 'Donation Received - Thank You!', emailHtml, [
                { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
              ]),
              `Email Update [Donation ${donation.id}]`
            );
            tasks.push(emailTask);
          }

          await Promise.all(tasks);
        }
      } catch (slipError) {
        console.error(`[Donation ${donation.id}] ❌ Post-update background tasks failed:`, slipError);
      }
    })();
  }

  return sendSuccess(res, donation, 'Donation updated successfully');
});

// 5. Resend Donation Slip WhatsApp
export const resendSlipWhatsApp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findByPk(id, {
    include: [
      { model: User, as: 'donor' },
      { model: Category, as: 'category' }
    ]
  });

  if (!donation) throw notFound('Donation');
  if (donation.status !== 'completed') throw badRequest('WhatsApp slip can only be sent for completed donations');
  if (!donation.slipUrl) throw notFound('Donation slip. Please regenerate or contact support.');
  if (!donation.donor?.mobileNumber) throw notFound('Donor mobile number');

  const donor = donation.donor;
  const categoryName = donation.category?.name || donation.cause || 'ગૌસેવા';
  const locationName = donor.city || donor.state || donor.country || 'કોબડી';

  await sendDetailedDonationSuccessWhatsAppPDF(
    donor.mobileNumber, 
    donor.name, 
    donation.amount, 
    categoryName, 
    locationName, 
    donation.slipUrl
  );

  return sendSuccess(res, null, 'WhatsApp message resent successfully');
});
