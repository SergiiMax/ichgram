import type { RequestHandler } from 'express';
import * as followService from '../services/follow.service.js';
import { getUserId } from '../middlewares/auth.js';
import { paginationQuerySchema } from '../validators/common.schema.js';

export const followUser: RequestHandler<{ username: string }> = async (req, res) => {
  res.json(await followService.followUser(getUserId(req), req.params.username));
};

export const unfollowUser: RequestHandler<{ username: string }> = async (req, res) => {
  res.json(await followService.unfollowUser(getUserId(req), req.params.username));
};

export const getFollowers: RequestHandler<{ username: string }> = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  res.json(await followService.getFollowers(req.params.username, getUserId(req), query));
};

export const getFollowing: RequestHandler<{ username: string }> = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  res.json(await followService.getFollowing(req.params.username, getUserId(req), query));
};
