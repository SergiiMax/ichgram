import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { clearAuthCookies, getCookie, REFRESH_COOKIE, setAuthCookies } from '../utils/cookies.js';
import { getUserId } from '../middlewares/auth.js';

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body);
  setAuthCookies(res, result);
  res.status(201).json({
    user: result.user,
  });
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result);
  res.status(200).json({
    user: result.user,
  });
};

export const me: RequestHandler = async (req, res) => {
  const user = await authService.getCurrentUser(getUserId(req));
  res.json({ user });
};

export const refresh: RequestHandler = async (req, res) => {
  const tokens = await authService.refresh(getCookie(req, REFRESH_COOKIE));
  setAuthCookies(res, tokens);
  res.status(204).end();
};

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(getCookie(req, REFRESH_COOKIE));
  clearAuthCookies(res);
  res.status(204).end();
};
