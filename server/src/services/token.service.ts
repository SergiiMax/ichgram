import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { randomUUID } from 'node:crypto';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

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

export function verifyAccessToken(token: string) {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);

  if (typeof payload === 'string' || !payload.sub) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }

  return payload.sub;
}

export function verifyRefreshToken(token: string) {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);

  if (typeof payload === 'string' || !payload.sub || !payload.jti) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }

  return { userId: payload.sub, jti: payload.jti };
}

export async function consumeRefreshToken(userId: string, jti: string) {
  const deleted = await redis.del(`refresh:${userId}:${jti}`);
  return deleted === 1;
}

export async function revokeRefreshToken(userId: string, jti: string) {
  await redis.del(`refresh:${userId}:${jti}`);
}

export async function revokeAllRefreshTokens(userId: string) {
  const stream = redis.scanStream({ match: `refresh:${userId}:*`, count: 100 });
  for await (const keys of stream) {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
