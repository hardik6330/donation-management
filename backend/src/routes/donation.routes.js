import express from 'express';
import {
  createDonationOrder,
  verifyPayment,
  getDonations,
  generateQRCode,
  updateDonation,
  getDonationInstallments,
  getDonationStatus,
  resendSlipWhatsApp
} from '../controllers/donationController.js';
import { validate } from '../utils/validators/validate.js';
import { donationSchema, donationUpdateSchema } from '../utils/validators/donation.validator.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.get('/qr', generateQRCode);
router.post('/order', validate(donationSchema), createDonationOrder);
router.post('/verify', verifyPayment);
router.get('/', getDonations);
router.get('/:id/installments', getDonationInstallments);
router.get('/:id/status', getDonationStatus);
router.put('/:id', validate(donationUpdateSchema), updateDonation);
router.post('/:id/resend-whatsapp', protect, adminOnly, resendSlipWhatsApp);

export default router;
