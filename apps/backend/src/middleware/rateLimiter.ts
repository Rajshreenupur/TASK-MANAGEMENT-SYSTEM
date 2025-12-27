import rateLimit from 'express-rate-limit';

const AUTH_WINDOW_MS = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const AUTH_MAX_REQUESTS = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '50', 50); // 5 requests per window
const GENERAL_WINDOW_MS = parseInt(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const GENERAL_MAX_REQUESTS = parseInt(process.env.GENERAL_RATE_LIMIT_MAX || '100', 10); // 100 requests per window

export const authRateLimiter = rateLimit({
  windowMs: AUTH_WINDOW_MS,
  max: AUTH_MAX_REQUESTS,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true, 
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: GENERAL_WINDOW_MS,
  max: GENERAL_MAX_REQUESTS,
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as any).user?.userId;
    return userId || req.ip || req.socket.remoteAddress || 'unknown';
  },
});

export const refreshTokenRateLimiter = rateLimit({
  windowMs: parseInt(process.env.REFRESH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.REFRESH_RATE_LIMIT_MAX || '10', 10), // 10 requests per window
  message: {
    error: 'Too many token refresh attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
});

