import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toProfile, toPublicUser, toUserPreview } from '../utils/dto.js';
import { logger } from '../utils/logger.js';
import type { UpdateProfileInput } from '../validators/user.schema.js';
import { isFollowingUser } from './follow.service.js';
import { deleteObject, uploadAvatar } from './storage.service.js';
import lodash from 'lodash';

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

export async function getProfile(username: string, currentUserId: string) {
  const user = await User.findOne({ username: username.toLowerCase() });

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const isMe = user.id === currentUserId;
  const isFollowing = isMe ? false : await isFollowingUser(currentUserId, user.id);

  return toProfile(user, currentUserId, isFollowing);
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  if (data.username) {
    const taken = await User.exists({ username: data.username, _id: { $ne: userId } });
    if (taken) {
      throw new AppError(409, 'USERNAME_TAKEN', 'Username is already taken');
    }
  }

  const user = await User.findByIdAndUpdate(userId, data, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }

  return toPublicUser(user);
}

export async function searchUsers(query: string, currentUserId: string) {
  const prefix = lodash.escapeRegExp(query);

  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { username: { $regex: `^${prefix.toLowerCase()}` } },
      { fullName: { $regex: `^${prefix}`, $options: 'i' } },
    ],
  }).limit(20);

  return users.map(toUserPreview);
}
