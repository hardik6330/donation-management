import { Notification, Donation, User } from '../../models/index.js';
import { sendEmail, getPartialPaymentReminderEmailTemplate } from './email.service.js';
import { sendWhatsAppMessage } from './whatsapp.service.js';
import { Op } from 'sequelize';

/**
 * Processes all pending notifications that are due to be sent.
 * This can be called by a cron job or a scheduled worker.
 */
export const processPendingNotifications = async () => {
  console.log('🔔 [Notification Service] Starting notification processing...');
  
  const now = new Date();
  
  try {
    // 1. Fetch pending/failed notifications that are due and haven't exceeded max attempts (e.g. 5)
    const pendingNotifications = await Notification.findAll({
      where: {
        status: { [Op.in]: ['pending', 'failed'] },
        attempts: { [Op.lt]: 5 }, // Increased to 5 attempts
        scheduledAt: { [Op.lte]: now }
      },
      include: [
        { model: User, as: 'user' },
        { model: Donation, as: 'donation' }
      ]
    });

    console.log(`🔔 [Notification Service] Found ${pendingNotifications.length} notifications to process.`);

    const results = {
      total: pendingNotifications.length,
      sent: 0,
      failed: 0,
      cancelled: 0
    };

    for (const notification of pendingNotifications) {
      const { user, donation } = notification;

      // Double check if donation is still partially paid
      if (!donation || (donation.status !== 'partially_paid' && donation.status !== 'pending')) {
        console.log(`🚫 [Notification ${notification.id}] Cancelled: Donation status is ${donation?.status}`);
        await notification.update({ status: 'cancelled' });
        results.cancelled++;
        continue;
      }

      if (!user || (!user.email && !user.mobileNumber)) {
        console.warn(`⚠️ [Notification ${notification.id}] Skipped: No contact info found for user.`);
        await notification.update({ status: 'failed', lastError: 'No email or mobile number' });
        results.failed++;
        continue;
      }

      try {
        // Increment attempts
        await notification.increment('attempts');
        const currentAttempt = notification.attempts + 1;

        const tasks = [];

        // 1. Send Email if email exists
        if (user.email) {
          const emailHtml = getPartialPaymentReminderEmailTemplate(
            user.name,
            donation.amount,
            donation.paidAmount,
            donation.remainingAmount,
            donation.cause,
            donation.id
          );
          tasks.push(sendEmail(user.email, 'Donation Reminder - Shri Sarveshwar Gaudham', emailHtml));
        }

        // 2. Send WhatsApp if mobile number exists
        if (user.mobileNumber) {
          const waComponents = [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: user.name },
                { type: 'text', text: donation.amount.toString() },
                { type: 'text', text: donation.cause },
                { type: 'text', text: donation.remainingAmount.toString() }
              ]
            }
          ];
          tasks.push(sendWhatsAppMessage(user.mobileNumber, 'partial_payment_reminder', 'en_US', waComponents));
        }

        const taskResults = await Promise.allSettled(tasks);
        const anySuccess = taskResults.some(r => r.status === 'fulfilled' && r.value.success);

        if (anySuccess) {
          await notification.update({
            status: 'sent',
            sentAt: new Date(),
            lastError: null
          });
          console.log(`✅ [Notification ${notification.id}] Sent successfully.`);
          results.sent++;
        } else {
          const errors = taskResults
            .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
            .map(r => r.status === 'rejected' ? r.reason.message : (r.value.error || 'Unknown error'))
            .join(' | ');

          console.error(`❌ [Notification ${notification.id}] Attempt ${currentAttempt} failed: ${errors}`);
          
          // Schedule next retry (e.g., after 30 mins, 1 hour, 2 hours...)
          const retryDelayMinutes = Math.pow(2, currentAttempt) * 15; // Exponential backoff: 30, 60, 120 mins
          const nextRetry = new Date();
          nextRetry.setMinutes(nextRetry.getMinutes() + retryDelayMinutes);

          await notification.update({ 
            status: 'failed', 
            lastError: errors || 'Email/WhatsApp service error',
            scheduledAt: nextRetry // Update scheduledAt for next retry
          });
          results.failed++;
        }
      } catch (err) {
        console.error(`❌ [Notification ${notification.id}] Error:`, err);
        await notification.update({ 
          status: 'failed', 
          lastError: err.message || 'Unknown error' 
        });
        results.failed++;
      }
    }

    console.log('🔔 [Notification Service] Processing completed:', results);
    return results;
  } catch (error) {
    console.error('❌ [Notification Service] Critical Error during processing:', error);
    throw error;
  }
};
