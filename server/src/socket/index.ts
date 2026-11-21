import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { socketAuth } from './auth.js';
import { logger } from '../utils/logger.js';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const userId: string = socket.data.userId;
    void socket.join(`user:${userId}`);
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    socket.on('disconnect', (reason) => {
      logger.info({ userId, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });
}

export function closeSockets() {
  io?.disconnectSockets(true);
}
