import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { createServer } from 'node:http';
import { app } from './app.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

try {
  await connectDB();
} catch (err) {
  logger.fatal({ err }, 'Failed to connect to MongoDB');
  process.exit(1);
}

try {
  await connectRedis();
} catch (err) {
  logger.fatal({ err }, 'Failed to connect to Redis');
  process.exit(1);
}

const server = createServer(app);
server.on('error', (err) => {
  logger.fatal({ err }, 'server error');
  process.exit(1);
});
server.listen(env.PORT, () => {
  logger.info(`Server is running at http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);

  server.close(async () => {
    await disconnectDB();
    await disconnectRedis();
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 8000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
