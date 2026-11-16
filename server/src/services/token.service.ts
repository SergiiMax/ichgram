import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { randomUUID } from 'node:crypto';
import { redis } from '../config/redis.js';

export function signAccessToken(userId: string) {
  const token = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL_SEC,
  });
  return token;
}

export async function signRefreshToken(userId: string) {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL_SEC,
  });
  await redis.set(`refresh:${userId}:${jti}`, '1', 'EX', env.JWT_REFRESH_TTL_SEC);
  return token;
}

export async function issueTokens(userId: string) {
  const accessToken = signAccessToken(userId);
  const refreshToken = await signRefreshToken(userId);
  return { accessToken, refreshToken };
}
