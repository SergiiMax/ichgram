import { createDocument } from 'zod-openapi';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { authPaths } from './paths/auth.js';

export const openApiDocument = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'ICHgram API',
    version: '1.0.0',
    description: 'REST API of ICHgram. Log in via POST /auth/login — the browser keeps the cookie.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: ACCESS_COOKIE },
    },
  },
  security: [{ cookieAuth: [] }],
  paths: {
    ...authPaths,
  },
});
