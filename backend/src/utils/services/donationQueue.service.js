import { Queue, Worker } from 'bullmq';
import redis from '../../config/redis.js';
import { Donation, User, Category, Gaushala, Katha } from '../../models/index.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from './donationSlip.service.js';
import { sendEmail, getDonationEmailTemplate } from './email.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from './whatsapp.service.js';
import { sendDetailedDonationSMS } from './sms.service.js';
import logger from '../logger.js';

const QUEUE_NAME = 'donation-processing';

// 1. Initialize Queue
export const donationQueue = redis ? new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
}) : null;

// 2. Worker logic
if (redis) {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { donationId, userId, amount, categoryId, gaushalaId, kathaId, causeString, slipNo } = job.data;
      logger.info(`[Queue] 🚀 Starting process for Donation ID: ${donationId} | User ID: ${userId} | Slip No: ${slipNo}`);

      try {
        const donation = await Donation.findByPk(donationId);
        const user = await User.findByPk(userId);
        const category = categoryId ? await Category.findByPk(categoryId) : null;
        const gaushala = gaushalaId ? await Gaushala.findByPk(gaushalaId) : null;
        const katha = kathaId ? await Katha.findByPk(kathaId) : null;

        if (!donation) {
          logger.error(`[Queue] ❌ Donation not found: ${donationId}`);
          throw new Error(`Donation not found: ${donationId}`);
        }
        if (!user) {
          logger.error(`[Queue] ❌ User not found: ${userId}`);
          throw new Error(`User not found: ${userId}`);
        }

        // 1. Generate PDF
        logger.info(`[Queue] 📄 Generating PDF for Donation: ${donationId}...`);
        const locationAddress = user.city || user.state || user.country || '';
        const pdfBuffer = await generateDonationSlipBuffer(
          user,
          amount,
          causeString,
          donation.id,
          donation.paymentMode,
          donation.paymentDate,
          gaushala,
          katha,
          locationAddress,
          slipNo
        );
        logger.info(`[Queue] ✅ PDF generated successfully for Donation: ${donationId}`);

        // 2. Upload to Cloudinary
        logger.info(`[Queue] ☁️ Uploading PDF to Cloudinary for Donation: ${donationId}...`);
        const url = await uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donationId);

        // 3. Parallel Tasks: Update DB & Send Notifications (Maximum Concurrency)
        const finalTasks = [];

        // DB Update
        finalTasks.push(
          donation.update({ slipUrl: url })
            .then(() => logger.info(`[Queue] ✅ DB updated with slipUrl: ${donationId}`))
            .catch(err => logger.error(`[Queue] ❌ DB update failed:`, err))
        );

        // WhatsApp Notification
        if (user.mobileNumber) {
          logger.info(`[Queue] 📱 Sending WhatsApp notification to: ${user.mobileNumber}...`);
          const categoryName = category?.name || causeString || 'ગૌસેવા';
          const locationName = user.city || user.state || user.country || 'કોબડી';

          finalTasks.push(
            sendDetailedDonationSuccessWhatsAppPDF(
              user.mobileNumber,
              user.name,
              amount,
              categoryName,
              locationName,
              url
            ).then(() => logger.info(`[Queue] ✅ WhatsApp sent successfully to: ${user.mobileNumber}`))
             .catch(err => logger.error(`[Queue] ❌ WhatsApp failed:`, err))
          );
        }

        // Email Notification
        if (user.email) {
          logger.info(`[Queue] 📧 Sending Email notification to: ${user.email}...`);
          const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
          finalTasks.push(
            sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
              { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
            ]).then(() => logger.info(`[Queue] ✅ Email sent successfully to: ${user.email}`))
              .catch(err => logger.error(`[Queue] ❌ Email failed:`, err))
          );
        }

        // Execute everything together
        await Promise.all(finalTasks);

        logger.info(`[Queue] ✨ ALL processes completed for Donation: ${donationId}`);
      } catch (error) {
        logger.error(`[Queue] 💥 Error processing Donation ${donationId}:`, error);
        throw error; // Let BullMQ handle the retry
      }
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[Queue] 🛑 Job ${job.id} failed after attempts:`, err);
  });
}
