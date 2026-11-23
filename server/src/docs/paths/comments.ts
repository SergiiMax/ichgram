import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { errors, idParam } from '../helpers.js';

export const commentPaths: ZodOpenApiPathsObject = {
  '/comments/{id}': {
    delete: {
      tags: ['Comments'],
      summary: 'Delete a comment (its author or the post author)',
      requestParams: { path: idParam },
      responses: { '204': { description: 'Deleted' }, ...errors(401, 403, 404) },
    },
  },
  '/comments/{id}/like': {
    post: {
      tags: ['Likes'],
      summary: 'Like a comment',
      requestParams: { path: idParam },
      responses: { '200': { description: 'Liked' }, ...errors(401, 404) },
    },
    delete: {
      tags: ['Likes'],
      summary: 'Unlike a comment',
      requestParams: { path: idParam },
      responses: { '200': { description: 'Not liked' }, ...errors(401, 404) },
    },
  },
};
