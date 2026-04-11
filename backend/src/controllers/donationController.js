import { Donation } from '../models/donation.js';
import { User } from '../models/user.js';
import { Category } from '../models/category.js';
import { Gaushala } from '../models/gaushala.js';
import { Katha } from '../models/katha.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
// import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { FRONTEND_URL } from '../config/db.js';
// import { RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } from '../config/db.js';
import { Op } from 'sequelize';
import { sendEmail, getDonationEmailTemplate } from '../utils/emailService.js';
import { sendDetailedDonationSMS } from '../utils/smsService.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from '../utils/donationSlip.js';

// 1. QR Code Generate Karo
export const generateQRCode = async (req, res) => {
  try {
    console.log(FRONTEND_URL);
    const frontendURL = FRONTEND_URL + '/donate';

    const qrCodeData = await QRCode.toDataURL(frontendURL);
    return sendSuccess(res, { qrCodeData, frontendURL }, 'QR code generated successfully');
  } catch (error) {
    return sendError(res, 'Error generating QR code', 500, error);
  }
};

// 2. Razorpay Order Create Karo
export const createDonationOrder = async (req, res) => {
  try {
    const { 
      amount, 
      name, 
      email, 
      address, 
      village,
      district,
      villageId, 
      talukaId, 
      cityId, 
      categoryId, 
      gaushalaId,
      kathaId,
      companyName, 
      mobileNumber, 
      paymentMode,
      referenceName,
      paidAmount,
      cityName,
      talukaName,
      villageName
    } = req.body;

    // 0. Handle Dynamic Location Creation
    let targetLocationId = villageId || talukaId || cityId;
    if (!targetLocationId && cityName) {
      const newLoc = await findOrCreateLocationStructure(cityName, talukaName, villageName);
      if (newLoc) targetLocationId = newLoc.id;
    }

    // 1. Generate Cause String based on Category, Location, and Katha
    let causeString = '';
    let categoryName = 'General Donation';
    let locationName = '';
    let kathaName = '';

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (category) categoryName = category.name;
    }

    if (kathaId) {
      const katha = await Katha.findByPk(kathaId);
      if (katha) kathaName = katha.name;
    }

    if (targetLocationId) {
      const location = await Location.findByPk(targetLocationId, {
        include: [{ 
          model: Location, 
          as: 'parent',
          include: [{ model: Location, as: 'parent' }] 
        }]
      });
      
      if (location) {
        // Build location path: "Village, Taluka, City"
        const parts = [location.name];
        let current = location.parent;
        while (current) {
          parts.push(current.name);
          current = current.parent;
        }
        locationName = parts.join(', ');
      }
    }

    // Example Cause: "Bhagvat Katha (Surat) - Education Donation for Village, Taluka, City"
    causeString = `${kathaName ? `${kathaName} - ` : ''}${categoryName}${locationName ? ` for ${locationName}` : ''}`;

    // 2. Check user (create or update if exists)
    let user = await User.findOne({ where: { mobileNumber } });
    if (!user) {
      // Generate a secure random temporary password
      const tempPassword = crypto.randomBytes(8).toString('hex');
      
      user = await User.create({ 
        name, 
        email, 
        address, 
        village,
        district,
        companyName, 
        mobileNumber, 
        password: tempPassword,
        cityId,
        talukaId,
        villageId
      });
    } else {
      // Update existing user details if provided
      await user.update({
        name: name || user.name,
        email: email || user.email,
        address: address || user.address,
        village: village || user.village,
        district: district || user.district,
        companyName: companyName || user.companyName,
        cityId: cityId || user.cityId,
        talukaId: talukaId || user.talukaId,
        villageId: villageId || user.villageId
      });
    }

    // 3. Handle Donation creation
    const isDirectPay = ['cash', 'online', 'cheque'].includes(paymentMode);
    const isPartialPay = paymentMode === 'partially_paid';
    const totalAmount = Number(amount);
    const partialPaidAmount = Number(paidAmount);

    if (isPartialPay) {
      const minimumPaidAmount = Math.ceil(totalAmount * 0.2);
      if (!Number.isFinite(partialPaidAmount) || partialPaidAmount <= 0) {
        return sendError(res, 'Paid amount is required for partial payment', 400);
      }
      if (partialPaidAmount < minimumPaidAmount) {
        return sendError(
          res,
          `Paid amount must be at least 20% of total donation (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`,
          400
        );
      }
      if (partialPaidAmount >= totalAmount) {
        return sendError(res, 'Paid amount must be less than total donation amount', 400);
      }
    }

    const donationData = {
      donorId: user.id,
      amount,
      cause: causeString,
      categoryId: categoryId || null,
      gaushalaId: gaushalaId || null,
      kathaId: kathaId || null,
      locationId: targetLocationId || null,
      paymentMode,
      referenceName,
      status: isDirectPay ? 'completed' : isPartialPay ? 'partially_paid' : 'pending',
      paymentDate: (isDirectPay || isPartialPay) ? new Date() : null,
      paidAmount: isPartialPay ? partialPaidAmount : isDirectPay ? amount : null,
      remainingAmount: isPartialPay ? (amount - partialPaidAmount) : null,
    };

    const donation = await Donation.create(donationData);

    // Generate slip, upload to Cloudinary, save URL, and send email/SMS
    // Only for fully paid donations at creation time.
    if (isDirectPay) {
      (async () => {
        try {
          const [gaushala, katha] = await Promise.all([
            gaushalaId ? Gaushala.findByPk(gaushalaId, { include: [{ model: Location, as: 'location' }] }) : Promise.resolve(null),
            kathaId ? Katha.findByPk(kathaId) : Promise.resolve(null)
          ]);

          const pdfBuffer = await generateDonationSlipBuffer(user, amount, causeString, donation.id, paymentMode, donation.paymentDate, gaushala, katha);

          const tasks = [];

          const uploadTask = uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id)
            .then(url => donation.update({ slipUrl: url }))
            .catch(err => console.error('❌ Cloudinary Upload Error:', err));
          tasks.push(uploadTask);

          if (user.email) {
            const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
            const emailTask = sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
              { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
            ]).catch(err => console.error('❌ Email Error:', err));
            tasks.push(emailTask);
          }

          if (user.mobileNumber) {
            const smsTask = (async () => {
              try {
                const [category, locData] = await Promise.all([
                  categoryId ? Category.findByPk(categoryId) : Promise.resolve(null),
                  (async () => {
                    const locId = villageId || talukaId || cityId;
                    if (!locId) return null;
                    return Location.findByPk(locId, {
                      include: [{ model: Location, as: 'parent', include: [{ model: Location, as: 'parent' }] }]
                    });
                  })()
                ]);

                let city = '', taluka = '', village = '';
                if (locData) {
                  if (locData.type === 'village') {
                    village = locData.name;
                    taluka = locData.parent?.name || '';
                    city = locData.parent?.parent?.name || '';
                  } else if (locData.type === 'taluka') {
                    taluka = locData.name;
                    city = locData.parent?.name || '';
                  } else {
                    city = locData.name;
                  }
                }

                await sendDetailedDonationSMS(user.name, amount, donation.id, user.mobileNumber, {
                  category: category?.name,
                  gaushala: gaushala?.name,
                  katha: katha?.name,
                  city,
                  taluka,
                  village
                });
              } catch (err) {
                console.error('❌ SMS Task Error:', err);
              }
            })();
            tasks.push(smsTask);
          }

          await Promise.all(tasks);
          console.log(`✅ All post-donation tasks completed for donation ${donation.id}`);
        } catch (error) {
          console.error('❌ Background tasks failed:', error);
        }
      })();
    }

    const message = isDirectPay
      ? 'Donation recorded successfully'
      : isPartialPay
        ? 'Partial donation recorded successfully'
        : 'Donation intent recorded (Pay Later)';
    return sendSuccess(res, { donationId: donation.id, paymentMode }, message);

    // --- Razorpay Integration (commented out) ---
    // const options = {
    //   amount: amount * 100, // Amount in paise
    //   currency: 'INR',
    //   receipt: `receipt_${Date.now()}`,
    // };
    // const order = await razorpay.orders.create(options);
    // const donation = await Donation.create({
    //   ...donationData,
    //   razorpay_order_id: order.id,
    // });
    // return sendSuccess(res, {
    //   order,
    //   donationId: donation.id,
    //   razorpay_key_id: RAZORPAY_KEY_ID,
    //   paymentMode: 'online'
    // }, 'Razorpay order created successfully');
  } catch (error) {
    console.error('❌ [createDonationOrder] Error:', error);
    return sendError(res, 'Error creating donation order', 500, error);
  }
};

// 3. Payment Verify (Razorpay - commented out)
// Razorpay verification is disabled. Online donations are now saved directly.
export const verifyPayment = async (req, res) => {
  return sendError(res, 'Razorpay payment verification is currently disabled. Online donations are saved directly.', 400);
};

// --- Original Razorpay verifyPayment (commented out) ---
// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', RAZORPAY_KEY_SECRET)
//       .update(body.toString())
//       .digest('hex');
//     if (expectedSignature === razorpay_signature) {
//       const donation = await Donation.findByPk(donationId);
//       if (!donation) return sendError(res, 'Donation not found', 404);
//       const donor = await User.findByPk(donation.donorId);
//       await donation.update({
//         status: 'completed',
//         razorpay_payment_id,
//         razorpay_signature,
//         paymentDate: new Date(),
//       });
//       // ... slip generation, email, SMS ...
//       return sendSuccess(res, donation, 'Payment verified successfully');
//     } else {
//       const donation = await Donation.findByPk(donationId);
//       if (donation) await donation.update({ status: 'failed' });
//       return sendError(res, 'Invalid signature', 400);
//     }
//   } catch (error) {
//     return sendError(res, 'Error verifying payment', 500, error);
//   }
// };

export const getDonations = async (req, res) => {
  try {
    const { page, limit, isFetchAll, queryLimit, offset, requestedFields } = getPaginationParams(req.query);
    const { mainAttributes, includeAttributes } = processFields(requestedFields, 'donor');

    const { whereClause, donorWhere } = await buildDonationFilter(req.query, '');

    const { count, rows: donations } = await Donation.findAndCountAll({
      where: whereClause,
      attributes: mainAttributes,
      include: [{ 
        model: User, 
        as: 'donor', 
        where: Object.keys(donorWhere).length > 0 ? donorWhere : null,
        attributes: includeAttributes || ['name', 'email', 'mobileNumber', 'village', 'district'] 
      }],
      order: [['createdAt', 'DESC']],
      limit: queryLimit,
      offset: offset,
      distinct: true, // Needed when using include with pagination
    });

    const responseData = getPaginatedResponse({
      rows: donations,
      count,
      limit,
      page,
      isFetchAll,
      dataKey: 'donations'
    });

    return sendSuccess(res, responseData, 'All donations records fetched successfully');
  } catch (error) {
    console.error('❌ [getDonations] Error:', error);
    return sendError(res, 'Error fetching donations', 500, error);
  }
};

export const getDonors = async (req, res) => {
  try {
    const {
      search,
      name,
      mobileNumber,
      cityId,
      talukaId,
      villageId,
      minAmount,
      maxAmount
    } = req.query;
    const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);
    const donorWhere = { isAdmin: false };

    if (search) {
      donorWhere[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    if (name) {
      donorWhere.name = { [Op.like]: `%${name}%` };
    }

    if (mobileNumber) {
      donorWhere.mobileNumber = { [Op.like]: `%${mobileNumber}%` };
    }

    if (villageId) {
      donorWhere.villageId = villageId;
    } else if (talukaId) {
      donorWhere.talukaId = talukaId;
    } else if (cityId) {
      donorWhere.cityId = cityId;
    }

    const { count, rows: donors } = await User.findAndCountAll({
      where: donorWhere,
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(SUM(amount), 0)
              FROM Donations
              WHERE Donations.donorId = User.id AND Donations.status = 'completed'
            )`),
            'totalDonated'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Donations
              WHERE Donations.donorId = User.id AND Donations.status = 'completed'
            )`),
            'donationCount'
          ]
        ]
      },
      order: [[sequelize.literal('totalDonated'), 'DESC']],
      limit: queryLimit,
      offset
    });

    // Apply amount filters if present (since totalDonated is a virtual field)
    let filteredDonors = donors;
    if (minAmount || maxAmount) {
      filteredDonors = donors.filter(d => {
        const total = parseFloat(d.getDataValue('totalDonated'));
        if (minAmount && total < parseFloat(minAmount)) return false;
        if (maxAmount && total > parseFloat(maxAmount)) return false;
        return true;
      });
    }

    const responseData = getPaginatedResponse({
      rows: filteredDonors,
      count: minAmount || maxAmount ? filteredDonors.length : count,
      limit,
      page,
      isFetchAll,
      dataKey: 'donors'
    });

    return sendSuccess(res, responseData, 'All donors records fetched successfully');
  } catch (error) {
    console.error('❌ [getDonors] Error:', error);
    return sendError(res, 'Error fetching donors', 500, error);
  }
};

// 4. Update Donation
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, cause, status, paymentMode, paymentDate, categoryId, locationId, paidAmount, remainingAmount } = req.body;

    const donation = await Donation.findByPk(id);
    if (!donation) {
      return sendError(res, 'Donation not found', 404);
    }

    const nextAmount = amount ?? donation.amount;
    const nextPaymentMode = paymentMode || donation.paymentMode;
    const nextStatus = status || donation.status;
    const incomingPaidAmount = paidAmount !== undefined && paidAmount !== null ? Number(paidAmount) : null;
    const incomingRemainingAmount = remainingAmount !== undefined && remainingAmount !== null ? Number(remainingAmount) : null;

    const updateData = {
      amount: nextAmount,
      cause: cause || donation.cause,
      status: nextStatus,
      paymentMode: nextPaymentMode,
      paymentDate: paymentDate || donation.paymentDate,
      categoryId: categoryId || donation.categoryId,
      locationId: locationId || donation.locationId,
    };

    if (nextPaymentMode === 'partially_paid') {
      const minimumPaidAmount = Math.ceil(Number(nextAmount) * 0.2);
      const currentPaidAmount = Number(donation.paidAmount || 0);
      const finalPaidAmount = incomingRemainingAmount !== null
        ? Number(nextAmount) - incomingRemainingAmount
        : (incomingPaidAmount !== null ? incomingPaidAmount : currentPaidAmount);

      if (!Number.isFinite(finalPaidAmount) || finalPaidAmount <= 0) {
        return sendError(res, 'Paid amount is required for partially paid donations', 400);
      }
      if (finalPaidAmount < minimumPaidAmount) {
        return sendError(
          res,
          `Paid amount must be at least 20% of total donation (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`,
          400
        );
      }
      if (finalPaidAmount > Number(nextAmount)) {
        return sendError(res, 'Paid amount cannot exceed total donation amount', 400);
      }

      updateData.paidAmount = finalPaidAmount;
      updateData.remainingAmount = Number(nextAmount) - finalPaidAmount;
      updateData.status = finalPaidAmount === Number(nextAmount) ? 'completed' : 'partially_paid';
      if (finalPaidAmount === Number(nextAmount) && !updateData.paymentDate) {
        updateData.paymentDate = new Date();
      }
    } else if (incomingPaidAmount !== null || incomingRemainingAmount !== null) {
      const finalPaidAmount = incomingRemainingAmount !== null
        ? Number(nextAmount) - incomingRemainingAmount
        : incomingPaidAmount;

      if (!Number.isFinite(finalPaidAmount) || finalPaidAmount < 0) {
        return sendError(res, 'Invalid paid amount', 400);
      }
      if (finalPaidAmount > Number(nextAmount)) {
        return sendError(res, 'Paid amount cannot exceed total donation amount', 400);
      }

      updateData.paidAmount = finalPaidAmount;
      updateData.remainingAmount = Number(nextAmount) - finalPaidAmount;
      updateData.status = finalPaidAmount === Number(nextAmount) ? 'completed' : 'partially_paid';
      if (finalPaidAmount === Number(nextAmount) && !updateData.paymentDate) {
        updateData.paymentDate = new Date();
      }
    }

    // If status is being updated to completed and it wasn't before
    const wasNotCompleted = donation.status !== 'completed';
    if (updateData.status === 'completed' && wasNotCompleted && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }

    await donation.update(updateData);

    // Generate slip/email/SMS when donation becomes fully completed
    if (updateData.status === 'completed' && wasNotCompleted) {
      const donor = await User.findByPk(donation.donorId);
      if (donor) {
        try {
          const gaushala = donation.gaushalaId ? await Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null;
          const katha = donation.kathaId ? await Katha.findByPk(donation.kathaId) : null;

          const pdfBuffer = await generateDonationSlipBuffer(donor, donation.amount, donation.cause, donation.id, donation.paymentMode, donation.paymentDate, gaushala, katha);
          const cloudinaryUrl = await uploadSlipToCloudinary(pdfBuffer, donor.name, donor.mobileNumber, donation.id);
          await donation.update({ slipUrl: cloudinaryUrl });
          console.log(`✅ Donation slip uploaded & saved: ${cloudinaryUrl}`);

          if (donor.email) {
            const emailHtml = getDonationEmailTemplate(donor.name, donation.amount, donation.cause, donation.id);
            await sendEmail(donor.email, 'Donation Completed - Thank You!', emailHtml, [
              { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
            ]);
          }

          // Send SMS notification
          if (donor.mobileNumber) {
            const category = donation.categoryId ? await Category.findByPk(donation.categoryId) : null;
            const gaushala = donation.gaushalaId ? await Gaushala.findByPk(donation.gaushalaId) : null;
            const katha = donation.kathaId ? await Katha.findByPk(donation.kathaId) : null;
            
            let city = '', taluka = '', village = '';
            const locId = donation.locationId;
            if (locId) {
              const loc = await Location.findByPk(locId, {
                include: [{ model: Location, as: 'parent', include: [{ model: Location, as: 'parent' }] }]
              });
              if (loc) {
                if (loc.type === 'village') {
                  village = loc.name;
                  taluka = loc.parent?.name || '';
                  city = loc.parent?.parent?.name || '';
                } else if (loc.type === 'taluka') {
                  taluka = loc.name;
                  city = loc.parent?.name || '';
                } else {
                  city = loc.name;
                }
              }
            }

            await sendDetailedDonationSMS(donor.name, donation.amount, donation.id, donor.mobileNumber, {
              category: category?.name,
              gaushala: gaushala?.name,
              katha: katha?.name,
              city,
              taluka,
              village
            });
          }
        } catch (slipError) {
          console.error('❌ Slip generation/upload error (donation still updated):', slipError);
        }
      }
    }

    return sendSuccess(res, donation, 'Donation updated successfully');
  } catch (error) {
    console.error('❌ [updateDonation] Error:', error);
    return sendError(res, 'Error updating donation', 500, error);
  }
};
