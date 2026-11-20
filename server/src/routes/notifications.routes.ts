import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
} from '../controllers/notifications.controller.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', getNotifications);
notificationRouter.get('/unread-count', getUnreadCount);
notificationRouter.patch('/read', markAllRead);
