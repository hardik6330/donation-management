import { Donation, DonationInstallment, User, Category, Gaushala, Katha, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';
import { sendEmail, getDonationEmailTemplate, isValidEmail } from '../utils/services/email.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from '../utils/services/whatsapp.service.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from '../utils/services/donationSlip.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';
import logger from '../utils/logger.js';
import { retryAction, managePartialPaymentReminder } from '../utils/donationHelpers.js';

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
    distinct: true,
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

export const getDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const donation = await Donation.findByPk(id, { attributes: ['id', 'slipUrl'] });
  if (!donation) throw notFound('Donation');
  return sendSuccess(res, { ready: !!donation.slipUrl, slipUrl: donation.slipUrl || null });
});

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

  const activeScopes = ['donor'];
  if (search) activeScopes.push({ method: ['search', search] });

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

  const sanitizedScopes = activeScopes.filter(scope => scope !== null && scope !== undefined);

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
    const baseFields = attributes.filter(f => !['donationCount', 'totalDonated', 'lastMessage', 'lastMessageTime'].includes(f));
    const includeLiterals = [];
    if (attributes.includes('totalDonated')) includeLiterals.push(totalDonatedLiteral);
    if (attributes.includes('donationCount')) includeLiterals.push(donationCountLiteral);
    if (attributes.includes('lastMessage')) includeLiterals.push(lastMessageLiteral);
    if (attributes.includes('lastMessageTime')) includeLiterals.push(lastMessageTimeLiteral);

    attributes = [...baseFields, ...includeLiterals];
  } else {
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

export const updateDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, cause, status, paymentMode, paymentDate, categoryId, paidAmount, remainingAmount, notes, slipNo } = req.body;

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
  }

  const wasNotCompleted = donation.status !== 'completed';

  if (updateData.paidAmount !== undefined) {
    const currentPaid = Number(donation.paidAmount || 0);
    const newPaid = Number(updateData.paidAmount);
    if (newPaid > currentPaid) {
      const installmentDate = paymentDate ? new Date(paymentDate) : null;
      await DonationInstallment.create({
        donationId: donation.id,
        amount: newPaid - currentPaid,
        paymentMode: nextPaymentMode,
        paymentDate: installmentDate,
        notes: notes || (updateData.status === 'completed' ? 'Final payment' : 'Partial payment installment')
      });
      if (installmentDate) updateData.paymentDate = installmentDate;
    }
  }

  await donation.update(updateData);

  if (updateData.status === 'partially_paid' || updateData.status === 'completed') {
    await managePartialPaymentReminder(donation.id, donation.donorId, updateData.status);
  }

  if (updateData.status === 'completed' && wasNotCompleted) {
    (async () => {
      try {
        const donor = await User.findByPk(donation.donorId);
        if (donor) {
          const [gaushala, katha] = await Promise.all([
            donation.gaushalaId ? Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null,
            donation.kathaId ? Katha.findByPk(donation.kathaId) : null,
          ]);

          const locationAddress = '';

          const pdfBuffer = await generateDonationSlipBuffer(
            donor,
            donation.amount,
            donation.cause,
            donation.id,
            donation.paymentMode,
            donation.donationDate || donation.paymentDate,
            gaushala,
            katha,
            locationAddress,
            donation.slipNo || '-'
          );

          const tasks = [];

          const uploadTask = retryAction(async () => {
            const cloudinaryUrl = await uploadSlipToCloudinary(pdfBuffer, donor.name, donor.mobileNumber, donation.id);
            await donation.update({ slipUrl: cloudinaryUrl });

            if (donor.mobileNumber) {
              const category = donation.categoryId ? await Category.findByPk(donation.categoryId) : null;
              const categoryName = category?.name || donation.cause || 'ગૌસેવા';

              const locationName = donor.city || donor.state || donor.country || 'કોબડી';

              await retryAction(
                () => sendDetailedDonationSuccessWhatsAppPDF(donor.mobileNumber, donor.name, donation.amount, categoryName, locationName, cloudinaryUrl),
                `WhatsApp Update [Donation ${donation.id}]`
              );
            }
            return cloudinaryUrl;
          }, `Cloudinary Update [Donation ${donation.id}]`);

          tasks.push(uploadTask);

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
        logger.error(`[Donation ${donation.id}] Post-update background tasks failed:`, slipError);
      }
    })();
  }

  return sendSuccess(res, donation, 'Donation updated successfully');
});
