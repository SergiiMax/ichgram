import type { AppServer } from './types.js';

let io: AppServer | null = null;

export function setIo(server: AppServer) {
  io = server;
}

export function userRoom(userId: string) {
  return `user:${userId}`;
}

export function conversationRoom(conversationId: string) {
  return `conversation:${conversationId}`;
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(userRoom(userId)).emit(event, data);
}

export function emitToConversation(conversationId: string, event: string, data: unknown) {
  io?.to(conversationRoom(conversationId)).emit(event, data);
}
