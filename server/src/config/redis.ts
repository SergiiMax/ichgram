import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});
redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting');
});

export async function connectRedis() {
  if (redis.status === 'wait') await redis.connect();
  await redis.ping();
  logger.info('Redis connected');
}

export async function disconnectRedis() {
  await redis.quit();
  logger.info('Redis disconnected');
}
