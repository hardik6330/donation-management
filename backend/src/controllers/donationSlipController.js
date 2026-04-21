import { Donation, User, Category } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from '../utils/services/whatsapp.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';

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
