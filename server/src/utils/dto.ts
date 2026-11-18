import lodash from 'lodash';
import { User } from '../models/User.js';
import { getPublicUrl } from '../services/storage.service.js';

export function toPublicUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    ...lodash.pick(user, ['email', 'username', 'fullName', 'bio', 'website', 'createdAt']),
    avatarUrl: user.avatarKey ? getPublicUrl(user.avatarKey) : null,
  };
}

export function toProfile(user: InstanceType<typeof User>, currentUserId: string) {
  return {
    id: user.id,
    ...lodash.pick(user, ['username', 'fullName', 'bio', 'website', 'createdAt']),
    avatarUrl: user.avatarKey ? getPublicUrl(user.avatarKey) : null,
    isMe: user.id === currentUserId,
  };
}
