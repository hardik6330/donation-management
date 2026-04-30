import express from 'express';
import {
  getDonations,
  updateDonation,
  getDonationInstallments,
  getDonationStatus,
  getLatestSlipNo
} from '../controllers/donationController.js';
import {
  createDonationOrder,
  verifyPayment,
  generateQRCode
} from '../controllers/donationPaymentController.js';
import { resendSlipWhatsApp, generateInstallmentSlip } from '../controllers/donationSlipController.js';
import { validate } from '../validators/validate.js';
import { donationSchema, donationUpdateSchema } from '../validators/donation.validator.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.get('/qr', generateQRCode);
router.get('/latest-slip-no', protect, getLatestSlipNo);
router.post('/order', validate(donationSchema), createDonationOrder);
router.post('/verify', verifyPayment);
router.get('/', getDonations);
router.get('/:id/installments', getDonationInstallments);
router.get('/:id/status', getDonationStatus);
router.put('/:id', validate(donationUpdateSchema), updateDonation);
router.post('/:id/resend-whatsapp', protect, adminOnly, resendSlipWhatsApp);
router.post('/:id/installments/:installmentId/slip', protect, adminOnly, generateInstallmentSlip);

export default router;
