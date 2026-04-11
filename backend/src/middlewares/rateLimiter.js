import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';
import { NODE_ENV } from '../config/env.js';

const tooMany = (res) =>
  sendError(res, 'Too many requests from this IP, please try again later.', 429);

/** Broad limit for all /api/v1 traffic (per IP, sliding window). */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'development' ? 2000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => tooMany(res),
});

/** Stricter limit for auth endpoints (login / register). */
export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => tooMany(res),
});
