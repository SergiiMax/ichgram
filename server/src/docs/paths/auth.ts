import type { ZodOpenApiPathsObject } from 'zod-openapi';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../../validators/auth.schema.js';
import { errors, jsonBody } from '../helpers.js';

export const authPaths: ZodOpenApiPathsObject = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user and log in (sets cookies)',
      security: [],
      requestBody: jsonBody(registerSchema),
      responses: { '201': { description: 'Registered' }, ...errors(400, 409, 429) },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Log in by email or username (sets cookies)',
      security: [],
      requestBody: jsonBody(loginSchema),
      responses: { '200': { description: 'Logged in' }, ...errors(400, 401, 429) },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Current user',
      responses: { '200': { description: 'Current user' }, ...errors(401) },
    },
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Rotate tokens using the refresh cookie',
      security: [],
      responses: { '204': { description: 'New cookies set' }, ...errors(401) },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Log out (clears cookies)',
      security: [],
      responses: { '204': { description: 'Logged out' } },
    },
  },
  '/auth/forgot-password': {
    post: {
      tags: ['Auth'],
      summary: 'Send a password reset email',
      security: [],
      requestBody: jsonBody(forgotPasswordSchema),
      responses: { '200': { description: 'Email sent if the user exists' }, ...errors(400, 429) },
    },
  },
  '/auth/reset-password': {
    post: {
      tags: ['Auth'],
      summary: 'Set a new password with the token from the email',
      security: [],
      requestBody: jsonBody(resetPasswordSchema),
      responses: { '200': { description: 'Password changed' }, ...errors(400) },
    },
  },
};
