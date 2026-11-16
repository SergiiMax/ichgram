import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../validators/auth.schema.js';
import { register } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), register);
