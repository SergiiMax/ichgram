import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { paginationQuerySchema } from '../../validators/common.schema.js';
import { searchQuerySchema, updateProfileSchema } from '../../validators/user.schema.js';
import { errors, imageForm, jsonBody, usernameParam } from '../helpers.js';

export const userPaths: ZodOpenApiPathsObject = {
  '/users/me': {
    patch: {
      tags: ['Users'],
      summary: 'Update my profile',
      requestBody: jsonBody(updateProfileSchema),
      responses: { '200': { description: 'Updated profile' }, ...errors(400, 401, 409) },
    },
  },
  '/users/me/avatar': {
    patch: {
      tags: ['Users'],
      summary: 'Upload a new avatar (jpeg/png/webp, up to 5 MB)',
      requestBody: imageForm('avatar'),
      responses: { '200': { description: 'Updated user' }, ...errors(400, 401, 413) },
    },
  },
  '/users/search': {
    get: {
      tags: ['Users'],
      summary: 'Search users by username or full name',
      requestParams: { query: searchQuerySchema },
      responses: { '200': { description: 'Found users' }, ...errors(400, 401) },
    },
  },
  '/users/{username}': {
    get: {
      tags: ['Users'],
      summary: 'User profile',
      requestParams: { path: usernameParam },
      responses: { '200': { description: 'Profile' }, ...errors(401, 404) },
    },
  },
  '/users/{username}/posts': {
    get: {
      tags: ['Users'],
      summary: 'Posts of a user (cursor pagination)',
      requestParams: { path: usernameParam, query: paginationQuerySchema },
      responses: { '200': { description: 'Posts page' }, ...errors(400, 401, 404) },
    },
  },
  '/users/{username}/follow': {
    post: {
      tags: ['Follows'],
      summary: 'Follow a user',
      requestParams: { path: usernameParam },
      responses: { '200': { description: 'Following' }, ...errors(400, 401, 404) },
    },
    delete: {
      tags: ['Follows'],
      summary: 'Unfollow a user',
      requestParams: { path: usernameParam },
      responses: { '200': { description: 'Not following' }, ...errors(401, 404) },
    },
  },
  '/users/{username}/followers': {
    get: {
      tags: ['Follows'],
      summary: 'Followers of a user',
      requestParams: { path: usernameParam, query: paginationQuerySchema },
      responses: { '200': { description: 'Followers page' }, ...errors(400, 401, 404) },
    },
  },
  '/users/{username}/following': {
    get: {
      tags: ['Follows'],
      summary: 'Users that a user follows',
      requestParams: { path: usernameParam, query: paginationQuerySchema },
      responses: { '200': { description: 'Following page' }, ...errors(400, 401, 404) },
    },
  },
};
