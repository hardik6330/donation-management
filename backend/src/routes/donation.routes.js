import express from 'express';
import { createDonationOrder, verifyPayment, getDonations, generateQRCode } from '../controllers/donationController.js';

const router = express.Router();

router.get('/qr', generateQRCode);
router.post('/order', createDonationOrder);
router.post('/verify', verifyPayment);
router.get('/', getDonations);

export default router;
