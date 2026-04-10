import { User } from '../models/user.js';
import { Donation } from '../models/donation.js';
import { Location } from '../models/location.js';
import { Gaushala } from '../models/gaushala.js';
import { Katha } from '../models/katha.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { Op, fn, col } from 'sequelize';

export const getAdminStats = async (req, res) => {
  try {
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
  } catch (error) {
    return sendError(res, 'Error fetching admin stats', 500, error);
  }
};

export const getAllDonationsAdmin = async (req, res) => {
  try {
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
  } catch (error) {
    return sendError(res, 'Error fetching donations', 500, error);
  }
};
