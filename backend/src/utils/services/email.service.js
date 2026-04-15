import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '../../config/env.js';

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
    return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return { success: false, error };
  }
};

// 3. Donation Success Email Template
export const getDonationEmailTemplate = (donorName, amount, cause, donationId) => {
//   return `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
//       <h2 style="color: #2563eb; text-align: center;">Thank You for Your Donation!</h2>
//       <p>Dear <strong>${donorName}</strong>,</p>
//       <p>We have received your generous contribution of <strong>₹${amount}</strong> for <strong>${cause}</strong>.</p>
//       <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
//         <p style="margin: 0;"><strong>Donation ID:</strong> ${donationId}</p>
//         <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Completed</p>
//       </div>
//       <p>Your support helps us make a significant difference in our community.</p>
//       <p>Best Regards,<br><strong>Donation Management System</strong></p>
//     </div>
//   `;



// return `
//   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 12px; background-color: #ffffff;">
    
//     <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px;">
//       આપના દાન બદલ હૃદયપૂર્વક આભાર
//     </h2>
    
//     <p>પ્રિય <strong>${donorName}</strong>,</p>
    
//     <p style="font-size: 15px; line-height: 1.7;">
//       <strong>શ્રી સર્વેશ્વર ગૌધામ</strong> માટે આપ દ્વારા આપવામાં આવેલ 
//       <strong>₹${amount}</strong>નું દાન અમને પ્રાપ્ત થયું છે.
//     </p>

//     <p style="font-size: 15px; line-height: 1.7;">
//       આપનો આ સહયોગ અમારી સેવા પ્રવૃત્તિઓ માટે અમૂલ્ય છે. 
//       આપ જેવા દાતાશ્રીઓના સહકારથી જ અમે ગૌસેવા અને સમાજ કલ્યાણના કાર્યને આગળ વધારી શકીએ છીએ.
//     </p>

//     <p style="font-size: 15px; line-height: 1.7;">
//       આપનો આ સહયોગ અમારા માટે પ્રેરણારૂપ છે અને અમે હંમેશા આપના વિશ્વાસને સાચવવાનો પ્રયત્ન કરીશું.
//     </p>

//     <p style="font-size: 15px; line-height: 1.7;">
//       ભગવાન આપને સુખ, શાંતિ અને સમૃદ્ધિ આપે તેવી હાર્દિક પ્રાર્થના.
//     </p>

//     <p style="margin-top: 25px;">
//       શુભેચ્છાઓ સહ,<br>
//       <strong>શ્રી સર્વેશ્વર ગૌધામ પરિવાર</strong>
//     </p>

//   </div>
// `;

return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 12px; background-color: #ffffff;">
    
    <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px;">
      આપના પવિત્ર દાન બદલ હૃદયપૂર્વક આભાર
    </h2>
    
    <p>પ્રિય <strong>${donorName}</strong>,</p>
    
    <p style="font-size: 15px; line-height: 1.7;">
      <strong>શ્રી સર્વેશ્વર ગૌધામ</strong> માટે આપ દ્વારા કરવામાં આવેલ 
      <strong>₹${amount}</strong>નું પવિત્ર દાન અમને પ્રાપ્ત થયું છે.
    </p>

    <p style="font-size: 15px; line-height: 1.7;">
      આપનો આ સહયોગ નિરાધાર, અંધ, અપંગ તથા ત્યજી દેવાયેલા ગૌવંશની સેવા, સારવાર અને સંભાળ માટે ઉપયોગમાં લેવામાં આવે છે. 
      ગૌમાતા અને બળદોને જીવનભર આશ્રય અને સંભાળ આપવાનું આ પવિત્ર કાર્ય આપ જેવા દાતાશ્રીઓના સહકારથી જ શક્ય બને છે.
    </p>

    <p style="font-size: 15px; line-height: 1.7;">
      ગૌસેવા સાથે સાથે અન્નક્ષેત્ર, સારવાર અને સમાજ કલ્યાણ જેવી સેવાઓ પણ સતત ચાલુ રાખવામાં આવે છે, 
      જેમાં આપનો સહયોગ અમૂલ્ય યોગદાન આપે છે.
    </p>

    <p style="font-size: 15px; line-height: 1.7;">
      આપનો વિશ્વાસ અને સહયોગ અમને વધુ શ્રદ્ધા અને જવાબદારી સાથે સેવા કાર્ય આગળ વધારવા પ્રેરણા આપે છે.
    </p>

    <p style="font-size: 15px; line-height: 1.7;">
      ભગવાન શ્રીકૃષ્ણ આપને અને આપના પરિવારને સુખ, શાંતિ અને સમૃદ્ધિ આપે તેવી હાર્દિક પ્રાર્થના.
    </p>

    <p style="margin-top: 25px;">
      વિનમ્ર આભાર સહ,<br>
      <strong>શ્રી સર્વેશ્વર ગૌધામ પરિવાર</strong>
    </p>

  </div>
`;
};

export const getPartialPaymentReminderEmailTemplate = (donorName, totalAmount, paidAmount, remainingAmount, cause, donationId) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 25px; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #2563eb; text-align: center; margin-bottom: 10px;">
        બાકી દાન રકમ માટે નમ્ર યાદી
      </h2>
      
      <p>પ્રિય <strong>${donorName}</strong>,</p>
      
      <p style="font-size: 15px; line-height: 1.7;">
        <strong>શ્રી સર્વેશ્વર ગૌધામ</strong> માટે આપ દ્વારા <strong>${cause}</strong> માટે કરવામાં આવેલ 
        <strong>₹${totalAmount}</strong>ના દાનની નોંધણી બદલ આભાર.
      </p>

      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>કુલ દાન રકમ:</strong> ₹${totalAmount}</p>
        <p style="margin: 5px 0 0 0;"><strong>જમા રકમ:</strong> ₹${paidAmount}</p>
        <p style="margin: 5px 0 0 0; color: #dc2626;"><strong>બાકી રકમ:</strong> ₹${remainingAmount}</p>
        <p style="margin: 5px 0 0 0;"><strong>ડોનેશન ID:</strong> ${donationId}</p>
      </div>

      <p style="font-size: 15px; line-height: 1.7;">
        આપની અનુકૂળતા મુજબ બાકી રકમ જમા કરાવી આપના આ પવિત્ર કાર્યને પૂર્ણ કરવા વિનંતી છે.
        આપનો આ સહયોગ ગૌસેવા અને સમાજ કલ્યાણના કાર્યોમાં ખૂબ જ ઉપયોગી બનશે.
      </p>

      <p style="font-size: 15px; line-height: 1.7;">
        વધુ માહિતી માટે આપ અમારો સંપર્ક કરી શકો છો.
      </p>

      <p style="margin-top: 25px;">
        શુભેચ્છાઓ સહ,<br>
        <strong>શ્રી સર્વેશ્વર ગૌધામ પરિવાર</strong>
      </p>
    </div>
  `;
};