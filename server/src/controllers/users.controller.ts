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

export const getProfile: RequestHandler = async (req, res) => {
  const { username } = req.params;
  if (typeof username !== 'string') {
    throw new AppError(400, 'INVALID_USERNAME', 'Invalid username');
  }

  const user = await userService.getProfile(username, getUserId(req));
  res.json({ user });
};

export const updateMe: RequestHandler = async (req, res) => {
  const user = await userService.updateProfile(getUserId(req), req.body);
  res.json({ user });
};
