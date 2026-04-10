import { Donation } from '../models/donation.js';
import { User } from '../models/user.js';
import { Category } from '../models/category.js';
import { Gaushala } from '../models/gaushala.js';
import { Katha } from '../models/katha.js';
import { Location } from '../models/location.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getPaginationParams, getPaginatedResponse, processFields } from '../utils/pagination.js';
import { buildDonationFilter } from '../utils/filterHelper.js';
import { razorpay } from '../config/razorpay.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { sequelize } from '../config/db.js';
import { FRONTEND_URL, RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } from '../config/db.js';
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
      referenceName
    } = req.body;

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

    // Determine the most specific location provided (Village > Taluka > City)
    const targetLocationId = villageId || talukaId || cityId;
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
      status: paymentMode === 'cash' ? 'completed' : 'pending',
      paymentDate: paymentMode === 'cash' ? new Date() : null,
    };

    if (paymentMode === 'cash' || paymentMode === 'pay_later') {
      const donation = await Donation.create(donationData);
      
      // Generate slip, upload to Cloudinary, save URL, and send email/SMS for Cash Donation
      if (paymentMode === 'cash') {
        // Run background tasks without blocking the main response if possible
        // But in serverless we should wait to ensure they finish.
        // Using Promise.all to run them in parallel.
        (async () => {
          try {
            const [gaushala, katha] = await Promise.all([
              gaushalaId ? Gaushala.findByPk(gaushalaId, { include: [{ model: Location, as: 'location' }] }) : Promise.resolve(null),
              kathaId ? Katha.findByPk(kathaId) : Promise.resolve(null)
            ]);

            const pdfBuffer = await generateDonationSlipBuffer(user, amount, causeString, donation.id, paymentMode, donation.paymentDate, gaushala, katha);
            
            // Start Cloudinary, Email, and SMS tasks in parallel
            const tasks = [];
            
            // 1. Cloudinary Upload
            const uploadTask = uploadSlipToCloudinary(pdfBuffer, user.name, user.mobileNumber, donation.id)
              .then(url => donation.update({ slipUrl: url }))
              .catch(err => console.error('❌ Cloudinary Upload Error:', err));
            tasks.push(uploadTask);

            // 2. Email Task
            if (user.email) {
              const emailHtml = getDonationEmailTemplate(user.name, amount, causeString, donation.id);
              const emailTask = sendEmail(user.email, 'Donation Received - Thank You!', emailHtml, [
                { filename: `Donation_Receipt_${donation.id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }
              ]).catch(err => console.error('❌ Email Error:', err));
              tasks.push(emailTask);
            }

            // 3. SMS Task
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

      const message = paymentMode === 'cash'
        ? 'Cash donation recorded successfully'
        : 'Donation intent recorded (Pay Later)';
      return sendSuccess(res, { donationId: donation.id, paymentMode }, message);
    }

    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const donation = await Donation.create({
      ...donationData,
      razorpay_order_id: order.id,
    });

    return sendSuccess(res, { 
      order, 
      donationId: donation.id, 
      razorpay_key_id: RAZORPAY_KEY_ID, 
      paymentMode: 'online' 
    }, 'Razorpay order created successfully');
  } catch (error) {
    console.error('❌ [createDonationOrder] Error:', error);
    return sendError(res, 'Error creating donation order', 500, error);
  }
};

// 3. Payment Verify Karo
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      const donation = await Donation.findByPk(donationId);
      if (!donation) return sendError(res, 'Donation not found', 404);

      // Fetch donor info for email
      const donor = await User.findByPk(donation.donorId);

      await donation.update({
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        paymentDate: new Date(),
      });

      // Generate slip, upload to Cloudinary, save URL, and send email
      if (donor) {
        try {
          const gaushala = donation.gaushalaId ? await Gaushala.findByPk(donation.gaushalaId, { include: [{ model: Location, as: 'location' }] }) : null;
          const katha = donation.kathaId ? await Katha.findByPk(donation.kathaId) : null;

          const pdfBuffer = await generateDonationSlipBuffer(donor, donation.amount, donation.cause, donation.id, 'online', new Date(), gaushala, katha);
          const cloudinaryUrl = await uploadSlipToCloudinary(pdfBuffer, donor.name, donor.mobileNumber, donation.id);
          await donation.update({ slipUrl: cloudinaryUrl });
          console.log(`✅ Donation slip uploaded & saved: ${cloudinaryUrl}`);

          if (donor.email) {
            const emailHtml = getDonationEmailTemplate(donor.name, donation.amount, donation.cause, donation.id);
            await sendEmail(donor.email, 'Donation Successful - Thank You!', emailHtml, [
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
          console.error('❌ Slip generation/upload error (payment still verified):', slipError);
        }
      }

      return sendSuccess(res, donation, 'Payment verified successfully');
    } else {
      const donation = await Donation.findByPk(donationId);
      if (donation) await donation.update({ status: 'failed' });
      return sendError(res, 'Invalid signature', 400);
    }
  } catch (error) {
    return sendError(res, 'Error verifying payment', 500, error);
  }
};

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

    return sendSuccess(res, responseData, 'Donations fetched successfully');
  } catch (error) {
    console.error('❌ [getDonations] Error:', error);
    return sendError(res, 'Error fetching donations', 500, error);
  }
};

export const getDonors = async (req, res) => {
  try {
    const { search, name, mobileNumber, city, minAmount, maxAmount } = req.query;
    const { page, limit, isFetchAll, queryLimit, offset } = getPaginationParams(req.query);

    let whereClause = {
      isAdmin: false
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    if (name) {
      whereClause.name = { [Op.like]: `%${name}%` };
    }

    if (mobileNumber) {
      whereClause.mobileNumber = { [Op.like]: `%${mobileNumber}%` };
    }

    if (city) {
      whereClause[Op.or] = [
        ...(whereClause[Op.or] || []),
        { village: { [Op.like]: `%${city}%` } },
        { district: { [Op.like]: `%${city}%` } }
      ];
    }

    const havingConditions = [];
    if (minAmount) {
      havingConditions.push(sequelize.where(sequelize.fn('SUM', sequelize.col('Donations.amount')), { [Op.gte]: Number(minAmount) }));
    }
    if (maxAmount) {
      havingConditions.push(sequelize.where(sequelize.fn('SUM', sequelize.col('Donations.amount')), { [Op.lte]: Number(maxAmount) }));
    }
    const havingClause = havingConditions.length > 0 ? { [Op.and]: havingConditions } : undefined;

    const countResult = await User.findAll({
      where: whereClause,
      include: [{
        model: Donation,
        attributes: []
      }],
      attributes: ['id'],
      group: ['User.id'],
      ...(havingClause && { having: havingClause }),
      subQuery: false
    });

    const totalCount = countResult.length;

    const donors = await User.findAll({
      where: whereClause,
      include: [{
        model: Donation,
        attributes: []
      }],
      attributes: [
        'id', 'name', 'email', 'mobileNumber','address', 'village', 'district', 'companyName', 'createdAt',
        [sequelize.fn('COUNT', sequelize.col('Donations.id')), 'donationCount'],
        [sequelize.fn('SUM', sequelize.col('Donations.amount')), 'totalDonated']
      ],
      group: ['User.id'],
      ...(havingClause && { having: havingClause }),
      order: [[sequelize.literal('totalDonated'), 'DESC']],
      subQuery: false,
      ...(queryLimit && { limit: queryLimit }),
      ...(offset !== undefined && { offset })
    });

    const result = getPaginatedResponse({
      rows: donors,
      count: totalCount,
      limit,
      page,
      isFetchAll,
      dataKey: 'donors'
    });

    return sendSuccess(res, result, 'Donors fetched successfully');
  } catch (error) {
    console.error('❌ [getDonors] Error:', error);
    return sendError(res, 'Error fetching donors', 500, error);
  }
};

// 4. Update Donation
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, cause, status, paymentMode, paymentDate, categoryId, locationId } = req.body;

    const donation = await Donation.findByPk(id);
    if (!donation) {
      return sendError(res, 'Donation not found', 404);
    }

    const updateData = {
      amount: amount || donation.amount,
      cause: cause || donation.cause,
      status: status || donation.status,
      paymentMode: paymentMode || donation.paymentMode,
      paymentDate: paymentDate || donation.paymentDate,
      categoryId: categoryId || donation.categoryId,
      locationId: locationId || donation.locationId,
    };

    // If status is being updated to completed and it wasn't before
    const wasNotCompleted = donation.status !== 'completed';
    if (status === 'completed' && wasNotCompleted && !updateData.paymentDate) {
      updateData.paymentDate = new Date();
    }

    await donation.update(updateData);

    // Generate slip when pay_later donation is marked as completed
    if (status === 'completed' && wasNotCompleted) {
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
