import { sendError } from '../utils/apiResponse.js';
import { NODE_ENV, ALLOWED_IPS } from '../config/env.js';

/**
 * Middleware to allow requests only from specific IPs
 */
export const ipAuth = (req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`🌐 [Incoming Request] Method: ${req.method} | Path: ${req.path} | IP: ${clientIp}`);

  // Allow all in development mode to avoid dynamic IP issues
  if (NODE_ENV === 'development') {
    return next();
  }

  const allowedIps = ALLOWED_IPS ? ALLOWED_IPS.split(',') : [];

  // If no IPs are configured, allow all (optional, or block all)
  if (allowedIps.length === 0) {
    return next();
  }

  // Handle IPv6 localhost and clean up IP
  let cleanIp = clientIp;
  if (cleanIp.includes('::ffff:')) {
    cleanIp = cleanIp.split('::ffff:')[1];
  }

  const isAllowed = allowedIps.some(ip => {
    const trimmedIp = ip.trim();
    return cleanIp === trimmedIp || clientIp === trimmedIp;
  });

  if (isAllowed) {
    next();
  } else {
    console.warn(`🛑 Unauthorized access attempt from IP: ${clientIp}`);
    return sendError(res, `Access denied from IP: ${clientIp}`, 403);
  }
};
