import { env } from '../config/env.js';
import type { Response, CookieOptions, Request } from 'express';

export const ACCESS_COOKIE = 'accessToken';
export const REFRESH_COOKIE = 'refreshToken';
const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
};

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...baseOptions,
    path: '/',
    maxAge: env.JWT_ACCESS_TTL_SEC * 1000,
  });

  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    path: '/api/v1/auth',
    maxAge: env.JWT_REFRESH_TTL_SEC * 1000,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions, path: '/api/v1/auth' });
}

export function getCookie(req: Request, name: string): string | undefined {
  const value: unknown = req.cookies?.[name];
  return typeof value === 'string' ? value : undefined;
}
