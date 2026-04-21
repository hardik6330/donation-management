import { Notification } from '../models/index.js';
import logger from './logger.js';

const REMINDER_DAYS_AFTER = 5;
const REMINDER_HOUR_OF_DAY = 10;

export const retryAction = async (action, label, attempts = 3, delay = 5000) => {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await action();
    } catch (err) {
      logger.error(`[Retry] ⚠️ ${label} attempt ${i} failed:`, err);
      if (i === attempts) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * i));
    }
  }
};

export const managePartialPaymentReminder = async (donationId, userId, status) => {
  try {
    if (status === 'partially_paid') {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + REMINDER_DAYS_AFTER);
      scheduledAt.setHours(REMINDER_HOUR_OF_DAY, 0, 0, 0);

      const [notification, created] = await Notification.findOrCreate({
        where: { donationId, type: 'partial_payment_reminder' },
        defaults: { userId, scheduledAt, status: 'pending' }
      });

      if (!created && notification.status !== 'sent') {
        await notification.update({ scheduledAt, status: 'pending' });
      }
    } else if (status === 'completed') {
      await Notification.update(
        { status: 'cancelled' },
        { where: { donationId, status: 'pending', type: 'partial_payment_reminder' } }
      );
    }
  } catch (error) {
    logger.error(`Error managing reminder for donation ${donationId}:`, error);
  }
};
