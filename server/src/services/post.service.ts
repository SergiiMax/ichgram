import mongoose from 'mongoose';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toPost } from '../utils/dto.js';
import { logger } from '../utils/logger.js';
import type { CreatePostInput, ExploreQuery, UpdatePostInput } from '../validators/post.schema.js';
import { deletePostImage, uploadPostImage } from './storage.service.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import { toPage } from '../utils/pagination.js';

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

async function findPostOrThrow(postId: string) {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
  }
  const post = await Post.findById(postId).populate<{ author: InstanceType<typeof User> }>(
    'author',
  );
  if (!post) {
    throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
  }
  return post;
}

export async function getPost(postId: string) {
  const post = await findPostOrThrow(postId);
  return toPost(post, post.author);
}

function assertAuthor(post: { author: { id: string } }, userId: string) {
  if (post.author.id !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only modify your own posts');
  }
}

export async function deletePost(postId: string, userId: string) {
  const post = await findPostOrThrow(postId);
  assertAuthor(post, userId);

  await post.deleteOne();
  await User.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });

  void deletePostImage(post.image.key).catch((err) => {
    logger.warn({ err, key: post.image.key }, 'Failed to delete post image');
  });
}

export async function updatePost(
  postId: string,
  userId: string,
  data: UpdatePostInput,
  buffer?: Buffer,
) {
  if (data.caption === undefined && !buffer) {
    throw new AppError(400, 'NOTHING_TO_UPDATE', 'Provide a caption or an image');
  }

  const post = await findPostOrThrow(postId);
  assertAuthor(post, userId);

  const oldKey = post.image.key;
  if (buffer) {
    post.image = await uploadPostImage(buffer);
  }
  if (data.caption !== undefined) {
    post.caption = data.caption;
  }
  await post.save();

  if (buffer) {
    void deletePostImage(oldKey).catch((err) => {
      logger.warn({ err, key: oldKey }, 'Failed to delete old post image');
    });
  }
  return toPost(post, post.author);
}

export async function getUserPosts(username: string, { cursor, limit }: PaginationQuery) {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const filter = cursor ? { author: user.id, _id: { $lt: cursor } } : { author: user.id };
  const posts = await Post.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const page = toPage(posts, limit);
  return { posts: page.items.map((post) => toPost(post, user)), nextCursor: page.nextCursor };
}

export async function getFeed({ cursor, limit }: PaginationQuery) {
  const filter = cursor ? { _id: { $lt: cursor } } : {};

  const posts = await Post.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate<{ author: InstanceType<typeof User> }>('author');

  const page = toPage(posts, limit);
  return {
    posts: page.items.map((post) => toPost(post, post.author)),
    nextCursor: page.nextCursor,
  };
}

export async function getExplore({ limit, exclude }: ExploreQuery) {
  const excludeIds = exclude.map((id) => new mongoose.Types.ObjectId(id));

  const sampled = await Post.aggregate<{ _id: mongoose.Types.ObjectId }>([
    { $match: { _id: { $nin: excludeIds } } },
    { $sample: { size: limit } },
    { $project: { _id: 1 } },
  ]);
  const ids = sampled.map((doc) => doc._id);

  const posts = await Post.find({ _id: { $in: ids } }).populate<{
    author: InstanceType<typeof User>;
  }>('author');

  const byId = new Map(posts.map((post) => [post.id, post]));
  const ordered = ids.map((id) => byId.get(id.toString())).filter((post) => post !== undefined);

  return { posts: ordered.map((post) => toPost(post, post.author)) };
}
