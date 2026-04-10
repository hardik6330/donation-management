import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SLIP_TEMPLATE_CANDIDATES = [
  // Primary expected location
  path.resolve(__dirname, '../../../frontend/src/assets/slip.jpg'),
  // Supported fallback formats at same location
  path.resolve(__dirname, '../../../frontend/src/assets/slip.jpeg'),
  path.resolve(__dirname, '../../../frontend/src/assets/slip.png'),
  // Optional fallback when backend is run from different root layout
  path.resolve(__dirname, '../../../src/assets/slip.jpg')
];

const numberToWords = (num) => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const belowThousand = (n) => {
    let out = '';
    if (n >= 100) {
      out += `${ones[Math.floor(n / 100)]} hundred `;
      n %= 100;
    }
    if (n >= 20) {
      out += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    }
    if (n > 0) out += ones[n];
    return out.trim();
  };

  if (!Number.isFinite(num) || num <= 0) return 'zero';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  const parts = [];
  if (crore) parts.push(`${belowThousand(crore)} crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} thousand`);
  if (rest) parts.push(belowThousand(rest));

  return parts.join(' ').trim();
};

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

    const slipTemplatePath = SLIP_TEMPLATE_CANDIDATES.find((candidate) => fs.existsSync(candidate));
    if (slipTemplatePath) {
      const donorName = (user?.name || '-').toUpperCase();
      const donorAddress = ([user?.address, user?.village, user?.district].filter(Boolean).join(', ') || '-').toUpperCase();
      const paymentModeLabel = (paymentMode || 'online').replace('_', ' ').toUpperCase();
      const receiptDate = (paymentDate ? new Date(paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')).toUpperCase();
      const amountValue = Number(amount || 0);
      const amountText = amountValue.toLocaleString('en-IN');
      const amountInWords = `${numberToWords(Math.floor(amountValue))} rupees only`.toUpperCase();
      const receiptNo = (donationId?.toString().slice(-8) || '-').toUpperCase();

      // Render template without distortion (keep aspect ratio) and then place text
      // relative to the fitted image area for consistent alignment.
      const templateImage = doc.openImage(slipTemplatePath);
      const scale = Math.min(W / templateImage.width, H / templateImage.height);
      const drawW = templateImage.width * scale;
      const drawH = templateImage.height * scale;
      const drawX = (W - drawW) / 2;
      const drawY = (H - drawH) / 2;

      doc.image(templateImage, drawX, drawY, { width: drawW, height: drawH });

      const px = (n) => drawX + drawW * n;
      const py = (n) => drawY + drawH * n;
      const fs = (n) => Math.max(9, drawW * n);
      const normalizedMode = (paymentMode || '').toLowerCase();
      const isCash = normalizedMode === 'cash';
      const isCheque = normalizedMode === 'cheque' || normalizedMode === 'check';
      const isOnline = normalizedMode === 'online' || normalizedMode === 'upi';

      doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(fs(0.015))
        .text(receiptNo, px(0.12), py(0.305), { width: drawW * 0.18, align: 'center' });

      // Date in left-side "તા." field area (inside the line, not outside template)
      doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(fs(0.014))
        .text(receiptDate, px(0.242), py(0.410), { width: drawW * 0.18, align: 'left', lineBreak: false });

      doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(fs(0.017))
        .text(donorName, px(0.255), py(0.455), { width: drawW * 0.24, lineBreak: false });

      doc.fillColor('#1f2937').font('Helvetica').fontSize(fs(0.014))
        .text(donorAddress, px(0.265), py(0.510), { width: drawW * 0.50, lineBreak: false });

      doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(fs(0.013))
        .text(amountInWords, px(0.395), py(0.570), {
          width: drawW * 0.46,
          height: drawW * 0.06,
          lineBreak: true,
          lineGap: 1
        });

      // Payment mode checkbox check mark (vector for reliable rendering)
      const drawCheckMark = (cx, cy, size) => {
        doc
          .save()
          .lineWidth(Math.max(1.2, size * 0.16))
          .strokeColor('#1f2937')
          .lineCap('round')
          .moveTo(cx - size * 0.45, cy + size * 0.05)
          .lineTo(cx - size * 0.12, cy + size * 0.38)
          .lineTo(cx + size * 0.48, cy - size * 0.34)
          .stroke()
          .restore();
      };

      const checkY = py(0.628);
      const checkSize = drawW * 0.015;
      if (isCash) drawCheckMark(px(0.640), checkY, checkSize);      // રોકડા
      if (isCheque) drawCheckMark(px(0.730), checkY, checkSize);    // ચેક
      if (isOnline) drawCheckMark(px(0.802), checkY, checkSize);    // ઓનલાઈન

      doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(fs(0.020))
        .text(`${amountText}`, px(0.725), py(0.705), { width: drawW * 0.20, align: 'center' });

      doc.end();
      return;
    }

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
