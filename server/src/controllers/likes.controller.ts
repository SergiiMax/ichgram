import type { RequestHandler } from 'express';
import * as likeService from '../services/like.service.js';
import { getUserId } from '../middlewares/auth.js';

export const likePost: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await likeService.likePost(req.params.id, getUserId(req)));
};

export const unlikePost: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await likeService.unlikePost(req.params.id, getUserId(req)));
};

export const likeComment: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await likeService.likeComment(req.params.id, getUserId(req)));
};

export const unlikeComment: RequestHandler<{ id: string }> = async (req, res) => {
  res.json(await likeService.unlikeComment(req.params.id, getUserId(req)));
};
