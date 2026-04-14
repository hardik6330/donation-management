import cron from 'node-cron';
import { connectDB } from './db.js';
import '../models/index.js';
import { processPendingNotifications } from '../utils/services/notification.service.js';

/**
 * Cron Job script to process pending notifications.
 * Runs every 5 minutes.
 */
export const startCronJob = () => {
  console.log('⏰ [Cron] Notification scheduler initialized (Every 1 minutes)');

  cron.schedule('*/1 * * * *', async () => {
    console.log('⏰ [Cron] Running scheduled notification job...');
    
    try {
      // Process notifications
      const results = await processPendingNotifications();
      console.log('✅ [Cron] Job completed successfully:', results);
    } catch (error) {
      console.error('❌ [Cron] Job failed with error:', error);
    }
  });
};
