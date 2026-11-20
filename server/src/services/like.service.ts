import mongoose from 'mongoose';
import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';
import { assertPostExists } from './post.service.js';
import { assertCommentExists } from './comment.service.js';
import { CommentLike } from '../models/CommentLike.js';
import { Comment } from '../models/Comment.js';

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

export async function getLikedPostIds(userId: string, postIds: string[]) {
  const likes = await Like.find({ user: userId, post: { $in: postIds } }).select('post');
  return new Set(likes.map((like) => like.post.toString()));
}

export async function isPostLikedBy(userId: string, postId: string) {
  return Boolean(await Like.exists({ user: userId, post: postId }));
}
export async function likeComment(commentId: string, userId: string) {
  await assertCommentExists(commentId);

  try {
    await CommentLike.create({ user: userId, comment: commentId });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
    const comment = await Comment.findById(commentId);
    return { liked: true, likesCount: comment?.likesCount ?? 0 };
  }
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likesCount: 1 } },
    { returnDocument: 'after' },
  );
  return { liked: true, likesCount: comment?.likesCount ?? 0 };
}

export async function unlikeComment(commentId: string, userId: string) {
  await assertCommentExists(commentId);

  const { deletedCount } = await CommentLike.deleteOne({ user: userId, comment: commentId });

  const comment =
    deletedCount === 1
      ? await Comment.findByIdAndUpdate(
          commentId,
          { $inc: { likesCount: -1 } },
          { returnDocument: 'after' },
        )
      : await Comment.findById(commentId);

  return { liked: false, likesCount: comment?.likesCount ?? 0 };
}
