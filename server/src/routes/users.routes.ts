import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { getProfile, updateAvatar, updateMe } from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validators/user.schema.js';

export const userRouter = Router();

userRouter.patch('/me/avatar', requireAuth, imageUpload.single('avatar'), updateAvatar);
userRouter.patch('/me', requireAuth, validate(updateProfileSchema), updateMe);
userRouter.get('/:username', requireAuth, getProfile);
