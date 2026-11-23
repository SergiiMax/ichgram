import type { ZodOpenApiPathsObject } from 'zod-openapi';

export const healthPaths: ZodOpenApiPathsObject = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Server, MongoDB and Redis status',
      security: [],
      responses: { '200': { description: 'All OK' }, '503': { description: 'Something is down' } },
    },
  },
};
