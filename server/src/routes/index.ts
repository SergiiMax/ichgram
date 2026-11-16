import { Router } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  const mongo = mongoose.STATES[mongoose.connection.readyState];
  const redisStatus = redis.status;
  const isHealthy = mongo === 'connected' && redisStatus === 'ready';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    mongo,
    redis: redisStatus,
  });
});
