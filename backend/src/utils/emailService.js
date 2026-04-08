import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '../config/db.js';

// 1. Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// 2. Validate email format
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// 3. Function to send email directly (Serverless compatible)
export const sendEmail = async (to, subject, html, attachments = []) => {
  if (!isValidEmail(to)) {
    console.log(`⏭️ Skipping email — invalid or missing address: ${to}`);
    return { success: false, skipped: true };
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: to.trim(),
      subject,
      html,
      attachments,
    });
    console.log(`✅ Email sent directly to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error };
  }
};

// 3. Donation Success Email Template
export const getDonationEmailTemplate = (donorName, amount, cause, donationId) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Thank You for Your Donation!</h2>
      <p>Dear <strong>${donorName}</strong>,</p>
      <p>We have received your generous contribution of <strong>₹${amount}</strong> for <strong>${cause}</strong>.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Donation ID:</strong> ${donationId}</p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Completed</p>
      </div>
      <p>Your support helps us make a significant difference in our community.</p>
      <p>Best Regards,<br><strong>Donation Management System</strong></p>
    </div>
  `;
};
