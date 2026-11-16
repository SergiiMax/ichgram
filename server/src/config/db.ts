import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

let isClosing = false;

mongoose.connection.on('disconnected', () => {
  if (!isClosing) {
    logger.warn('MongoDB disconnected');
  }
});
mongoose.connection.on('error', (err) => {
  logger.error({ err }, 'MongoDB connection error');
});

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  logger.info(`MongoDB database ${mongoose.connection.name} successfully connected`);
}

export async function disconnectDB(): Promise<void> {
  isClosing = true;
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
