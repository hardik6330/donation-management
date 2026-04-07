import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import { JWT_SECRET } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return sendError(res, 'Not authorized', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token', 401);
  }
};
