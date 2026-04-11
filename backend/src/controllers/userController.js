import { User, Role } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess } from '../utils/apiResponse.js';
import { JWT_SECRET, REFRESH_TOKEN_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MOBILE } from '../config/env.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';



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
export const createUser = asyncHandler(async (req, res) => {
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
});

// Auth specific methods
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role, as: 'role' }]
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  const isPasswordValid = user.password ? bcrypt.compareSync(password, user.password) : false;
  if (!isPasswordValid) {
    const error = new Error('Invalid password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  return sendSuccess(res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      roleId: user.roleId,
      role: user.role
    }
  }, 'Login successful');
});

export const logoutUser = asyncHandler(async (req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll();
  return sendSuccess(res, users, 'All users records fetched successfully');
});


// ===== SYSTEM USER MANAGEMENT (Admin) =====

export const getSystemUsers = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { search, roleId } = req.query;

  const where = {};
  if (search && search.trim() !== '') {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { mobileNumber: { [Op.like]: `%${search}%` } }
    ];
  }
  if (roleId && roleId.trim() !== '') {
    where.roleId = roleId;
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });

  const response = getPaginatedResponse({ rows, count, limit, page, dataKey: 'rows' });
  return sendSuccess(res, response);
});

export const addSystemUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNumber, password, roleId, isAdmin } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await User.create({
    name,
    email,
    mobileNumber,
    password: hashedPassword,
    roleId: roleId || null,
    isAdmin: isAdmin || false,
    created_by: req.user?.id || 'System',
  });

  const result = user.toJSON();
  delete result.password;
  return sendSuccess(res, result, 'System user created successfully', 201);
});

export const updateSystemUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const { name, email, mobileNumber, password, roleId, isAdmin } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (mobileNumber) updateData.mobileNumber = mobileNumber;
  if (password) updateData.password = bcrypt.hashSync(password, 10);
  if (roleId !== undefined) updateData.roleId = roleId || null;
  if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

  await user.update(updateData);
  const result = user.toJSON();
  delete result.password;
  return sendSuccess(res, result, 'User updated successfully');
});

export const deleteSystemUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user?.id) {
    const error = new Error('Cannot delete yourself');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByPk(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await user.destroy();
  return sendSuccess(res, null, 'User deleted successfully');
});

export const getUserByMobile = asyncHandler(async (req, res) => {
  const { mobileNumber } = req.params;
  const user = await User.findOne({ where: { mobileNumber } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, user, 'User found successfully');
});

// Initial Admin Creation (Seed)
export const seedAdmin = async () => {
  try {
    const adminEmail = ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = ADMIN_PASSWORD || 'Admin@123';
    const adminMobile = ADMIN_MOBILE || '9876543210';

    const adminExists = await User.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      // 1. Find the 'Admin' or 'Super Admin' role
      let adminRole = await Role.findOne({ 
        where: { 
          name: { [Op.or]: ['Admin', 'Super Admin'] } 
        } 
      });

      // 2. If role doesn't exist, create 'Admin' role with full permissions
      if (!adminRole) {
        console.log('ℹ️ Admin role not found, creating one...');
        const MODULES = ['dashboard', 'donations', 'donors', 'expenses', 'sevaks', 'gaushala', 'katha', 'mandal', 'kartalDhun', 'bapuSchedule', 'category', 'location', 'users'];
        const fullPerms = {};
        MODULES.forEach(m => { fullPerms[m] = 'full'; });
        
        adminRole = await Role.create({ 
          name: 'Admin', 
          permissions: fullPerms, 
          description: 'Full access to all modules' 
        });
      }

      const hashedPassword = bcrypt.hashSync(adminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        mobileNumber: adminMobile,
        password: hashedPassword,
        isAdmin: true,
        roleId: adminRole ? adminRole.id : null,
        created_by: 'System',
      });
      console.log(`✅ Initial Admin created successfully with role: ${adminRole.name}`);
    } else {
      console.log('ℹ️ Admin already exists, skipping creation');
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
};
