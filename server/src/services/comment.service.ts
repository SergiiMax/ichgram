import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toComment } from '../utils/dto.js';
import { toPage } from '../utils/pagination.js';
import type { CreateCommentInput } from '../validators/comment.schema.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import { assertPostExists } from './post.service.js';

export async function addComment(postId: string, authorId: string, data: CreateCommentInput) {
  await assertPostExists(postId);

  const comment = await Comment.create({ post: postId, author: authorId, text: data.text });
  await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

  const author = await User.findById(authorId);
  if (!author) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found');
  }

  return toComment(comment, author);
}

export async function getComments(postId: string, { cursor, limit }: PaginationQuery) {
  await assertPostExists(postId);

  const filter = cursor ? { post: postId, _id: { $gt: cursor } } : { post: postId };
  const comments = await Comment.find(filter)
    .sort({ _id: 1 })
    .limit(limit + 1)
    .populate<{ author: InstanceType<typeof User> }>('author');

  const page = toPage(comments, limit);
  return {
    comments: page.items.map((comment) => toComment(comment, comment.author)),
    nextCursor: page.nextCursor,
  };
}

export async function deleteComment(commentId: string, userId: string) {
  if (!mongoose.isValidObjectId(commentId)) {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
  }

  const post = await Post.findById(comment.post).select('author');
  const isCommentAuthor = comment.author.equals(userId);
  const isPostAuthor = post?.author.equals(userId) ?? false;

  if (!isCommentAuthor && !isPostAuthor) {
    throw new AppError(403, 'FORBIDDEN', 'You cannot delete this comment');
  }

  await comment.deleteOne();
  await Post.updateOne({ _id: comment.post }, { $inc: { commentsCount: -1 } });
}

export async function assertCommentExists(commentId: string) {
  if (!mongoose.isValidObjectId(commentId) || !(await Comment.exists({ _id: commentId }))) {
    throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
  }
}
