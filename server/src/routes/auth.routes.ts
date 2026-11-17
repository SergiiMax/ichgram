import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';
import { login, me, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.get('/me', requireAuth, me);
