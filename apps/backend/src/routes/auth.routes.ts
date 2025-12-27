import { Router } from 'express';
import { register, login, getMe, refreshToken, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '../utils/validation.js';
import { authRateLimiter, refreshTokenRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refreshTokenRateLimiter, validate(refreshTokenSchema), refreshToken);
router.post('/logout', validate(logoutSchema), logout);
router.get('/me', authenticate, getMe);

export default router;

