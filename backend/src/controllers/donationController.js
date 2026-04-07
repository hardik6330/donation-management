import { Donation } from '../models/donation.js';
import { User } from '../models/user.js';
import { Category } from '../models/category.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { FRONTEND_URL, RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } from '../config/db.js';
import { Op } from 'sequelize';
import { sendEmail, getDonationEmailTemplate } from '../utils/emailService.js';

// 1. QR Code Generate Karo
export const generateQRCode = async (req, res) => {
  try {
    console.log(FRONTEND_URL);
    const frontendURL = FRONTEND_URL + '/donate';

    const qrCodeData = await QRCode.toDataURL(frontendURL);
    return sendSuccess(res, { qrCodeData, frontendURL }, 'QR code generated successfully');
  } catch (error) {
    return sendError(res, 'Error generating QR code', 500, error);
  }
};

// 2. Razorpay Order Create Karo
export const createDonationOrder = async (req, res) => {
  try {
    const { 
      amount, 
      name, 
      email, 
      address, 
      village,
      district,
      villageId, 
      talukaId, 
      cityId, 
      categoryId, 
      companyName, 
      mobileNumber, 
      paymentMode 
    } = req.body;

    // 1. Generate Cause String based on Category and Location IDs
    let causeString = '';
    let categoryName = 'General Donation';
    let locationName = '';

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (category) categoryName = category.name;
    }

    // Determine the most specific location provided (Village > Taluka > City)
    const targetLocationId = villageId || talukaId || cityId;
    if (targetLocationId) {
      const location = await Location.findByPk(targetLocationId, {
        include: [{ 
          model: Location, 
          as: 'parent',
          include: [{ model: Location, as: 'parent' }] 
        }]
      });
      
      if (location) {
        // Build location path: "Village, Taluka, City"
        const parts = [location.name];
        let current = location.parent;
        while (current) {
          parts.push(current.name);
          current = current.parent;
        }
        locationName = parts.join(', ');
      }
    }

    // Example Cause: "Education Donation for Village, Taluka, City"
    causeString = `${categoryName}${locationName ? ` for ${locationName}` : ''}`;

    // 2. Check user (create or update if exists)
    let user = await User.findOne({ where: { mobileNumber } });
    if (!user) {
      user = await User.create({ 
        name, 
        email, 
        address, 
        village,
        district,
        companyName, 
        mobileNumber, 
        password: 'temporary_password_123',
        cityId,
        talukaId,
        villageId
      });
    } else {
      // Update existing user details if provided
      await user.update({
        name: name || user.name,
        email: email || user.email,
        address: address || user.address,
        village: village || user.village,
        district: district || user.district,
        companyName: companyName || user.companyName,
        cityId: cityId || user.cityId,
        talukaId: talukaId || user.talukaId,
        villageId: villageId || user.villageId
      });
    }

    // 3. Handle Donation creation
    const donationData = {
      donorId: user.id,
      amount,
      cause: causeString,
      categoryId,
      locationId: targetLocationId,
      paymentMode,
      status: paymentMode === 'cash' ? 'completed' : 'pending',
      paymentDate: paymentMode === 'cash' ? new Date() : null,
    };

    if (paymentMode === 'cash' || paymentMode === 'pay_later') {
      const donation = await Donation.create(donationData);
      
      // Send Email for Cash Donation
      if (paymentMode === 'cash' && user.email) {
        const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
        sendEmail(user.email, 'Donation Received - Thank You!', emailHtml);
      }

      const message = paymentMode === 'cash' 
        ? 'Cash donation recorded successfully' 
        : 'Donation intent recorded (Pay Later)';
      return sendSuccess(res, { donationId: donation.id, paymentMode }, message);
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const donation = await Donation.create({
      ...donationData,
      razorpay_order_id: order.id,
    });

    return sendSuccess(res, { 
      order, 
      donationId: donation.id, 
      razorpay_key_id: RAZORPAY_KEY_ID, 
      paymentMode: 'online' 
    }, 'Razorpay order created successfully');
  } catch (error) {
    console.error('❌ [createDonationOrder] Error:', error);
    return sendError(res, 'Error creating donation order', 500, error);
  }
};

// 3. Payment Verify Karo
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const donation = await Donation.findByPk(donationId);
      if (!donation) return sendError(res, 'Donation not found', 404);

      // Fetch donor info for email
      const donor = await User.findByPk(donation.donorId);

      await donation.update({
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        paymentDate: new Date(),
      });

      // Send Success Email
      if (donor && donor.email) {
        const emailHtml = getDonationEmailTemplate(donor.name, donation.amount, donation.cause, donation.id);
        sendEmail(donor.email, 'Donation Successful - Thank You!', emailHtml);
      }

      return sendSuccess(res, donation, 'Payment verified successfully');
    } else {
      const donation = await Donation.findByPk(donationId);
      if (donation) await donation.update({ status: 'failed' });
      return sendError(res, 'Invalid signature', 400);
    }
  } catch (error) {
    return sendError(res, 'Error verifying payment', 500, error);
  }
};

export const getDonations = async (req, res) => {
  try {
    const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
    const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');
    const { search, startDate, endDate, status } = req.query;

    const where = {};
    const donorWhere = {};

    // 1. Search Logic (Name, Mobile, Email)
    if (search) {
      donorWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // 2. Date Filtering
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59, 999))]
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999)) };
    }

    // 3. Status Filtering
    if (status) {
      where.status = status;
    }

    const { count, rows: donations } = await Donation.findAndCountAll({
      where,
      attributes: mainAttributes,
      include: [{ 
        model: User, 
        as: 'donor', 
        where: Object.keys(donorWhere).length > 0 ? donorWhere : null,
        attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'village', 'district'] 
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
      dataKey: 'donations'
    });

    return sendSuccess(res, responseData, 'Donations fetched successfully');
  } catch (error) {
    console.error('❌ [getDonations] Error:', error);
    return sendError(res, 'Error fetching donations', 500, error);
  }
};

export const getDonors = async (req, res) => {
  try {
    const { search, name, mobileNumber, city } = req.query;

    let whereClause = {
      isAdmin: false
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    if (mobileNumber) {
      whereClause.mobileNumber = { [Op.like]: `%${mobileNumber}%` };
    }

    if (city) {
      whereClause[Op.or] = [
        ...(whereClause[Op.or] || []),
        { village: { [Op.like]: `%${city}%` } },
        { district: { [Op.like]: `%${city}%` } }
      ];
    }

    const donors = await User.findAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'email', 'mobileNumber', 'village', 'district', 'companyName', 'createdAt'
      ],
      include: [{
        model: Donation,
        attributes: [] // We only need the aggregate values
      }],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.col('Donations.id')), 'donationCount'],
          [sequelize.fn('SUM', sequelize.col('Donations.amount')), 'totalDonated']
        ]
      },
      group: ['User.id'],
      order: [[sequelize.literal('totalDonated'), 'DESC']]
    });

    return sendSuccess(res, donors, 'Donors fetched successfully');
  } catch (error) {
    console.error('❌ [getDonors] Error:', error);
    return sendError(res, 'Error fetching donors', 500, error);
  }
};

// 4. Update Donation
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, cause, status, paymentMode, paymentDate, categoryId, locationId } = req.body;

    const donation = await Donation.findByPk(id);
    if (!donation) {
      return sendError(res, 'Donation not found', 404);
    }

    const updateData = {
      amount: amount || donation.amount,
      cause: cause || donation.cause,
      status: status || donation.status,
      paymentMode: paymentMode || donation.paymentMode,
      paymentDate: paymentDate || donation.paymentDate,
      categoryId: categoryId || donation.categoryId,
      locationId: locationId || donation.locationId,
    };

    // If status is being updated to completed and it wasn't before
    if (status === 'completed' && donation.status !== 'completed' && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }

    await donation.update(updateData);

    return sendSuccess(res, donation, 'Donation updated successfully');
  } catch (error) {
    console.error('❌ [updateDonation] Error:', error);
    return sendError(res, 'Error updating donation', 500, error);
  }
};
