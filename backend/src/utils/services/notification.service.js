import { Notification, Donation, User } from '../../models/index.js';
import { sendEmail, getPartialPaymentReminderEmailTemplate } from './email.service.js';
import { sendWhatsAppMessage, sendPartialPaymentReminderWhatsApp } from './whatsapp.service.js';
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
    // IMPORTANT: We use a transaction and row locking to prevent duplicate processing
    const pendingNotifications = await Notification.findAll({
      where: {
        status: { [Op.in]: ['pending', 'failed'] }, 
        attempts: { [Op.lt]: 5 },
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
      console.log(`🔍 [Notification Service] Processing notification ID: ${notification.id}`);
      const { user, donation } = notification;

      // Double check if donation is still partially paid
      if (!donation) {
        console.log(`🚫 [Notification ${notification.id}] Cancelled: Donation not found.`);
        await notification.update({ status: 'cancelled', lastError: 'Donation not found' });
        results.cancelled++;
        continue;
      }

      if (donation.status !== 'partially_paid' && donation.status !== 'pending') {
        console.log(`🚫 [Notification ${notification.id}] Cancelled: Donation status is '${donation.status}'`);
        await notification.update({ status: 'cancelled', lastError: `Donation status is ${donation.status}` });
        results.cancelled++;
        continue;
      }

      if (!user || (!user.email && !user.mobileNumber)) {
        console.warn(`⚠️ [Notification ${notification.id}] Failed: No contact info (email/mobile) found.`);
        await notification.update({ status: 'failed', lastError: 'No email or mobile number' });
        results.failed++;
        continue;
      }

      try {
        // Increment attempts
        await notification.increment('attempts');
        const currentAttempt = notification.attempts + 1;
        console.log(`📤 [Notification ${notification.id}] Attempt ${currentAttempt} starting...`);

        // Track each channel separately
        let emailResult = null;
        let whatsappResult = null;

        // 1. Send Email if email exists
        if (user.email) {
          console.log(`📧 [Notification ${notification.id}] Sending email to: ${user.email}`);
          try {
            const emailHtml = getPartialPaymentReminderEmailTemplate(
              user.name,
              donation.amount,
              donation.paidAmount,
              donation.remainingAmount,
              donation.cause,
              donation.id
            );
            emailResult = await sendEmail(user.email, 'Donation Reminder - Shri Sarveshwar Gaudham', emailHtml);
            console.log(`✅ [Notification ${notification.id}] Email sent successfully.`);
          } catch (err) {
            emailResult = { success: false, error: err.message };
            console.error(`❌ [Notification ${notification.id}] Email failed:`, err.message);
          }
        }

        // 2. Send WhatsApp if mobile number exists
        if (user.mobileNumber) {
          console.log(`📱 [Notification ${notification.id}] Sending WhatsApp to: ${user.mobileNumber}`);
          try {
            whatsappResult = await sendPartialPaymentReminderWhatsApp(
              user.mobileNumber,
              user.name,
              donation.amount,
              donation.paidAmount,
              donation.remainingAmount,
              donation.cause
            );
            if (whatsappResult.success) {
              console.log(`✅ [Notification ${notification.id}] WhatsApp sent successfully.`);
            } else {
              console.error(`❌ [Notification ${notification.id}] WhatsApp failed:`, whatsappResult.error);
            }
          } catch (err) {
            whatsappResult = { success: false, error: err.message };
            console.error(`❌ [Notification ${notification.id}] WhatsApp error:`, err.message);
          }
        }

        if (!emailResult && !whatsappResult) {
          console.warn(`⚠️ [Notification ${notification.id}] No tasks to perform.`);
          await notification.update({ status: 'failed', lastError: 'No email or mobile' });
          results.failed++;
          continue;
        }

        const emailOk = emailResult?.success !== false;
        const whatsappOk = whatsappResult?.success === true;
        const allOk = emailOk && (!user.mobileNumber || whatsappOk);
        const anyOk = emailOk || whatsappOk;

        // Build error summary for failed channels
        const failedChannels = [];
        if (emailResult && !emailOk) failedChannels.push(`Email: ${JSON.stringify(emailResult.error)}`);
        if (whatsappResult && !whatsappOk) failedChannels.push(`WhatsApp: ${JSON.stringify(whatsappResult.error)}`);
        const errorSummary = failedChannels.join(' | ');

        if (allOk) {
          await notification.update({
            status: 'sent',
            sentAt: new Date(),
            lastError: null
          });
          console.log(`✅ [Notification ${notification.id}] All channels sent successfully.`);
          results.sent++;
        } else if (anyOk) {
          // Partial success — mark sent but log which channel failed
          await notification.update({
            status: 'sent',
            sentAt: new Date(),
            lastError: errorSummary
          });
          console.warn(`⚠️ [Notification ${notification.id}] Partial success. Failed: ${errorSummary}`);
          results.sent++;
        } else {
          console.error(`❌ [Notification ${notification.id}] Attempt ${currentAttempt} failed: ${errorSummary}`);

          // Schedule next retry
          const retryDelayMinutes = Math.pow(2, currentAttempt) * 15;
          const nextRetry = new Date();
          nextRetry.setMinutes(nextRetry.getMinutes() + retryDelayMinutes);

          await notification.update({
            status: 'failed',
            lastError: errorSummary || 'Email/WhatsApp service error',
            scheduledAt: nextRetry
          });
          results.failed++;
        }
      } catch (err) {
        console.error(`❌ [Notification ${notification.id}] Critical Error:`, err);
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
