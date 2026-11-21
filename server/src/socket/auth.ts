import { parseCookie } from 'cookie';
import type { Socket } from 'socket.io';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { verifyAccessToken } from '../services/token.service.js';

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
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
