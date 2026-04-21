import { Notification, Donation, User } from '../../models/index.js';
import { sendEmail, getPartialPaymentReminderEmailTemplate } from './email.service.js';
import { sendWhatsAppMessage, sendPartialPaymentReminderWhatsApp } from './whatsapp.service.js';
import { Op } from 'sequelize';
import logger from '../logger.js';

export const processPendingNotifications = async () => {
  logger.info('[Notification Service] Starting notification processing...');

  const now = new Date();

  try {
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

    logger.info(`[Notification Service] Found ${pendingNotifications.length} notifications to process.`);

    const results = {
      total: pendingNotifications.length,
      sent: 0,
      failed: 0,
      cancelled: 0
    };

    for (const notification of pendingNotifications) {
      logger.info(`[Notification Service] Processing notification ID: ${notification.id}`);
      const { user, donation } = notification;

      if (!donation) {
        logger.info(`[Notification ${notification.id}] Cancelled: Donation not found.`);
        await notification.update({ status: 'cancelled', lastError: 'Donation not found' });
        results.cancelled++;
        continue;
      }

      if (donation.status !== 'partially_paid' && donation.status !== 'pending') {
        logger.info(`[Notification ${notification.id}] Cancelled: Donation status is '${donation.status}'`);
        await notification.update({ status: 'cancelled', lastError: `Donation status is ${donation.status}` });
        results.cancelled++;
        continue;
      }

      if (!user || (!user.email && !user.mobileNumber)) {
        logger.warn(`[Notification ${notification.id}] Failed: No contact info (email/mobile) found.`);
        await notification.update({ status: 'failed', lastError: 'No email or mobile number' });
        results.failed++;
        continue;
      }

      try {
        await notification.increment('attempts');
        const currentAttempt = notification.attempts + 1;
        logger.info(`[Notification ${notification.id}] Attempt ${currentAttempt} starting...`);

        let emailResult = null;
        let whatsappResult = null;

        if (user.email) {
          logger.info(`[Notification ${notification.id}] Sending email to: ${user.email}`);
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
            logger.info(`[Notification ${notification.id}] Email sent successfully.`);
          } catch (err) {
            emailResult = { success: false, error: err.message };
            logger.error(`[Notification ${notification.id}] Email failed:`, err.message);
          }
        }

        if (user.mobileNumber) {
          logger.info(`[Notification ${notification.id}] Sending WhatsApp to: ${user.mobileNumber}`);
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
              logger.info(`[Notification ${notification.id}] WhatsApp sent successfully.`);
            } else {
              logger.error(`[Notification ${notification.id}] WhatsApp failed:`, whatsappResult.error);
            }
          } catch (err) {
            whatsappResult = { success: false, error: err.message };
            logger.error(`[Notification ${notification.id}] WhatsApp error:`, err.message);
          }
        }

        if (!emailResult && !whatsappResult) {
          logger.warn(`[Notification ${notification.id}] No tasks to perform.`);
          await notification.update({ status: 'failed', lastError: 'No email or mobile' });
          results.failed++;
          continue;
        }

        const emailOk = emailResult?.success !== false;
        const whatsappOk = whatsappResult?.success === true;
        const allOk = emailOk && (!user.mobileNumber || whatsappOk);
        const anyOk = emailOk || whatsappOk;

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
          logger.info(`[Notification ${notification.id}] All channels sent successfully.`);
          results.sent++;
        } else if (anyOk) {
          await notification.update({
            status: 'sent',
            sentAt: new Date(),
            lastError: errorSummary
          });
          logger.warn(`[Notification ${notification.id}] Partial success. Failed: ${errorSummary}`);
          results.sent++;
        } else {
          logger.error(`[Notification ${notification.id}] Attempt ${currentAttempt} failed: ${errorSummary}`);

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
        logger.error(`[Notification ${notification.id}] Critical Error:`, err);
        await notification.update({
          status: 'failed',
          lastError: err.message || 'Unknown error'
        });
        results.failed++;
      }
    }

    logger.info('[Notification Service] Processing completed:', results);
    return results;
  } catch (error) {
    logger.error('[Notification Service] Critical Error during processing:', error);
    throw error;
  }
};
