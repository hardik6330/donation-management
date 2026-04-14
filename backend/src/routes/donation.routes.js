import express from 'express';
import { createDonationOrder, verifyPayment, getDonations, generateQRCode, updateDonation } from '../controllers/donationController.js';
import { validate } from '../utils/validators/validate.js';
import { donationSchema } from '../utils/validators/donation.validator.js';

const router = express.Router();

router.get('/qr', generateQRCode);
router.post('/order', validate(donationSchema), createDonationOrder);
router.post('/verify', verifyPayment);
router.get('/', getDonations);
router.put('/:id', updateDonation);

export default router;
