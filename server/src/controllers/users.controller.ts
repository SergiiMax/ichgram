import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import * as userService from '../services/user.service.js';
import { getUserId } from '../middlewares/auth.js';

export const updateAvatar: RequestHandler = async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'Image file is required');
  }
  const user = await userService.updateAvatar(getUserId(req), req.file.buffer);
  res.json({ user });
};
