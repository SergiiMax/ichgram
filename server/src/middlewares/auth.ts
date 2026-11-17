import type { RequestHandler } from 'express';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../services/token.service.js';
import jwt from 'jsonwebtoken';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies[ACCESS_COOKIE];

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  try {
    req.user = { id: verifyAccessToken(token) };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRED', 'Access token expired');
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }

  next();
};
