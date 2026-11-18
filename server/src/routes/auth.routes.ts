import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../validators/auth.schema.js';
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { forgotPasswordLimiter, loginLimiter, registerLimiter } from '../middlewares/rateLimit.js';

export const authRouter = Router();

authRouter.post('/register', registerLimiter, validate(registerSchema), register);
authRouter.post('/login', loginLimiter, validate(loginSchema), login);
authRouter.get('/me', requireAuth, me);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);
