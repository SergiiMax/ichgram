import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { paginationQuerySchema } from '../../validators/common.schema.js';
import { createConversationSchema } from '../../validators/conversation.schema.js';
import { errors, idParam, jsonBody } from '../helpers.js';

export const conversationPaths: ZodOpenApiPathsObject = {
  '/conversations': {
    get: {
      tags: ['Conversations'],
      summary: 'My conversations (latest 50, most recent first)',
      responses: { '200': { description: 'Conversations' }, ...errors(401) },
    },
    post: {
      tags: ['Conversations'],
      summary: 'Get or create a conversation with a user',
      requestBody: jsonBody(createConversationSchema),
      responses: { '200': { description: 'Conversation' }, ...errors(400, 401, 404) },
    },
  },
  '/conversations/{id}/messages': {
    get: {
      tags: ['Conversations'],
      summary: 'Message history (cursor pagination, newest first)',
      requestParams: { path: idParam, query: paginationQuerySchema },
      responses: { '200': { description: 'Messages page' }, ...errors(400, 401, 404) },
    },
  },
};
