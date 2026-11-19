import mongoose from 'mongoose';
import { Post } from '../models/Post.js';
import { AppError } from '../utils/AppError.js';
import { Like } from '../models/Like.js';

async function assertPostExists(postId: string) {
  if (!mongoose.isValidObjectId(postId) || !(await Post.exists({ _id: postId }))) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
  }
}

function isDuplicateKeyError(err: unknown) {
  return err instanceof mongoose.mongo.MongoServerError && err.code === 11000;
}

export async function likePost(postId: string, userId: string) {
  await assertPostExists(postId);

  try {
    await Like.create({ user: userId, post: postId });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
    const post = await Post.findById(postId);
    return { liked: true, likesCount: post?.likesCount ?? 0 };
  }

  const post = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likesCount: 1 } },
    { returnDocument: 'after' },
  );

  return { liked: true, likesCount: post?.likesCount ?? 0 };
}

export async function unlikePost(postId: string, userId: string) {
  await assertPostExists(postId);

  const { deletedCount } = await Like.deleteOne({ user: userId, post: postId });

  const post =
    deletedCount === 1
      ? await Post.findByIdAndUpdate(
          postId,
          { $inc: { likesCount: -1 } },
          { returnDocument: 'after' },
        )
      : await Post.findById(postId);

  return { liked: false, likesCount: post?.likesCount ?? 0 };
}
