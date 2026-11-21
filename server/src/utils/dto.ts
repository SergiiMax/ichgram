import lodash from 'lodash';
import { User } from '../models/User.js';
import { getPostImageUrls, getPublicUrl } from '../services/storage.service.js';
import type { Post } from '../models/Post.js';
import type { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import type { Conversation } from '../models/Conversation.js';
import type { Message } from '../models/Message.js';

export function toPublicUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    ...lodash.pick(user, [
      'email',
      'username',
      'fullName',
      'bio',
      'website',
      'postsCount',
      'followersCount',
      'followingCount',
      'createdAt',
    ]),
    avatarUrl: user.avatarKey ? getPublicUrl(user.avatarKey) : null,
  };
}

export function toProfile(
  user: InstanceType<typeof User>,
  currentUserId: string,
  isFollowing = false,
) {
  return {
    id: user.id,
    ...lodash.pick(user, [
      'username',
      'fullName',
      'bio',
      'website',
      'postsCount',
      'followersCount',
      'followingCount',
      'createdAt',
    ]),
    avatarUrl: user.avatarKey ? getPublicUrl(user.avatarKey) : null,
    isMe: user.id === currentUserId,
    isFollowing,
  };
}

export function toUserPreview(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: user.avatarKey ? getPublicUrl(user.avatarKey) : null,
  };
}

type PostFields = Pick<
  InstanceType<typeof Post>,
  'id' | 'caption' | 'image' | 'likesCount' | 'commentsCount' | 'createdAt'
>;

export function toPost(post: PostFields, author: InstanceType<typeof User>, isLiked = false) {
  return {
    id: post.id,
    caption: post.caption,
    image: {
      ...getPostImageUrls(post.image.key),
      width: post.image.width,
      height: post.image.height,
      dominantColor: post.image.dominantColor,
    },
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
    author: toUserPreview(author),
    isLiked,
  };
}

export function toComment(
  comment: Pick<InstanceType<typeof Comment>, 'id' | 'text' | 'likesCount' | 'createdAt'>,
  author: InstanceType<typeof User>,
  isLiked = false,
) {
  return {
    id: comment.id,
    text: comment.text,
    likesCount: comment.likesCount,
    createdAt: comment.createdAt,
    author: toUserPreview(author),
    isLiked,
  };
}

type NotificationFields = Pick<
  InstanceType<typeof Notification>,
  'id' | 'type' | 'read' | 'comment' | 'createdAt'
>;

export function toNotification(
  notification: NotificationFields,
  sender: InstanceType<typeof User>,
  post: InstanceType<typeof Post> | null,
  isFollowing = false,
) {
  return {
    id: notification.id,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt,
    sender: { ...toUserPreview(sender), isFollowing },
    post: post ? { id: post.id, imageUrl: getPostImageUrls(post.image.key).small } : null,
    commentId: notification.comment?.toString() ?? null,
  };
}

type ConversationFields = Pick<
  InstanceType<typeof Conversation>,
  'id' | 'lastMessage' | 'updatedAt'
>;

export function toConversation(
  conversation: ConversationFields,
  otherUser: InstanceType<typeof User>,
) {
  const { lastMessage } = conversation;
  return {
    id: conversation.id,
    user: toUserPreview(otherUser),
    lastMessage: lastMessage
      ? {
          text: lastMessage.text,
          senderId: lastMessage.sender.toString(),
          createdAt: lastMessage.createdAt,
        }
      : null,
    updatedAt: conversation.updatedAt,
  };
}

type MessageFields = Pick<
  InstanceType<typeof Message>,
  'id' | 'conversation' | 'sender' | 'recipient' | 'text' | 'createdAt'
>;

export function toMessage(message: MessageFields) {
  return {
    id: message.id,
    conversationId: message.conversation.toString(),
    senderId: message.sender.toString(),
    recipientId: message.recipient.toString(),
    text: message.text,
    createdAt: message.createdAt,
  };
}
