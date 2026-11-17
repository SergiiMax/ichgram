import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

function createLimiter(prefix: string, windowMs: number, limit: number) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: new RedisStore({
      prefix: `rl:${prefix}:`,
      sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as never,
    }),
    handler: (_req, _res, next) => {
      next(new AppError(429, 'TOO_MANY_REQUESTS', 'Too many attempts, try again later'));
    },
  });
}

export const loginLimiter = createLimiter('login', 60_000, 5);
export const registerLimiter = createLimiter('register', 60 * 60_000, 10);
