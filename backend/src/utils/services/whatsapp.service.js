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
  console.log('🔍 [WhatsApp Debug] Checking Configuration...');
  console.log('   - Phone ID:', WHATSAPP_PHONE_NUMBER_ID);
  console.log('   - Token Length:', WHATSAPP_ACCESS_TOKEN ? WHATSAPP_ACCESS_TOKEN.length : 0);
  console.log('   - Recipient:', to);

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('❌ [WhatsApp Service] ERROR: Credentials missing in .env');
    return { success: false, skipped: true };
  }

  // Clean the phone number
  let cleanNumber = to.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber;
  }

  const url = `https://graph.facebook.com/v25.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  // Sanitize text parameters for WhatsApp API:
  // - Empty → '-' (prevents 131008)
  // - Replace newlines/tabs with ' | ' separator (prevents 132018)
  // - Collapse 4+ consecutive spaces to 3 (prevents 132018)
  const sanitizedComponents = components.map(comp => ({
    ...comp,
    parameters: comp.parameters?.map(param => {
      if (param.type !== 'text') return param;
      if (!param.text?.trim()) return { ...param, text: '-' };
      const cleaned = param.text
        .replace(/\r\n/g, ' | ')
        .replace(/[\n\r]/g, ' | ')
        .replace(/\t/g, ' ')
        .replace(/\s{4,}/g, '   ')
        .trim();
      return { ...param, text: cleaned || '-' };
    })
  }));

  const payload = {
    messaging_product: 'whatsapp',
    to: cleanNumber,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: sanitizedComponents
    }
  };

  console.log('📤 [WhatsApp Debug] Request Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ [WhatsApp Debug] FULL SUCCESS RESPONSE:', JSON.stringify(response.data, null, 2));
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ [WhatsApp Debug] FULL ERROR DETAILS:');
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   - Message:', error.message);
    }
    return { success: false, error: error.response?.data || error.message };
  }
};

/**
 * Helper to send a partial payment reminder via WhatsApp
 * (Requires a template to be created in Meta Developer Portal)
 */
export const sendPartialPaymentReminderWhatsApp = async (to, donorName, totalAmount, paidAmount, remainingAmount, cause) => {
  // IMPORTANT: Using template 'partial_payment_reminderr' (Gujarati) as seen in screenshot
  // Example template text: "નમસ્તે {{1}}, શ્રી સર્વેશ્વર ગૌધામમાં {{3}} માટે આપના ₹{{2}} ના દાનમાંથી ₹{{4}} બાકી છે. કૃપા કરી જલ્દી પૂર્ણ કરશો."
  
  const components = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: donorName || 'દાતા' },           // {{1}}
        { type: 'text', text: totalAmount?.toString() || '0' },// {{2}}
        { type: 'text', text: cause || 'દાન' },               // {{3}}
        { type: 'text', text: remainingAmount?.toString() || '0' } // {{4}}
      ]
    }
  ];

  return sendWhatsAppMessage(to, 'partial_payment_reminderr', 'gu', components);
};

/**
 * Helper to send a detailed donation success message with a PDF slip via WhatsApp
 */
export const sendDetailedDonationSuccessWhatsAppPDF = async (to, donorName, amount, categoryName, locationName, pdfUrl) => {
  // IMPORTANT: Create a template named 'donation_success_detailed_pdf'
  // Header: Media (Document)
  // Body: 
  // "જય શ્રી કૃષ્ણ, {{1}} બાપજી! 🙏
  // 
  // શ્રી સર્વેશ્વર ગૌધામ ટ્રસ્ટમાં આપના દ્વારા કરવામાં આવેલ ₹{{2}} ના નિઃસ્વાર્થ દાન બદલ અમે આપના ખૂબ ખૂબ આભારી છીએ. આપનું આ દાન {{3}} ({{4}}) ના શુભ કાર્યમાં સહભાગી થશે. 🐄✨
  // 
  // આપની દાનની પહોંચ (PDF) આ સાથે મોકલેલ છે. આપની આ સેવા પ્રભુ ચરણોમાં સ્વીકારાય એવી પ્રાર્થના.
  // 
  // - શ્રી સર્વેશ્વર ગૌધામ ટ્રસ્ટ"
  
  const components = [
    {
      type: 'header',
      parameters: [
        {
          type: 'document',
          document: {
            link: pdfUrl,
            filename: 'Donation_Receipt.pdf'
          }
        }
      ]
    },
    {
      type: 'body',
      parameters: [
        { type: 'text', text: donorName || 'દાતા' },           // {{1}}
        { type: 'text', text: amount?.toString() || '0' },    // {{2}}
        { type: 'text', text: categoryName || 'ગૌસેવા' },      // {{3}}
        { type: 'text', text: locationName || 'કોબડી' }        // {{4}} - Fallback to 'કોબડી' if empty
      ]
    }
  ];

  return sendWhatsAppMessage(to, 'donation_success_detailed_pdf', 'gu', components);
};
