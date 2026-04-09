import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';

/**
 * Generate a donation slip PDF buffer
 */
export const generateDonationSlipBuffer = (user, amount, cause, donationId, paymentMode, paymentDate, gaushala = null, katha = null) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width;   // 595
    const H = doc.page.height;  // 842
    const M = 50;               // margin
    const CW = W - M * 2;       // content width
    const col2X = M + CW / 2 + 10;
    const colW = (CW - 20) / 2;

    // ─── Full page background ───
    doc.rect(0, 0, W, H).fill('#f8fafc');

    // ─── Left accent bar ───
    doc.rect(0, 0, 6, H).fill('#2563eb');

    // ─── Top header band ───
    doc.rect(0, 0, W, 140).fill('#1e3a5f');
    // Subtle gradient overlay on right
    doc.rect(W - 200, 0, 200, 140).fill('#1e4d7a');

    // Header: Org name
    doc.fontSize(11).fillColor('#94b8db').font('Helvetica')
      .text('DONATION MANAGEMENT SYSTEM', M + 10, 30, { width: CW, characterSpacing: 3 });

    // Header: Title
    doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
      .text('Donation Receipt', M + 10, 55);

    // Header: Receipt # on right
    doc.fontSize(8).fillColor('#94b8db').font('Helvetica')
      .text('RECEIPT NO.', W - 230, 30, { width: 180, align: 'right' });
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
      .text(donationId.substring(0, 18) + '...', W - 230, 44, { width: 180, align: 'right' });

    // Header: Date on right
    doc.fontSize(8).fillColor('#94b8db').font('Helvetica')
      .text('DATE', W - 230, 68, { width: 180, align: 'right' });
    doc.fontSize(10).fillColor('#ffffff').font('Helvetica-Bold')
      .text(paymentDate ? new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-', W - 230, 82, { width: 180, align: 'right' });

    // ─── Amount banner ───
    const bannerY = 115;
    doc.roundedRect(M + 10, bannerY, CW - 20, 50, 10).fill('#ffffff');
    doc.fontSize(9).fillColor('#64748b').font('Helvetica-Bold')
      .text('AMOUNT RECEIVED', M + 30, bannerY + 10);
    doc.fontSize(24).fillColor('#059669').font('Helvetica-Bold')
      .text(`Rs. ${Number(amount).toLocaleString('en-IN')}`, M + 30, bannerY + 24);
    // Status badge
    const statusText = 'PAID';
    doc.roundedRect(W - M - 90, bannerY + 14, 60, 22, 11).fill('#059669');
    doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
      .text(statusText, W - M - 88, bannerY + 20, { width: 56, align: 'center' });

    let y = 190;

    // ─── Helper: Section Title ───
    const drawSection = (title) => {
      doc.roundedRect(M, y, CW, 28, 6).fill('#eef2ff');
      doc.fontSize(9).fillColor('#3b5998').font('Helvetica-Bold')
        .text(title, M + 14, y + 9, { characterSpacing: 1.5 });
      y += 40;
    };

    // ─── Helper: Info Row (2 col) ───
    const drawRow = (label1, value1, label2, value2) => {
      doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica-Bold')
        .text(label1.toUpperCase(), M + 14, y);
      doc.fontSize(10.5).fillColor('#1e293b').font('Helvetica')
        .text(value1 || '-', M + 14, y + 12, { width: colW - 14 });

      if (label2) {
        doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica-Bold')
          .text(label2.toUpperCase(), col2X, y);
        doc.fontSize(10.5).fillColor('#1e293b').font('Helvetica')
          .text(value2 || '-', col2X, y + 12, { width: colW });
      }
      y += 32;
    };

    // ─── Helper: Info Row (full width) ───
    const drawFullRow = (label, value) => {
      doc.fontSize(7.5).fillColor('#9ca3af').font('Helvetica-Bold')
        .text(label.toUpperCase(), M + 14, y);
      doc.fontSize(10.5).fillColor('#1e293b').font('Helvetica')
        .text(value || '-', M + 14, y + 12, { width: CW - 28 });
      y += 32;
    };

    // ─── Helper: Thin divider ───
    const drawLine = () => {
      doc.moveTo(M + 14, y).lineTo(W - M - 14, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      y += 8;
    };

    // ═══════════════════════════════════
    // DONOR INFO
    // ═══════════════════════════════════
    drawSection('DONOR INFORMATION');
    drawRow('Full Name', user.name, 'Mobile', user.mobileNumber);
    drawLine();
    drawRow('Email', user.email, 'Company', user.companyName);
    drawLine();
    drawFullRow('Address', [user.address, user.village, user.district].filter(Boolean).join(', '));

    y += 8;

    // ═══════════════════════════════════
    // DONATION INFO
    // ═══════════════════════════════════
    drawSection('DONATION INFORMATION');
    drawFullRow('Purpose / Cause', cause);
    drawLine();
    drawRow(
      'Payment Mode', (paymentMode || 'online').replace('_', ' ').toUpperCase(),
      'Payment Date', paymentDate ? new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
    );
    drawLine();
    drawRow('Receipt ID', donationId, 'Status', 'Completed');

    y += 12;

    // ═══════════════════════════════════
    // GAUSHALA / KATHA DETAILS (Optional)
    // ═══════════════════════════════════
    if (gaushala) {
      drawSection('GAUSHALA DETAILS');
      drawRow('Gaushala Name', gaushala.name, 'Location', gaushala.location?.name);
      y += 8;
    } else if (katha) {
      drawSection('KATHA DETAILS');
      drawRow('Katha Name', katha.name, 'Duration', `${katha.startDate || '-'} to ${katha.endDate || '-'}`);
      drawLine();
      drawFullRow('Description', katha.description);
      y += 8;
    }

    // ─── Bottom decorative bar ───
    doc.rect(0, H - 60, W, 60).fill('#1e3a5f');
    doc.fontSize(9).fillColor('#94b8db').font('Helvetica')
      .text('Thank you for your generous contribution!', 0, H - 42, { width: W, align: 'center' });
    doc.fontSize(7).fillColor('#5a7a9b').font('Helvetica')
      .text('This is a system-generated receipt. No signature required.', 0, H - 26, { width: W, align: 'center' });

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
