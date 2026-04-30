import { Donation, DonationInstallment, User, Category, Gaushala, Katha, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from '../utils/services/whatsapp.service.js';
import {
  generateDonationSlipBuffer,
  uploadSlipToCloudinary,
  deleteFileFromCloudinary
} from '../utils/services/donationSlip.service.js';
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

export const generateInstallmentSlip = asyncHandler(async (req, res) => {
  const { id, installmentId } = req.params;

  const installment = await DonationInstallment.findOne({ where: { id: installmentId, donationId: id } });
  if (!installment) throw notFound('Installment');

  const donation = await Donation.findByPk(id);
  if (!donation) throw notFound('Donation');

  const donor = await User.findByPk(donation.donorId);
  if (!donor) throw notFound('Donor');

  const [gaushala, katha, category] = await Promise.all([
    donation.gaushalaId ? Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null,
    donation.kathaId ? Katha.findByPk(donation.kathaId) : null,
    donation.categoryId ? Category.findByPk(donation.categoryId) : null,
  ]);

  if (installment.slipUrl) {
    try { await deleteFileFromCloudinary(installment.slipUrl); } catch { /* ignore */ }
  }

  const slipLabel = installment.slipNo || 'Part';
  const pdfBuffer = await generateDonationSlipBuffer(
    donor,
    installment.amount,
    donation.cause,
    installment.id,
    installment.paymentMode,
    installment.paymentDate || donation.paymentDate,
    gaushala,
    katha,
    '',
    slipLabel,
    category?.name || '',
    installment.notes || ''
  );

  const cloudinaryUrl = await uploadSlipToCloudinary(
    pdfBuffer,
    `${donor.name || 'donor'}_${slipLabel.replace(/\s+/g, '_')}`,
    donor.mobileNumber || 'na',
    installment.id
  );

  await installment.update({ slipUrl: cloudinaryUrl });

  return sendSuccess(res, { id: installment.id, slipUrl: cloudinaryUrl, slipNo: installment.slipNo }, 'Installment slip generated');
});
