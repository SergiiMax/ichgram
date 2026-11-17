import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from '../utils/cookies.js';

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
  const user = await authService.getCurrentUser(req.user!.id);
  res.json({ user });
};

export const refresh: RequestHandler = async (req, res) => {
  const tokens = await authService.refresh(req.cookies[REFRESH_COOKIE]);
  setAuthCookies(res, tokens);
  res.status(204).end();
};

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(204).end();
};
