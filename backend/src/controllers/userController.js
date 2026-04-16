import { User, Role } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendSuccess } from '../utils/apiResponse.js';
import { JWT_SECRET, REFRESH_TOKEN_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MOBILE } from '../config/env.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getPaginationParams, getPaginatedResponse } from '../utils/pagination.js';
import { Op } from 'sequelize';
import { notFound, badRequest, unauthorized } from '../utils/httpError.js';



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
  const { name, email, password, address, city, state, country, companyName, mobileNumber } = req.body;
  const createdBy = req.user && req.user.id ? req.user.id : 'System';

  const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    address,
    city,
    state,
    country,
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
    throw notFound('User');
  }
  const isPasswordValid = user.password ? bcrypt.compareSync(password, user.password) : false;
  if (!isPasswordValid) {
    throw unauthorized('Invalid password');
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

  const where = {
    // Super Admin ને લિસ્ટમાં ન બતાવવા માટે (admin@example.com)
    email: { [Op.ne]: 'admin@example.com' }
  };

  if (search && search.trim() !== '') {
    where[Op.and] = [
      { email: { [Op.ne]: 'admin@example.com' } },
      {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobileNumber: { [Op.like]: `%${search}%` } }
        ]
      }
    ];
    // remove separate email filter if we use Op.and
    delete where.email;
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
    throw notFound('User');
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
    throw badRequest('Cannot delete yourself');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw notFound('User');
  }

  await user.destroy();
  return sendSuccess(res, null, 'User deleted successfully');
});

export const getUserByMobile = asyncHandler(async (req, res) => {
  const { mobileNumber } = req.params;
  const user = await User.findOne({ where: { mobileNumber } });
  if (!user) {
    throw notFound('User');
  }
  return sendSuccess(res, user, 'User found successfully');
});
