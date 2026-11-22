import { z, ZodError } from 'zod';
import type { AppSocket } from '../types.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../utils/logger.js';
import { objectIdSchema } from '../../validators/common.schema.js';
import { assertParticipant, sendMessage } from '../../services/conversation.service.js';
import { conversationRoom } from '../emitters.js';

const sendMessageSchema = z.object({
  conversationId: objectIdSchema,
  text: z.string().trim().min(1).max(1000),
  tempId: z.string().max(64).optional(),
});

type Ack = (
  response:
    { ok: true; [key: string]: unknown } | { ok: false; error: { code: string; message: string } },
) => void;

function toSocketError(err: unknown) {
  if (err instanceof AppError) return { code: err.code, message: err.message };
  if (err instanceof ZodError) return { code: 'VALIDATION_ERROR', message: 'Invalid data' };
  logger.error({ err }, 'Socket handler error');
  return { code: 'INTERNAL_ERROR', message: 'Internal server error' };
}

export function registerChatHandlers(socket: AppSocket) {
  const userId = socket.data.userId;

  socket.on('joinRoom', async (conversationId: unknown, ack?: Ack) => {
    try {
      const id = objectIdSchema.parse(conversationId);
      await assertParticipant(id, userId);
      await socket.join(conversationRoom(id));
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: toSocketError(err) });
    }
  });

  socket.on('leaveRoom', async (conversationId: unknown) => {
    if (typeof conversationId === 'string') {
      await socket.leave(conversationRoom(conversationId));
    }
  });

  socket.on('chat:send', async (payload: unknown, ack?: Ack) => {
    try {
      const { conversationId, text, tempId } = sendMessageSchema.parse(payload);
      const message = await sendMessage(conversationId, userId, text);
      ack?.({ ok: true, tempId, message });
    } catch (err) {
      ack?.({ ok: false, error: toSocketError(err) });
    }
  });
}
