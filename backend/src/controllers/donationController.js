import { Donation, User, Category, Gaushala, Katha, Location } from '../models/index.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { findOrCreateLocationStructure } from '../utils/locationHelper.js';
// import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { FRONTEND_URL } from '../config/env.js';
// import { RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } from '../config/env.js';
import { Op } from 'sequelize';
import { sendEmail, getDonationEmailTemplate } from '../services/email.service.js';
import { sendDetailedDonationSMS } from '../services/sms.service.js';
import { generateDonationSlipBuffer, uploadSlipToCloudinary } from '../services/donationSlip.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notFound, badRequest } from '../utils/httpError.js';

// 1. QR Code Generate Karo
export const generateQRCode = asyncHandler(async (req, res) => {
  console.log(FRONTEND_URL);
  const frontendURL = FRONTEND_URL + '/donate';

  const qrCodeData = await QRCode.toDataURL(frontendURL);
  return sendSuccess(res, { qrCodeData, frontendURL }, 'QR code generated successfully');
});

// 2. Razorpay Order Create Karo
export const createDonationOrder = asyncHandler(async (req, res) => {
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
      // Build location path: "Village, Taluka, City" in Gujarati
      const parts = [location.nameGuj || location.name];
      let current = location.parent;
      while (current) {
        parts.push(current.nameGuj || current.name);
        current = current.parent;
      }
      locationName = parts.join(', ');
    }
  }

  // Example Cause: "મોરારી બાપુ કથા જે ડુંગરા, કામરેજ, સુરત માં છે તેના માટે"
  if (kathaName && locationName) {
    causeString = `${kathaName} જે ${locationName} માં છે તેના માટે`;
  } else if (kathaName) {
    causeString = `${kathaName} માટે`;
  } else if (categoryName && locationName) {
    causeString = `${categoryName} જે ${locationName} માં છે તેના માટે`;
  } else {
    causeString = `${categoryName} માટે`;
  }

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
      throw badRequest('Paid amount is required for partial payment');
    }
    if (partialPaidAmount < minimumPaidAmount) {
      throw badRequest(`Paid amount must be at least 20% of total donation (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`);
    }
    if (partialPaidAmount >= totalAmount) {
      throw badRequest('Paid amount must be less than total donation amount');
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
    try {
      const [gaushala, katha] = await Promise.all([
        gaushalaId ? Gaushala.findByPk(gaushalaId, { include: [{ model: Location, as: 'location' }] }) : Promise.resolve(null),
        kathaId ? Katha.findByPk(kathaId) : Promise.resolve(null),
      ]);

      let locationAddress = '';
      if (targetLocationId) {
        const parts = [];
        let loc = await Location.findByPk(targetLocationId);
        while (loc) {
          parts.push(loc.name);
          loc = loc.parentId ? await Location.findByPk(loc.parentId) : null;
        }
        locationAddress = parts.join(', ');
      }

      const pdfBuffer = await generateDonationSlipBuffer(
        user,
        amount,
        causeString,
        donation.id,
        paymentMode,
        donation.paymentDate,
        gaushala,
        katha,
        locationAddress
      );

      const tasks = [];

      const uploadTask = uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id)
        .then(async url => {
          console.log(`[Donation ${donation.id}] ✅ Cloudinary upload success: ${url}`);
          await donation.update({ slipUrl: url });
        })
        .catch(err => {
          console.error(`[Donation ${donation.id}] ❌ Cloudinary Upload Error:`, {
            message: err.message,
            stack: err.stack,
            details: err
          });
        });
      tasks.push(uploadTask);

      if (user.email) {
        console.log(`[Donation ${donation.id}] 📧 Preparing to send email to ${user.email}`);
        const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
        const emailTask = sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
          { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
        ])
        .then(() => console.log(`[Donation ${donation.id}] ✅ Email sent successfully to ${user.email}`))
        .catch(err => {
          console.error(`[Donation ${donation.id}] ❌ Email Error for ${user.email}:`, {
            message: err.message,
            stack: err.stack,
            details: err
          });
        });
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
                village = locData.nameGuj || locData.name;
                taluka = locData.parent?.nameGuj || locData.parent?.name || '';
                city = locData.parent?.parent?.nameGuj || locData.parent?.parent?.name || '';
              } else if (locData.type === 'taluka') {
                taluka = locData.nameGuj || locData.name;
                city = locData.parent?.nameGuj || locData.parent?.name || '';
              } else {
                city = locData.nameGuj || locData.name;
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
      console.error('❌ Post-donation tasks failed:', error);
    }
  }

  const message = isDirectPay
    ? 'Donation recorded successfully'
    : isPartialPay
      ? 'Partial donation recorded successfully'
      : 'Donation intent recorded (Pay Later)';
  return sendSuccess(res, { donationId: donation.id, paymentMode }, message);
});

// 3. Payment Verify (Razorpay - commented out)
// Razorpay verification is disabled. Online donations are now saved directly.
export const verifyPayment = asyncHandler(async (req, res) => {
  throw badRequest('Razorpay payment verification is currently disabled. Online donations are saved directly.');
});

export const getDonations = asyncHandler(async (req, res) => {
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
});

export const getDonors = asyncHandler(async (req, res) => {
  const {
    search,
    name,
    mobileNumber,
    district,
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

  if (district) {
    donorWhere.district = { [Op.like]: `%${district}%` };
  }

  if (villageId || talukaId || cityId) {
    const targetId = villageId || talukaId || cityId;
    const location = await Location.findByPk(targetId);
    if (location) {
      if (location.type === 'village') {
        donorWhere.village = location.name;
      } else {
        // For taluka or city, we'll search in district for now as per user's request
        // or we could be more specific if needed. 
        // User specifically said "direct je district che ae search karvanu"
        donorWhere.district = location.name;
      }
    }
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
});

// 4. Update Donation
export const updateDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, cause, status, paymentMode, paymentDate, categoryId, locationId, paidAmount, remainingAmount } = req.body;

  const donation = await Donation.findByPk(id);
  if (!donation) {
    throw notFound('Donation');
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
      throw badRequest('Paid amount is required for partially paid donations');
    }
    if (finalPaidAmount < minimumPaidAmount) {
      throw badRequest(`Paid amount must be at least 20% of total donation (minimum ₹${minimumPaidAmount.toLocaleString('en-IN')})`);
    }
    if (finalPaidAmount > Number(nextAmount)) {
      throw badRequest('Paid amount cannot exceed total donation amount');
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
      throw badRequest('Invalid paid amount');
    }
    if (finalPaidAmount > Number(nextAmount)) {
      throw badRequest('Paid amount cannot exceed total donation amount');
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
      console.log(`[Donation ${donation.id}] 🔄 Donation marked completed. Processing tasks...`);
      try {
        const [gaushala, katha] = await Promise.all([
          donation.gaushalaId ? Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null,
          donation.kathaId ? Katha.findByPk(donation.kathaId) : null,
        ]);

        let locationAddress = '';
        if (donation.locationId) {
          const parts = [];
          let loc = await Location.findByPk(donation.locationId);
          while (loc) {
            parts.push(loc.name);
            loc = loc.parentId ? await Location.findByPk(loc.parentId) : null;
          }
          locationAddress = parts.join(', ');
        }

        const pdfBuffer = await generateDonationSlipBuffer(
          donor, 
          donation.amount, 
          donation.cause, 
          donation.id, 
          donation.paymentMode, 
          donation.paymentDate, 
          gaushala, 
          katha,
          locationAddress
        );
        
        const tasks = [];

        const uploadTask = uploadSlipToCloudinary(pdfBuffer, donor.name, donor.mobileNumber, donation.id)
          .then(async cloudinaryUrl => {
            await donation.update({ slipUrl: cloudinaryUrl });
            console.log(`[Donation ${donation.id}] ✅ Donation slip uploaded & saved: ${cloudinaryUrl}`);
          })
          .catch(err => console.error(`[Donation ${donation.id}] ❌ Cloudinary Upload Error:`, err));
        tasks.push(uploadTask);

        if (donor.email) {
          console.log(`[Donation ${donation.id}] 📧 Preparing to send email to ${donor.email}`);
          const emailHtml = getDonationEmailTemplate(donor.name, donation.amount, donation.cause, donation.id);
          const emailTask = sendEmail(donor.email, 'Donation Completed - Thank You!', emailHtml, [
            { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
          ])
          .then(() => console.log(`[Donation ${donation.id}] ✅ Email sent successfully to ${donor.email}`))
          .catch(err => console.error(`[Donation ${donation.id}] ❌ Email Error for ${donor.email}:`, err));
          tasks.push(emailTask);
        }

        // Send SMS notification
        if (donor.mobileNumber) {
          const smsTask = (async () => {
            try {
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
                    village = loc.nameGuj || loc.name;
                    taluka = loc.parent?.nameGuj || loc.parent?.name || '';
                    city = loc.parent?.parent?.nameGuj || loc.parent?.parent?.name || '';
                  } else if (loc.type === 'taluka') {
                    taluka = loc.nameGuj || loc.name;
                    city = loc.parent?.nameGuj || loc.parent?.name || '';
                  } else {
                    city = loc.nameGuj || loc.name;
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
              console.log(`[Donation ${donation.id}] ✅ SMS sent successfully to ${donor.mobileNumber}`);
            } catch (err) {
              console.error(`[Donation ${donation.id}] ❌ SMS Error:`, err);
            }
          })();
          tasks.push(smsTask);
        }
        
        await Promise.all(tasks);
        console.log(`[Donation ${donation.id}] ✅ All post-update tasks completed.`);
      } catch (slipError) {
        console.error(`[Donation ${donation.id}] ❌ Post-update tasks failed:`, slipError);
      }
    }
  }

  return sendSuccess(res, donation, 'Donation updated successfully');
});
