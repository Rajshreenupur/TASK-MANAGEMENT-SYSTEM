import { Router } from 'express';
import { register, login, getMe, refreshToken, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validation.js';
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '../utils/validation.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', validate(logoutSchema), logout);
router.get('/me', authenticate, getMe);

export default router;

