import { Router } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis.js';
import { authRouter } from './auth.routes.js';
import { userRouter } from './users.routes.js';
import { postsRouter } from './posts.routes.js';
import { commentRouter } from './comments.routes.js';
import { notificationRouter } from './notifications.routes.js';
import { conversationRouter } from './conversations.routes.js';

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

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/comments', commentRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/conversations', conversationRouter);
