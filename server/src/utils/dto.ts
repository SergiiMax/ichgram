import lodash from 'lodash';
import { User } from '../models/User.js';

export function toPublicUser(user: InstanceType<typeof User>) {
  return {
    id: user.id,
    ...lodash.pick(user, [
      'email',
      'username',
      'fullName',
      'bio',
      'website',
      'avatar',
      'createdAt',
    ]),
  };
}
