import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';
import { sendError } from '../utils/apiResponse.js';
import { JWT_SECRET } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'isAdmin', 'roleId'],
        include: [{ model: Role, as: 'role' }]
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      req.user = user;
      next();
    } catch (error) {
      return sendError(res, 'Not authorized', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token', 401);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return sendError(res, 'Access denied: Admins only', 403);
  }
};

// Permission-based middleware
// level: 'view' | 'entry' | 'full'
// 'view' allows: view
// 'entry' allows: view + entry (create/update)
// 'full' allows: view + entry + delete + manage
export const requirePermission = (module, level = 'view') => {
  return (req, res, next) => {
    // Admin bypasses all permission checks
    if (req.user?.isAdmin) return next();

    const role = req.user?.role;
    if (!role) {
      return sendError(res, 'Access denied: No role assigned', 403);
    }

    let perms = role.permissions;
    if (typeof perms === 'string') {
      try { perms = JSON.parse(perms); } catch { perms = {}; }
    }
    if (!perms || typeof perms !== 'object') {
      return sendError(res, 'Access denied: Invalid permissions', 403);
    }

    const userPerm = perms[module];
    if (!userPerm || userPerm === 'none') {
      return sendError(res, `Access denied: No access to ${module}`, 403);
    }

    const permLevels = { view: 1, entry: 2, full: 3 };
    if ((permLevels[userPerm] || 0) >= (permLevels[level] || 0)) {
      return next();
    }

    return sendError(res, `Access denied: Requires ${level} permission for ${module}`, 403);
  };
};
