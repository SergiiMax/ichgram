import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toPublicUser } from '../utils/dto.js';
import { logger } from '../utils/logger.js';
import { deleteObject, uploadAvatar } from './storage.service.js';

export async function updateAvatar(userId: string, buffer: Buffer) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }

  const oldKey = user.avatarKey;

  user.avatarKey = await uploadAvatar(buffer, userId);
  await user.save();

  if (oldKey) {
    void deleteObject(oldKey).catch((err) => {
      logger.warn({ err, key: oldKey }, 'Failed to delete old avatar');
    });
  }
  return toPublicUser(user);
}
