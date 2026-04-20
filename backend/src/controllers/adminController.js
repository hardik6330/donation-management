import { User, Donation, Gaushala, Katha, Announcement, Sevak } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { Op, fn, col } from 'sequelize';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { processPendingNotifications } from '../utils/services/notification.service.js';
import { sendWhatsAppMessage } from '../utils/services/whatsapp.service.js';
import { badRequest } from '../utils/httpError.js';

export const processRemindersAdmin = asyncHandler(async (req, res) => {
  const results = await processPendingNotifications();
  return sendSuccess(res, results, 'Reminder processing completed successfully');
});

export const sendAnnouncement = asyncHandler(async (req, res) => {
  const { mobileNumber, templateName, userId, variables, language, hasHeader, message, userType } = req.body;

  if (!mobileNumber || !templateName) {
    throw badRequest('Mobile number and template name are required');
  }

  // Find recipient to get name if available
  let recipient = null;
  if (userId) {
    if (userType === 'sevak') {
      recipient = await Sevak.findByPk(userId);
    } else {
      recipient = await User.findByPk(userId);
    }
  }
  
  const recipientName = recipient?.name || 'User';

  let components = [];

  if (variables) {
    // Build components from frontend template variables
    // Header component (for document/media templates)
    if (hasHeader && variables.pdfUrl) {
      components.push({
        type: 'header',
        parameters: [
          { type: 'document', document: { link: variables.pdfUrl, filename: 'Document.pdf' } }
        ]
      });
    }

    // Body parameters - build from variables in the order they appear in the template
    const bodyParams = [];
    if (variables.message) bodyParams.push({ type: 'text', text: variables.message });

    if (bodyParams.length > 0) {
      components.push({ type: 'body', parameters: bodyParams });
    }
  } else {
    // Legacy: simple message-based send
    components = [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: message || '-' }
        ]
      }
    ];
  }

  const result = await sendWhatsAppMessage(mobileNumber, templateName, language || 'gu', components);

  if (result.success) {
    try {
      // Save to Announcement history
      await Announcement.create({
        userId: userId || null,
        mobileNumber,
        message: variables?.message || message || '-',
        templateName,
        variables: variables || null,
        status: 'sent',
        sentAt: new Date()
      });
    } catch (dbError) {
      console.error('Error saving announcement to database:', dbError);
      // Don't fail the whole request if only history saving fails
    }

    return sendSuccess(res, result.data, 'Announcement sent successfully');
  } else {
    try {
      // Save failed attempt
      await Announcement.create({
        userId: userId || null,
        mobileNumber,
        message: variables?.message || message || '-',
        templateName,
        variables: variables || null,
        status: 'failed',
        sentAt: new Date()
      });
    } catch (dbError) {
      console.error('Error saving failed announcement to database:', dbError);
    }
    
    throw badRequest(result.error?.message || 'Failed to send WhatsApp message');
  }
});

export const getAnnouncementHistory = asyncHandler(async (req, res) => {
  const { userId, mobileNumber } = req.query;
  const { page, limit, offset } = getPaginationParams(req.query);

  const where = {};
  if (userId) where.userId = userId;
  if (mobileNumber) where.mobileNumber = mobileNumber;

  const { count, rows: history } = await Announcement.findAndCountAll({
    where,
    order: [['sentAt', 'DESC']],
    limit,
    offset
  });

  const responseData = getPaginatedResponse({
    rows: history,
    count,
    limit,
    page,
  });

  return sendSuccess(res, responseData, 'Announcement history fetched successfully');
});

export const getAdminStats = asyncHandler(async (req, res) => {
  // 1. Run queries in parallel for better performance
  const [totalUsersResult, totalDonationsData, topDonorData] = await Promise.all([
    // Total Unique Donors count
    Donation.count({
      where: { status: 'completed' },
      distinct: true,
      col: 'donorId'
    }),
    
    // Total Amount and Total Successful Donation Count
    Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'count']
      ],
      raw: true
    }),

    // Top Donor
    Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        'donorId',
        [fn('SUM', col('amount')), 'totalAmount']
      ],
      include: [{
        model: User,
        as: 'donor',
        attributes: ['name', 'email', 'city', 'state', 'country']
      }],
      group: ['donorId', 'donor.id'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      limit: 1,
      raw: true,
      nest: true
    })
  ]);

  const stats = {
    totalUsers: totalUsersResult,
    totalDonationAmount: parseFloat(totalDonationsData[0]?.totalAmount || 0),
    totalDonationCount: parseInt(totalDonationsData[0]?.count || 0)
  };

  if (topDonorData.length > 0) {
    const topDonor = topDonorData[0];
    stats.topDonor = {
      name: topDonor.donor?.name || 'Unknown',
      amount: parseFloat(topDonor.totalAmount),
      city: topDonor.donor?.city || '-',
      state: topDonor.donor?.state || '-'
    };
  } else {
    stats.topDonor = null;
  }

  return sendSuccess(res, stats, 'Admin stats fetched successfully');
});

export const getAllDonationsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');

  const {
    gaushalaId, kathaId, categoryId, status, 
    startDate, endDate, minAmount, maxAmount, search,
    city, state, country
  } = req.query;

  const activeScopes = [
    { method: ['byGaushala', gaushalaId] },
    { method: ['byKatha', kathaId] },
    { method: ['byCategory', categoryId] },
    { method: ['byStatus', status] },
    { method: ['byDateRange', startDate, endDate] },
    { method: ['byAmountRange', minAmount, maxAmount] },
    { method: ['searchDonor', search] },
    { method: ['byDonorLocation', city, state, country] }
  ].filter(s => s !== null && s !== undefined);

  const { count, rows: donations } = await Donation.scope(activeScopes).findAndCountAll({
    attributes: mainAttributes,
    include: [
      {
        model: User,
        as: 'donor',
        attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'city', 'state', 'country']
      },
      {
        model: Gaushala,
        as: 'gaushala',
        attributes: ['name']
      },
      {
        model: Katha,
        as: 'katha',
        attributes: ['name']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: queryLimit,
    offset: offset,
    distinct: true,
    subQuery: false,
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
