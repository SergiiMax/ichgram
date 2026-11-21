import type { RequestHandler } from 'express';
import * as conversationService from '../services/conversation.service.js';
import { getUserId } from '../middlewares/auth.js';
import { paginationQuerySchema } from '../validators/common.schema.js';

export const createConversation: RequestHandler = async (req, res) => {
  const conversation = await conversationService.getOrCreateConversation(
    getUserId(req),
    req.body.userId,
  );
  res.json({ conversation });
};

export const getConversations: RequestHandler = async (req, res) => {
  const conversations = await conversationService.getConversations(getUserId(req));
  res.json({ conversations });
};

export const getMessages: RequestHandler<{ id: string }> = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  res.json(await conversationService.getMessages(req.params.id, getUserId(req), query));
};
