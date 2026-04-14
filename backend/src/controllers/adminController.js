import { User, Donation, Gaushala, Katha } from '../models/index.js';
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
  const { mobileNumber, message, templateName, userId } = req.body;

  if (!mobileNumber || !templateName) {
    throw badRequest('Mobile number and template name are required');
  }

  // Find user to get name if available
  const user = userId ? await User.findByPk(userId) : null;
  const userName = user?.name || 'Donor';

  // Prepare components for 'general_notification' template
  // Assuming template: "શ્રી સર્વેશ્વર ગૌધામ: {{1}} બાપજી. {{2}}"
  // Or whatever the template structure is. 
  // Based on screenshot, general_notification has "શ્રી સર્વેશ્વર ગૌધામ: {{1}} બાપજી."
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: userName },
        { type: 'text', text: message }
      ]
    }
  ];

  const result = await sendWhatsAppMessage(mobileNumber, templateName, 'gu', components);

  if (result.success) {
    return sendSuccess(res, result.data, 'Announcement sent successfully');
  } else {
    throw badRequest(result.error?.message || 'Failed to send WhatsApp message');
  }
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
        attributes: ['name', 'email', 'village', 'district']
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
      village: topDonor.donor?.village || '-',
      district: topDonor.donor?.district || '-'
    };
  } else {
    stats.topDonor = null;
  }

  return sendSuccess(res, stats, 'Admin stats fetched successfully');
});

export const getAllDonationsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
  const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');

  const { whereClause } = await buildDonationFilter(req.query, '$donor.');

  const { count, rows: donations } = await Donation.findAndCountAll({
    where: whereClause,
    attributes: mainAttributes,
    include: [
      {
        model: User,
        as: 'donor',
        attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'village', 'district']
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
    subQuery: false, // Essential when filtering by associated model fields
  });

  const responseData = getPaginatedResponse({
    rows: donations,
    count,
    limit,
    page,
    isFetchAll,
    dataKey: 'donations'
  });

  return sendSuccess(res, responseData, 'All donations records fetched successfully');
});
