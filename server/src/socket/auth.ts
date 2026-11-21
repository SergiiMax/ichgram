import { parseCookie } from 'cookie';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { verifyAccessToken } from '../services/token.service.js';
import type { AppSocket } from './types.js';

export function socketAuth(socket: AppSocket, next: (err?: Error) => void) {
  const cookies = parseCookie(socket.handshake.headers.cookie ?? '');
  const token = cookies[ACCESS_COOKIE];

  if (!token) {
    next(new Error('UNAUTHORIZED'));
    return;
  }

  try {
    socket.data.userId = verifyAccessToken(token);
    next();
  } catch {
    next(new Error('UNAUTHORIZED'));
  }
}
