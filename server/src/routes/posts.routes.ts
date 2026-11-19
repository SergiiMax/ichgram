import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { createPostSchema, updatePostSchema } from '../validators/post.schema.js';
import {
  createPost,
  deletePost,
  getExplore,
  getFeed,
  getPost,
  updatePost,
} from '../controllers/posts.controller.js';
import { likePost, unlikePost } from '../controllers/likes.controller.js';

export const postsRouter = Router();

postsRouter.post(
  '/',
  requireAuth,
  imageUpload.single('image'),
  validate(createPostSchema),
  createPost,
);
postsRouter.get('/feed', requireAuth, getFeed);
postsRouter.get('/explore', requireAuth, getExplore);
postsRouter.get('/:id', requireAuth, getPost);
postsRouter.delete('/:id', requireAuth, deletePost);
postsRouter.patch(
  '/:id',
  requireAuth,
  imageUpload.single('image'),
  validate(updatePostSchema),
  updatePost,
);
postsRouter.post('/:id/like', requireAuth, likePost);
postsRouter.delete('/:id/like', requireAuth, unlikePost);
