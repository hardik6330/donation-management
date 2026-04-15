import express from 'express';
import { 
  getAdminStats, 
  getAllDonationsAdmin, 
  processRemindersAdmin,
  sendAnnouncement,
  getAnnouncementHistory
} from '../controllers/adminController.js';
import { getDonors } from '../controllers/donationController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Protected admin routes
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/donations', protect, adminOnly, getAllDonationsAdmin);
router.get('/donors', protect, adminOnly, getDonors);
router.get('/announcement/history', protect, adminOnly, getAnnouncementHistory);
router.post('/process-reminders', protect, adminOnly, processRemindersAdmin);
router.post('/announcement', protect, adminOnly, sendAnnouncement);

export default router;
