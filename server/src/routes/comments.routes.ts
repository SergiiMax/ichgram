import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { deleteComment } from '../controllers/comments.controller.js';

export const commentRouter = Router();

commentRouter.delete('/:id', requireAuth, deleteComment);
