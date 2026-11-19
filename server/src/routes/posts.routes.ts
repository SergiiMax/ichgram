import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { createPostSchema, updatePostSchema } from '../validators/post.schema.js';
import {
  createPost,
  deletePost,
  getFeed,
  getPost,
  updatePost,
} from '../controllers/posts.controller.js';

export const postsRouter = Router();

postsRouter.post(
  '/',
  requireAuth,
  imageUpload.single('image'),
  validate(createPostSchema),
  createPost,
);
postsRouter.get('/feed', requireAuth, getFeed);
postsRouter.get('/:id', requireAuth, getPost);
postsRouter.delete('/:id', requireAuth, deletePost);
postsRouter.patch(
  '/:id',
  requireAuth,
  imageUpload.single('image'),
  validate(updatePostSchema),
  updatePost,
);
