import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toPost } from '../utils/dto.js';
import { logger } from '../utils/logger.js';
import type { CreatePostInput } from '../validators/post.schema.js';
import { deletePostImage, uploadPostImage } from './storage.service.js';

export async function createPost(authorId: string, buffer: Buffer, data: CreatePostInput) {
  const image = await uploadPostImage(buffer);

  let post;
  try {
    post = await Post.create({ author: authorId, caption: data.caption, image });
  } catch (err) {
    void deletePostImage(image.key).catch((cleanupErr) => {
      logger.warn({ err: cleanupErr, key: image.key }, 'Failed to clean up post image');
    });
    throw err;
  }

  const author = await User.findByIdAndUpdate(
    authorId,
    { $inc: { postsCount: 1 } },
    { returnDocument: 'after' },
  );

  if (!author) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }

  return toPost(post, author);
}
