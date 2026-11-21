import type { AppServer } from './types.js';

let io: AppServer | null = null;

export function setIo(server: AppServer) {
  io = server;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown) {
  io?.to(`conversation:${conversationId}`).emit(event, data);
}
