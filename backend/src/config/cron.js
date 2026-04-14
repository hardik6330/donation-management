import { connectDB } from './db.js';
import '../models/index.js';
import { processPendingNotifications } from '../utils/services/notification.service.js';

/**
 * Cron Job script to process pending notifications.
 * This should be executed by a system cron (e.g., crontab) or a cloud scheduler.
 */
const runCron = async () => {
  console.log('⏰ [Cron] Starting scheduled notification job...');
  
  try {
    // 1. Connect to database
    await connectDB();
    console.log('✅ [Cron] Connected to database.');

    // 2. Process notifications
    const results = await processPendingNotifications();
    
    console.log('✅ [Cron] Job completed successfully:', results);
    process.exit(0);
  } catch (error) {
    console.error('❌ [Cron] Job failed with error:', error);
    process.exit(1);
  }
};

// Execute the cron job
runCron();
