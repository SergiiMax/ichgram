import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { Follow } from '../models/Follow.js';
import { isDuplicateKeyError } from '../utils/mongo.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import { toPage } from '../utils/pagination.js';
import { toUserPreview } from '../utils/dto.js';
import { createNotification, removeNotification } from './notification.service.js';

async function findUserOrThrow(username: string) {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }
  return user;
}

export async function followUser(followerId: string, username: string) {
  const target = await findUserOrThrow(username);

  if (target.id === followerId) {
    throw new AppError(400, 'CANNOT_FOLLOW_SELF', 'You cannot follow yourself');
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Follow.create([{ follower: followerId, following: target._id }], { session });
      await User.updateOne({ _id: target._id }, { $inc: { followersCount: 1 } }, { session });
      await User.updateOne({ _id: followerId }, { $inc: { followingCount: 1 } }, { session });
    });
    await createNotification({ type: 'follow', recipient: target.id, sender: followerId });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
  } finally {
    await session.endSession();
  }

  const updated = await User.findById(target._id);
  return { isFollowing: true, followersCount: updated?.followersCount ?? 0 };
}

export async function unfollowUser(followerId: string, username: string) {
  const target = await findUserOrThrow(username);

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const { deletedCount } = await Follow.deleteOne(
        { follower: followerId, following: target._id },
        { session },
      );
      if (deletedCount === 0) return;
      await User.updateOne({ _id: target._id }, { $inc: { followersCount: -1 } }, { session });
      await User.updateOne({ _id: followerId }, { $inc: { followingCount: -1 } }, { session });
    });
  } finally {
    await session.endSession();
  }

  await removeNotification({ type: 'follow', sender: followerId, recipient: target.id });
  const updated = await User.findById(target._id);
  return { isFollowing: false, followersCount: updated?.followersCount ?? 0 };
}

export async function getFollowingIds(viewerId: string, userIds: string[]) {
  const follows = await Follow.find({ follower: viewerId, following: { $in: userIds } }).select(
    'following',
  );
  return new Set(follows.map((follow) => follow.following.toString()));
}

export async function getFollowers(
  username: string,
  viewerId: string,
  { cursor, limit }: PaginationQuery,
) {
  const user = await findUserOrThrow(username);

  const filter = cursor ? { following: user._id, _id: { $lt: cursor } } : { following: user._id };
  const follows = await Follow.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate<{ follower: InstanceType<typeof User> }>('follower');

  const page = toPage(follows, limit);
  const users = page.items.map((follow) => follow.follower);
  const followingIds = await getFollowingIds(
    viewerId,
    users.map((u) => u.id),
  );

  return {
    users: users.map((u) => ({ ...toUserPreview(u), isFollowing: followingIds.has(u.id) })),
    nextCursor: page.nextCursor,
  };
}

export async function getFollowing(
  username: string,
  viewerId: string,
  { cursor, limit }: PaginationQuery,
) {
  const user = await findUserOrThrow(username);

  const filter = cursor ? { follower: user._id, _id: { $lt: cursor } } : { follower: user._id };
  const follows = await Follow.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate<{ following: InstanceType<typeof User> }>('following');

  const page = toPage(follows, limit);
  const users = page.items.map((follow) => follow.following);
  const followingIds = await getFollowingIds(
    viewerId,
    users.map((u) => u.id),
  );

  return {
    users: users.map((u) => ({ ...toUserPreview(u), isFollowing: followingIds.has(u.id) })),
    nextCursor: page.nextCursor,
  };
}

export async function isFollowingUser(viewerId: string, targetId: string) {
  return Boolean(await Follow.exists({ follower: viewerId, following: targetId }));
}

export async function getFollowedUserIds(userId: string) {
  return Follow.find({ follower: userId }).distinct('following');
}
