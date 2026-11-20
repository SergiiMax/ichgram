import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { deleteComment } from '../controllers/comments.controller.js';
import { likeComment, unlikeComment } from '../controllers/likes.controller.js';

export const commentRouter = Router();

commentRouter.delete('/:id', requireAuth, deleteComment);
commentRouter.post('/:id/like', requireAuth, likeComment);
commentRouter.delete('/:id/like', requireAuth, unlikeComment);
