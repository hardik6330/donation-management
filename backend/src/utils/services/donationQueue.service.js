import { Queue, Worker } from 'bullmq';
import redis from '../../config/redis.js';
import { Donation, User, Category, Gaushala, Katha } from '../../models/index.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from './donationSlip.service.js';
import { sendEmail, getDonationEmailTemplate } from './email.service.js';
import { sendDetailedDonationSuccessWhatsAppPDF } from './whatsapp.service.js';
import { sendDetailedDonationSMS } from './sms.service.js';

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
      const { donationId, userId, amount, categoryId, gaushalaId, kathaId, causeString } = job.data;
      console.log(`[Queue] Processing donation ${donationId} for user ${userId}`);

      try {
        const donation = await Donation.findByPk(donationId);
        const user = await User.findByPk(userId);
        const category = categoryId ? await Category.findByPk(categoryId) : null;
        const gaushala = gaushalaId ? await Gaushala.findByPk(gaushalaId) : null;
        const katha = kathaId ? await Katha.findByPk(kathaId) : null;

        if (!donation) throw new Error(`Donation not found: ${donationId}`);
        if (!user) throw new Error(`User not found: ${userId}`);

        // 1. Generate PDF
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
          locationAddress
        );

        // 2. Upload to Cloudinary
        const url = await uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id);
        await donation.update({ slipUrl: url });

        // 3. WhatsApp Notification
        if (user.mobileNumber) {
          const categoryName = category?.name || causeString || 'ગૌસેવા';
          const locationName = user.city || user.state || user.country || 'કોબડી';

          await sendDetailedDonationSuccessWhatsAppPDF(
            user.mobileNumber,
            user.name,
            amount,
            categoryName,
            locationName,
            url
          );
        }

        // 4. Email Notification
        if (user.email) {
          const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
          await sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
            { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
          ]);
        }

        // 5. SMS Notification (Commented out as per previous request)
        /*
        if (user.mobileNumber) {
          await sendDetailedDonationSMS(user.name, amount, donation.id, user.mobileNumber, {
            category: category?.name,
            gaushala: gaushala?.name,
            katha: katha?.name,
            city: user.city,
            state: user.state,
            country: user.country
          });
        }
        */

        console.log(`[Queue] Successfully processed donation ${donationId}`);
      } catch (error) {
        console.error(`[Queue] Error processing donation ${donationId}:`, error);
        throw error; // Let BullMQ handle the retry
      }
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed:`, err);
  });
}
