import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';

/**
 * Generate a donation slip PDF buffer
 */
export const generateDonationSlipBuffer = (user, amount, cause, donationId, paymentMode, paymentDate) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 80;
    const halfWidth = (contentWidth - 15) / 2;

    // Header background
    doc.rect(0, 0, pageWidth, 100).fill('#2563eb');

    // Header text
    doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
      .text('DONATION RECEIPT', 40, 30, { width: contentWidth, align: 'center' });
    doc.fontSize(10).fillColor('#dbeafe').font('Helvetica')
      .text('Donation Management System', 40, 60, { width: contentWidth, align: 'center' });

    // Receipt ID
    doc.roundedRect(40, 110, contentWidth, 36, 8).fill('#f0f9ff').stroke('#bfdbfe');
    doc.fontSize(9).fillColor('#64748b').font('Helvetica')
      .text('RECEIPT ID', 55, 117);
    doc.fontSize(9).fillColor('#1e40af').font('Helvetica-Bold')
      .text(donationId, 55, 130);

    let y = 165;

    // Section header
    const drawSectionHeader = (title) => {
      doc.fontSize(10).fillColor('#2563eb').font('Helvetica-Bold').text(title, 55, y);
      y += 16;
      doc.moveTo(55, y).lineTo(pageWidth - 55, y).strokeColor('#bfdbfe').lineWidth(1).stroke();
      y += 12;
    };

    // Field renderer
    const drawField = (label, value, x = 55, width = contentWidth) => {
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Bold').text(label.toUpperCase(), x, y, { width });
      y += 13;
      doc.fontSize(11).fillColor('#1e293b').font('Helvetica').text(value || '-', x, y, { width });
      y += 20;
    };

    // Two-column field renderer
    const drawFieldRow = (label1, value1, label2, value2) => {
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Bold').text(label1.toUpperCase(), 55, y, { width: halfWidth });
      doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Bold').text(label2.toUpperCase(), 55 + halfWidth + 15, y, { width: halfWidth });
      y += 13;
      doc.fontSize(11).fillColor('#1e293b').font('Helvetica').text(value1 || '-', 55, y, { width: halfWidth });
      doc.fontSize(11).fillColor('#1e293b').font('Helvetica').text(value2 || '-', 55 + halfWidth + 15, y, { width: halfWidth });
      y += 20;
    };

    // Divider line
    const drawDivider = () => {
      doc.moveTo(55, y).lineTo(pageWidth - 55, y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      y += 10;
    };

    // --- Donor Details Section ---
    drawSectionHeader('DONOR DETAILS');
    drawFieldRow('Donor Name', user.name, 'Mobile Number', user.mobileNumber);
    drawDivider();
    drawFieldRow('Email', user.email, 'Company / Organization', user.companyName);
    drawDivider();
    drawField('Address', [user.address, user.village, user.district].filter(Boolean).join(', '));
    drawDivider();

    // --- Donation Details Section ---
    y += 5;
    drawSectionHeader('DONATION DETAILS');
    drawField('Purpose / Cause', cause);
    drawDivider();
    drawFieldRow(
      'Payment Mode', (paymentMode || 'online').replace('_', ' ').toUpperCase(),
      'Payment Date', paymentDate ? new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    );
    drawDivider();

    // Amount highlight box
    y += 5;
    doc.roundedRect(40, y, contentWidth, 50, 10).fill('#eff6ff').stroke('#bfdbfe');
    doc.fontSize(9).fillColor('#64748b').font('Helvetica-Bold')
      .text('AMOUNT RECEIVED', 55, y + 10);
    doc.fontSize(20).fillColor('#1e40af').font('Helvetica-Bold')
      .text(`Rs. ${Number(amount).toLocaleString('en-IN')}`, 55, y + 25);

    y += 70;

    // Footer
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
      .text('Thank you for your generous contribution!', 40, y, { width: contentWidth, align: 'center' });
    y += 14;
    doc.fontSize(7).fillColor('#cbd5e1').font('Helvetica')
      .text('This is a system-generated receipt.', 40, y, { width: contentWidth, align: 'center' });

    doc.end();
  });
};

/**
 * Upload PDF buffer to Cloudinary and return the secure URL
 */
export const uploadSlipToCloudinary = (pdfBuffer, donorName, mobileNumber, donationId) => {
  return new Promise((resolve, reject) => {
    const folderName = `donation-slips/${donorName.replace(/\s+/g, '_')}_${mobileNumber}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: folderName,
        public_id: `slip_${donationId}`,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(pdfBuffer);
  });
};
