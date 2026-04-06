import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Helper methods for tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '15d',
  });
};

const generateRefreshToken = async (userId) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

// Override create (Registration)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, address, village, district, companyName, mobileNumber } = req.body;
    const createdBy = req.user && req.user.id ? req.user.id : 'System';

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      village,
      district,
      companyName,
      mobileNumber,
      created_by: createdBy,
    });
    
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    return sendError(res, 'Error creating user', 500, error);
  }
};

// Auth specific methods
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    const isPasswordValid = user.password ? bcrypt.compareSync(password, user.password) : false;
    if (!isPasswordValid) {
      return sendError(res, 'Invalid password', 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return sendSuccess(res, { accessToken, refreshToken, user: { id: user.id, name: user.name, isAdmin: user.isAdmin } }, 'Login successful');
  } catch (error) {
    return sendError(res, 'Error logging in', 500, error);
  }
};

export const logoutUser = async (req, res) => {
  try {
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 'Error logging out', 500, error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return sendSuccess(res, users, 'Users fetched successfully');
  } catch (error) {
    return sendError(res, 'Error fetching users', 500, error);
  }
};

export const getUserByMobile = async (req, res) => {
  try {
    const { mobileNumber } = req.params;
    const user = await User.findOne({ where: { mobileNumber } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, user, 'User found successfully');
  } catch (error) {
    return sendError(res, 'Error fetching user', 500, error);
  }
};

// Initial Admin Creation (Seed)
export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminMobile = process.env.ADMIN_MOBILE || '9876543210';

    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        mobileNumber: adminMobile,
        password: hashedPassword,
        isAdmin: true,
        created_by: 'System',
      });
      console.log('✅ Initial Admin created successfully');
    } else {
      console.log('ℹ️ Admin already exists, skipping creation');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};
