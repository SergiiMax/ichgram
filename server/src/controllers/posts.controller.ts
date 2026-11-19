import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import * as postService from '../services/post.service.js';
import { getUserId } from '../middlewares/auth.js';
import { paginationQuerySchema } from '../validators/common.schema.js';
import { exploreQuerySchema } from '../validators/post.schema.js';

export const createPost: RequestHandler = async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'Image file is required');
  }
  const post = await postService.createPost(getUserId(req), req.file.buffer, req.body);
  res.status(201).json({ post });
};

export const getPost: RequestHandler<{ id: string }> = async (req, res) => {
  const post = await postService.getPost(req.params.id);
  res.json({ post });
};

export const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  await postService.deletePost(req.params.id, getUserId(req));
  res.status(204).end();
};

export const updatePost: RequestHandler<{ id: string }> = async (req, res) => {
  const post = await postService.updatePost(
    req.params.id,
    getUserId(req),
    req.body,
    req.file?.buffer,
  );
  res.json({ post });
};

export const getUserPosts: RequestHandler<{ username: string }> = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  const result = await postService.getUserPosts(req.params.username, query);
  res.json(result);
};

export const getFeed: RequestHandler = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  const result = await postService.getFeed(query);
  res.json(result);
};

export const getExplore: RequestHandler = async (req, res) => {
  const query = exploreQuerySchema.parse(req.query);
  res.json(await postService.getExplore(query));
};
