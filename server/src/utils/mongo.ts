import mongoose from 'mongoose';

export function isDuplicateKeyError(err: unknown) {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}
