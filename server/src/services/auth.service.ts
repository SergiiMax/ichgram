import bcrypt from 'bcryptjs';
import type { LoginInput, RegisterInput } from '../validators/auth.schema.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import {
  consumeRefreshToken,
  issueTokens,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  verifyRefreshToken,
} from './token.service.js';
import { toPublicUser } from '../utils/dto.js';

const DUMMY_HASH = await bcrypt.hash('dummy-password', 12);

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

export async function login(data: LoginInput) {
  const user = await User.findOne({
    $or: [{ email: data.login }, { username: data.login }],
  }).select('+passwordHash');

  const isMatch = await bcrypt.compare(data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !isMatch) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const tokens = await issueTokens(user.id);

  return { user: toPublicUser(user), ...tokens };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }
  return toPublicUser(user);
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AppError(401, 'UNAUTHORIZED', 'Refresh token missing');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid refresh token');
  }

  const isValid = await consumeRefreshToken(payload.userId, payload.jti);

  if (!isValid) {
    await revokeAllRefreshTokens(payload.userId);
    throw new AppError(401, 'SESSION_REVOKED', 'Session is no longer valid');
  }

  return issueTokens(payload.userId);
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;

  try {
    const { userId, jti } = verifyRefreshToken(refreshToken);
    await revokeRefreshToken(userId, jti);
  } catch {
    // токен испорчен или истёк - отзывать нечего, выход всё равно успешен
  }
}
