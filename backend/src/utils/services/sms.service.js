import axios from 'axios';
import { VITE_FAST2SMS_API_KEY } from '../../config/env.js';
import { retryWithBackoff } from '../retryHelper.js';

/**
 * Send SMS using Fast2SMS API (India)
 * @param {string} mobileNumber - 10 digit mobile number
 * @param {string} message - Message content
 */
export const sendSMS = async (mobileNumber, message) => {
  // Temporarily disabled due to API limits or errors
  return { success: false, skipped: true, message: 'SMS service disabled' };

  if (!VITE_FAST2SMS_API_KEY) {
    return { success: false, skipped: true };
  }

  if (!mobileNumber || mobileNumber.length !== 10) {
    return { success: false, skipped: true };
  }

  const sendRequest = async () => {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      "route": "q",
      "message": message,
      "language": "english",
      "numbers": mobileNumber,
    }, {
      headers: {
        'authorization': VITE_FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10s timeout
    });
    return response.data;
  };

  try {
    const result = await retryWithBackoff(sendRequest, 3, 1000);
    
    if (result.return) {
      return { success: true, result };
    } else {
      console.error(`Fast2SMS Error: ${result.message}`);
      return { success: false, error: result.message };
    }
  } catch (error) {
    console.error(`Error sending SMS to ${mobileNumber}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

/**
 * Detailed Donation Success SMS Template
 */
export const sendDetailedDonationSMS = async (donorName, amount, donationId, mobileNumber, details = {}) => {
  const { category, gaushala, katha, city, taluka, village } = details;
  
  let target = '';
  if (gaushala) target = `Gaushala: ${gaushala}`;
  else if (katha) target = `Katha: ${katha}`;
  else if (category) target = `for ${category}`;

  let location = '';
  if (city || taluka || village) {
    location = ` at ${[city, taluka, village].filter(Boolean).join(', ')}`;
  }

  const message = `Jay Shree Krishna! Dear ${donorName}, thank you for your donation of Rs.${amount} ${target}${location}. Receipt ID: ${donationId}. - Donation Management`;
  
  // Note: SMS length limit is usually 160 characters. If message is longer, it might count as 2 SMS.
  return await sendSMS(mobileNumber, message.substring(0, 300)); // Limit to safe length
};
