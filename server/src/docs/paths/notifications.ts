import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { paginationQuerySchema } from '../../validators/common.schema.js';
import { errors } from '../helpers.js';

export const notificationPaths: ZodOpenApiPathsObject = {
  '/notifications': {
    get: {
      tags: ['Notifications'],
      summary: 'My notifications (likes, comments, follows)',
      requestParams: { query: paginationQuerySchema },
      responses: { '200': { description: 'Notifications page' }, ...errors(400, 401) },
    },
  },
  '/notifications/unread-count': {
    get: {
      tags: ['Notifications'],
      summary: 'Number of unread notifications',
      responses: { '200': { description: '{ count }' }, ...errors(401) },
    },
  },
  '/notifications/read': {
    patch: {
      tags: ['Notifications'],
      summary: 'Mark all my notifications as read',
      responses: { '204': { description: 'Marked as read' }, ...errors(401) },
    },
  },
};
