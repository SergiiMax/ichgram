import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  createConversation,
  getConversations,
  getMessages,
} from '../controllers/conversations.controller.js';
import { createConversationSchema } from '../validators/conversation.schema.js';
import { validate } from '../middlewares/validate.js';

export const conversationRouter = Router();

conversationRouter.use(requireAuth);
conversationRouter.get('/', getConversations);
conversationRouter.post('/', validate(createConversationSchema), createConversation);
conversationRouter.get('/:id/messages', getMessages);
