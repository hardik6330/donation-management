import { User } from '../models/user.js';
import { Donation } from '../models/donation.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { Op, fn, col } from 'sequelize';

export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Unique Donors count (Only those who have completed at least one donation)
    const totalUsersResult = await Donation.count({
      where: { status: 'completed' },
      distinct: true,
      col: 'donorId'
    });

    // 2. Total Amount and Total Successful Donation Count
    const totalDonationsData = await Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('id')), 'count']
      ],
      raw: true
    });

    const stats = {
      totalUsers: totalUsersResult,
      totalDonationAmount: parseFloat(totalDonationsData[0]?.totalAmount || 0),
      totalDonationCount: parseInt(totalDonationsData[0]?.count || 0)
    };

    // 3. Top Donor (Person who has donated the maximum total amount)
    const topDonorData = await Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        'donorId',
        [fn('SUM', col('amount')), 'totalAmount']
      ],
      group: ['donorId'],
      order: [[fn('SUM', col('amount')), 'DESC']],
      limit: 1,
      raw: true
    });

    if (topDonorData.length > 0) {
      const topDonorInfo = await User.findByPk(topDonorData[0].donorId, {
        attributes: ['name', 'email', 'village', 'district']
      });
      stats.topDonor = {
        name: topDonorInfo?.name || 'Unknown',
        amount: parseFloat(topDonorData[0].totalAmount),
        village: topDonorInfo?.village || '-',
        district: topDonorInfo?.district || '-'
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
    const { search, startDate, endDate, minAmount, maxAmount, categoryId, status } = req.query;
    const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
    const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');

    let whereClause = {};

    // 1. Search Filter (by donor name, email or mobileNumber)
    if (search) {
      whereClause[Op.or] = [
        { '$donor.name$': { [Op.like]: `%${search}%` } },
        { '$donor.email$': { [Op.like]: `%${search}%` } },
        { '$donor.mobileNumber$': { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Date Filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
      };
    } else if (startDate) {
      whereClause.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      whereClause.createdAt = { [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // 3. Amount Filter
    if (minAmount && maxAmount) {
      whereClause.amount = { [Op.between]: [Number(minAmount), Number(maxAmount)] };
    } else if (minAmount) {
      whereClause.amount = { [Op.gte]: Number(minAmount) };
    } else if (maxAmount) {
      whereClause.amount = { [Op.lte]: Number(maxAmount) };
    }

    // 4. Status Filter
    if (status) {
      whereClause.status = status;
    }

    // 5. Category Filter
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const { count, rows: donations } = await Donation.findAndCountAll({
      where: whereClause,
      attributes: mainAttributes,
      include: [{
        model: User,
        as: 'donor',
        attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'village', 'district']
      }],
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

    return sendSuccess(res, responseData, 'All donations fetched successfully');
  } catch (error) {
    return sendError(res, 'Error fetching donations', 500, error);
  }
};
