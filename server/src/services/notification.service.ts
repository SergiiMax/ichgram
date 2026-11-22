import { Notification } from '../models/Notification.js';
import type { Post } from '../models/Post.js';
import type { User } from '../models/User.js';
import { emitToUser } from '../socket/emitters.js';
import { toNotification } from '../utils/dto.js';
import { logger } from '../utils/logger.js';
import { toPage } from '../utils/pagination.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import { getFollowingIds, isFollowingUser } from './follow.service.js';

type NotificationType = 'like' | 'comment' | 'follow';

type NotificationData = {
  type: NotificationType;
  recipient: string;
  sender: string;
  post?: string;
  comment?: string;
};

export async function createNotification(data: NotificationData) {
  if (data.recipient === data.sender) return;

  try {
    const created = await Notification.create(data);

    const notification = await Notification.findById(created._id)
      .populate<{ sender: InstanceType<typeof User> }>('sender')
      .populate<{ post: InstanceType<typeof Post> | null }>('post');
    if (!notification) return;

    const isFollowing = await isFollowingUser(data.recipient, data.sender);
    emitToUser(
      data.recipient,
      'notification:new',
      toNotification(notification, notification.sender, notification.post, isFollowing),
    );
  } catch (err) {
    logger.error({ err }, 'Failed to create notification');
  }
}

export async function removeNotification(filter: Partial<NotificationData>) {
  try {
    await Notification.deleteOne(filter);
  } catch (err) {
    logger.error({ err }, 'Failed to remove notification');
  }
}

export async function getNotifications(userId: string, { cursor, limit }: PaginationQuery) {
  const filter = cursor ? { recipient: userId, _id: { $lt: cursor } } : { recipient: userId };

  const notifications = await Notification.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate<{ sender: InstanceType<typeof User> }>('sender')
    .populate<{ post: InstanceType<typeof Post> | null }>('post');

  const page = toPage(notifications, limit);
  const followingIds = await getFollowingIds(
    userId,
    page.items.map((n) => n.sender.id),
  );

  return {
    notifications: page.items.map((n) =>
      toNotification(n, n.sender, n.post, followingIds.has(n.sender.id)),
    ),
    nextCursor: page.nextCursor,
  };
}

export async function getUnreadCount(userId: string) {
  const count = await Notification.countDocuments({ recipient: userId, read: false });
  return { count };
}

export async function markAllRead(userId: string) {
  await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
}
