import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { imageUpload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { createPostSchema } from '../validators/post.schema.js';
import { createPost, getPost } from '../controllers/posts.controller.js';

export const postsRouter = Router();

postsRouter.post(
  '/',
  requireAuth,
  imageUpload.single('image'),
  validate(createPostSchema),
  createPost,
);
postsRouter.get('/:id', requireAuth, getPost);
