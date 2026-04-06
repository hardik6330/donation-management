import { Donation } from '../models/donation.js';
import { User } from '../models/user.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { FRONTEND_URL } from '../config/db.js';

// 1. QR Code Generate Karo
export const generateQRCode = async (req, res) => {
  try {
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
    const { amount, cause, name, email, address, village, district, companyName, mobileNumber } = req.body;

    // Check user (create if not exist or just save details with donation)
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({ name, email, address, village, district, companyName, mobileNumber, password: 'temporary_password_123' });
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const donation = await Donation.create({
      donorId: user.id,
      amount,
      cause,
      razorpay_order_id: order.id,
      status: 'pending',
    });

    return sendSuccess(res, { order, donationId: donation.id }, 'Razorpay order created successfully');
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
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const donation = await Donation.findByPk(donationId);
      if (!donation) return sendError(res, 'Donation not found', 404);

      await donation.update({
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      });

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

    const { count, rows: donations } = await Donation.findAndCountAll({
      attributes: mainAttributes,
      include: [{ 
        model: User, 
        as: 'donor', 
        attributes: includeAttributes || ['name', 'email'] 
      }],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset: offset,
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
    return sendError(res, 'Error fetching donations', 500, error);
  }
};
