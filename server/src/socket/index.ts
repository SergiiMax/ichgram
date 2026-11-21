import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketAuth } from './auth.js';
import { logger } from '../utils/logger.js';
import type { AppServer } from './types.js';
import { setIo } from './emitters.js';
import { registerChatHandlers } from './handlers/chat.js';

let io: AppServer | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });
  setIo(io);

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    void socket.join(`user:${userId}`);
    logger.info({ userId, socketId: socket.id }, 'Socket connected');
    registerChatHandlers(socket);

    socket.on('disconnect', (reason) => {
      logger.info({ userId, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });
}

export function closeSockets() {
  io?.disconnectSockets(true);
}
