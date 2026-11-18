import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { getProfile, updateAvatar } from '../controllers/users.controller.js';

export const userRouter = Router();

userRouter.patch('/me/avatar', requireAuth, imageUpload.single('avatar'), updateAvatar);
userRouter.get('/:username', requireAuth, getProfile);
