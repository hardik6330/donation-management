import { Queue, Worker } from 'bullmq';
import redis from '../../config/redis.js';
import { Donation, User, Category, Gaushala, Katha, Location } from '../../models/index.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from './donationSlip.service.js';
import { sendEmail, getDonationEmailTemplate, isValidEmail } from './email.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from './whatsapp.service.js';
import { sendDetailedDonationSMS } from './sms.service.js';
import { VERCEL } from '../../config/env.js';
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

// 2. Worker logic - Disable on Vercel as serverless functions terminate before completion
if (redis && !VERCEL) {
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { donationId, userId, amount, categoryId, gaushalaId, kathaId, causeString, slipNo } = job.data;
      logger.info(`[Queue] 🚀 Starting process for Donation ID: ${donationId} | User ID: ${userId} | Slip No: ${slipNo}`);

      try {
        const [donation, user, category, gaushala, katha] = await Promise.all([
          Donation.findByPk(donationId),
          User.findByPk(userId),
          categoryId ? Category.findByPk(categoryId) : Promise.resolve(null),
          gaushalaId ? Gaushala.findByPk(gaushalaId, { include: [{ model: Location, as: 'location' }] }) : Promise.resolve(null),
          kathaId ? Katha.findByPk(kathaId) : Promise.resolve(null),
        ]);

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
          donation.donationDate || donation.paymentDate,
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

        // DB Update - Essential, throw if fails
        finalTasks.push(
          donation.update({ slipUrl: url })
            .then(() => logger.info(`[Queue] ✅ DB updated with slipUrl: ${donationId}`))
        );

        // WhatsApp Notification - Throw if fails to trigger retry
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
          );
        }

        // Email Notification - Throw if fails to trigger retry
        if (isValidEmail(user.email)) {
          logger.info(`[Queue] 📧 Sending Email notification to: ${user.email}...`);
          const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
          finalTasks.push(
            sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
              { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
            ]).then(() => logger.info(`[Queue] ✅ Email sent successfully to: ${user.email}`))
          );
        } else {
          logger.info(`[Queue] ⏭️ Email skipped (no valid email) for Donation: ${donationId}`);
        }

        // Execute everything together - if any fails, BullMQ will retry based on defaultJobOptions
        await Promise.all(finalTasks);

        logger.info(`[Queue] ✨ ALL processes completed for Donation: ${donationId}`);
      } catch (error) {
        logger.error(`[Queue] 💥 Error processing Donation ${donationId}:`, error);
        throw error; // Let BullMQ handle the retry
      }
    },
    { 
      connection: redis,
      stalledInterval: 30000, // 30s before considering job stalled
      maxStalledCount: 2,     // retry stalled jobs twice
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[Queue] 🛑 Job ${job.id} failed after attempts:`, err);
  });
}
