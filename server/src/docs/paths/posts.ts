import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { createCommentSchema } from '../../validators/comment.schema.js';
import { paginationQuerySchema } from '../../validators/common.schema.js';
import {
  createPostSchema,
  exploreQuerySchema,
  updatePostSchema,
} from '../../validators/post.schema.js';
import { errors, idParam, imageForm, jsonBody } from '../helpers.js';

export const postPaths: ZodOpenApiPathsObject = {
  '/posts': {
    post: {
      tags: ['Posts'],
      summary: 'Create a post with an image',
      requestBody: imageForm('image', createPostSchema),
      responses: { '201': { description: 'Created post' }, ...errors(400, 401, 413) },
    },
  },
  '/posts/feed': {
    get: {
      tags: ['Posts'],
      summary: 'Feed: posts of followed users and my own',
      requestParams: { query: paginationQuerySchema },
      responses: { '200': { description: 'Posts page' }, ...errors(400, 401) },
    },
  },
  '/posts/explore': {
    get: {
      tags: ['Posts'],
      summary: 'Random posts (exclude = comma-separated ids already shown)',
      requestParams: { query: exploreQuerySchema },
      responses: { '200': { description: 'Random posts' }, ...errors(400, 401) },
    },
  },
  '/posts/{id}': {
    get: {
      tags: ['Posts'],
      summary: 'Single post',
      requestParams: { path: idParam },
      responses: { '200': { description: 'Post' }, ...errors(401, 404) },
    },
    patch: {
      tags: ['Posts'],
      summary: 'Edit caption and/or replace the image (author only)',
      requestParams: { path: idParam },
      requestBody: imageForm('image', updatePostSchema),
      responses: { '200': { description: 'Updated post' }, ...errors(400, 401, 403, 404, 413) },
    },
    delete: {
      tags: ['Posts'],
      summary: 'Delete a post (author only)',
      requestParams: { path: idParam },
      responses: { '204': { description: 'Deleted' }, ...errors(401, 403, 404) },
    },
  },
  '/posts/{id}/like': {
    post: {
      tags: ['Likes'],
      summary: 'Like a post',
      requestParams: { path: idParam },
      responses: { '200': { description: 'Liked' }, ...errors(401, 404) },
    },
    delete: {
      tags: ['Likes'],
      summary: 'Unlike a post',
      requestParams: { path: idParam },
      responses: { '200': { description: 'Not liked' }, ...errors(401, 404) },
    },
  },
  '/posts/{id}/comments': {
    get: {
      tags: ['Comments'],
      summary: 'Comments of a post (cursor pagination)',
      requestParams: { path: idParam, query: paginationQuerySchema },
      responses: { '200': { description: 'Comments page' }, ...errors(400, 401, 404) },
    },
    post: {
      tags: ['Comments'],
      summary: 'Add a comment',
      requestParams: { path: idParam },
      requestBody: jsonBody(createCommentSchema),
      responses: { '201': { description: 'Created comment' }, ...errors(400, 401, 404) },
    },
  },
};
