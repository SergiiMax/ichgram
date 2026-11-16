import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { setAuthCookies } from '../utils/cookies.js';

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body);
  setAuthCookies(res, result);
  res.status(201).json({
    user: result.user,
  });
};
