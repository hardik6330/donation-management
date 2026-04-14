import axios from 'axios';
import { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } from '../../config/env.js';

/**
 * Sends a WhatsApp message using Meta's WhatsApp Business API.
 * 
 * @param {string} to - Recipient phone number (with country code, e.g., '919876543210')
 * @param {string} templateName - Name of the pre-approved template
 * @param {string} languageCode - Language code of the template (default: 'en_US')
 * @param {Array} components - Array of template components (parameters)
 * @returns {Promise<Object>} - API response
 */
export const sendWhatsAppMessage = async (to, templateName, languageCode = 'en_US', components = []) => {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('⚠️ [WhatsApp Service] WhatsApp credentials missing. Message skipped.');
    return { success: false, skipped: true };
  }

  // Clean the phone number: remove non-digits and ensure it has 91 for India if only 10 digits
  let cleanNumber = to.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber;
  }

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const data = {
    messaging_product: 'whatsapp',
    to: cleanNumber,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      },
      components: components
    }
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ [WhatsApp Service] Message sent to ${cleanNumber}:`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error(`❌ [WhatsApp Service] Error sending message to ${cleanNumber}:`, errorDetails);
    return { success: false, error: errorDetails };
  }
};

/**
 * Helper to send a partial payment reminder via WhatsApp
 * (Requires a template to be created in Meta Developer Portal)
 */
export const sendPartialPaymentReminderWhatsApp = async (to, donorName, totalAmount, paidAmount, remainingAmount, cause) => {
  // IMPORTANT: You must create a template named 'partial_payment_reminder' (or similar)
  // Example template text: "Hello {{1}}, Thank you for your donation of ₹{{2}} for {{3}}. Remaining: ₹{{4}}. Please complete it soon."
  
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: donorName },
        { type: 'text', text: totalAmount.toString() },
        { type: 'text', text: cause },
        { type: 'text', text: remainingAmount.toString() }
      ]
    }
  ];

  return sendWhatsAppMessage(to, 'partial_payment_reminder', 'en_US', components);
};
