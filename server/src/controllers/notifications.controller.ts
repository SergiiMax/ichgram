import type { RequestHandler } from 'express';
import { paginationQuerySchema } from '../validators/common.schema.js';
import * as notificationService from '../services/notification.service.js';
import { getUserId } from '../middlewares/auth.js';

export const getNotifications: RequestHandler = async (req, res) => {
  const query = paginationQuerySchema.parse(req.query);
  res.json(await notificationService.getNotifications(getUserId(req), query));
};

export const getUnreadCount: RequestHandler = async (req, res) => {
  res.json(await notificationService.getUnreadCount(getUserId(req)));
};

export const markAllRead: RequestHandler = async (req, res) => {
  await notificationService.markAllRead(getUserId(req));
  res.status(204).end();
};
