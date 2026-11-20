import type { RequestHandler } from 'express';
import * as commentService from '../services/comment.service.js';
import { getUserId } from '../middlewares/auth.js';
import { paginationQuerySchema } from '../validators/common.schema.js';

export const addComment: RequestHandler<{ id: string }> = async (req, res) => {
  const comment = await commentService.addComment(req.params.id, getUserId(req), req.body);
  res.status(201).json({ comment });
};

export const getComments: RequestHandler<{ id: string }> = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  res.json(await commentService.getComments(req.params.id, getUserId(req), query));
};
export const deleteComment: RequestHandler<{ id: string }> = async (req, res) => {
  await commentService.deleteComment(req.params.id, getUserId(req));
  res.status(204).end();
};
