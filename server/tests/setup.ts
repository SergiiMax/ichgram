import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = replSet.getUri('ichgram_test');
process.env.REDIS_URL = 'redis://localhost:6379/1';

vi.mock('../src/services/storage.service.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../src/services/storage.service.js')>()),
  uploadPostImage: vi.fn(async () => ({
    key: 'posts/test',
    width: 1080,
    height: 1080,
    dominantColor: '#000000',
  })),
  deletePostImage: vi.fn(async () => {}),
  uploadAvatar: vi.fn(async () => 'avatars/test.webp'),
  deleteObject: vi.fn(async () => {}),
}));

const { connectDB, disconnectDB } = await import('../src/config/db.js');
const { connectRedis, disconnectRedis, redis } = await import('../src/config/redis.js');

beforeAll(async () => {
  await connectDB();
  await connectRedis();
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
});

beforeEach(async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})),
  );
  await redis.flushdb();
});

afterAll(async () => {
  await disconnectDB();
  await disconnectRedis();
  await replSet.stop();
});
