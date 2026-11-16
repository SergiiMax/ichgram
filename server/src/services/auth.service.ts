import bcrypt from 'bcryptjs';
import type { RegisterInput } from '../validators/auth.schema.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { issueTokens } from './token.service.js';
import { toPublicUser } from '../utils/dto.js';

export async function register(data: RegisterInput) {
  if (await User.exists({ email: data.email })) {
    throw new AppError(409, 'EMAIL_TAKEN', 'Email is already taken');
  }
  if (await User.exists({ username: data.username })) {
    throw new AppError(409, 'USERNAME_TAKEN', 'Username is already taken');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    email: data.email,
    username: data.username,
    fullName: data.fullName,
    passwordHash,
  });

  const tokens = await issueTokens(user.id);

  return { user: toPublicUser(user), ...tokens };
}
