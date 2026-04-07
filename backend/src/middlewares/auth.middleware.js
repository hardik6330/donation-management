import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { sendError } from '../utils/apiResponse.js';
import { JWT_SECRET } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get user from database using id from token
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'isAdmin'] // Only fetch needed fields
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
