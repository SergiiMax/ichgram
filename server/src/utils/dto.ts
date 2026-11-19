import lodash from 'lodash';
import { User } from '../models/User.js';
import { getPostImageUrls, getPublicUrl } from '../services/storage.service.js';
import type { Post } from '../models/Post.js';

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

export function toProfile(user: InstanceType<typeof User>, currentUserId: string) {
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
