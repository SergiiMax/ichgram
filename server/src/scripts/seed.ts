import { randomBytes } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Comment } from '../models/Comment.js';
import { CommentLike } from '../models/CommentLike.js';
import { Conversation } from '../models/Conversation.js';
import { Follow } from '../models/Follow.js';
import { Like } from '../models/Like.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { makeConversationKey } from '../services/conversation.service.js';
import {
  deleteObject,
  deletePostImage,
  uploadAvatar,
  uploadPostImage,
} from '../services/storage.service.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const IMAGES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-images');
const PASSWORD = 'Password123';
const DAY = 24 * 60 * 60 * 1000;

const USERS = [
  { username: 'demo', fullName: 'Demo User', bio: 'Main demo account of ICHgram 👋' },
  { username: 'anna.travel', fullName: 'Anna Schmidt', bio: 'Travel & mountains 🏔️' },
  { username: 'max_foodie', fullName: 'Max Becker', bio: 'Cooking every day 🍝' },
  { username: 'lena.art', fullName: 'Lena Wagner', bio: 'Illustrator. Coffee addict ☕' },
  { username: 'oleg.dev', fullName: 'Oleg Ivanov', bio: 'Fullstack developer 💻' },
  { username: 'sofia_photo', fullName: 'Sofia Rossi', bio: 'Street photography 📷' },
  { username: 'tom.runner', fullName: 'Tom Fischer', bio: 'Marathon runner 🏃' },
  { username: 'kate.cats', fullName: 'Kate Miller', bio: 'Two cats and a lot of memes 🐱' },
  { username: 'paul_music', fullName: 'Paul Weber', bio: 'Guitar, vinyl, concerts 🎸' },
  { username: 'mila.design', fullName: 'Mila Novak', bio: 'UI/UX designer ✏️' },
  { username: 'jan.nature', fullName: 'Jan Kowalski', bio: 'Forests, lakes, silence 🌲' },
  { username: 'nina_books', fullName: 'Nina Petrova', bio: 'Reading 50 books a year 📚' },
  { username: 'alex.fit', fullName: 'Alex Braun', bio: 'Gym & healthy food 💪' },
];

const postSeedsSchema = z.array(
  z.object({
    file: z.string().min(1),
    user: z.string().min(1),
    caption: z.string().max(2200),
  }),
);

type PostSeed = z.infer<typeof postSeedsSchema>[number];

const COMMENTS = [
  'Wow 😍',
  'Amazing shot!',
  'Haha, so true 😂',
  'Where is this?',
  'Love it ❤️',
  'Beautiful!',
  'Same here',
  'Great vibes',
  'I need this right now',
  '🔥🔥🔥',
];

const MESSAGES = [
  'Hi! How are you?',
  'Hey! All good, thanks 😊 And you?',
  'Great! Saw your new post, looks amazing',
  'Thank you! It was a nice trip',
  'Let’s meet this weekend?',
  'Sure, Saturday works for me',
  'Perfect, see you then 👋',
  'See you!',
];

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)] as T;
}

function sample<T>(items: T[], count: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function objectIdAt(date: Date) {
  const seconds = Math.floor(date.getTime() / 1000)
    .toString(16)
    .padStart(8, '0');
  return new mongoose.Types.ObjectId(seconds + randomBytes(8).toString('hex'));
}

async function readImages(folder: string) {
  const dir = path.join(IMAGES_DIR, folder);
  const files = (await readdir(dir)).filter((file) => /\.(jpe?g|png|webp)$/i.test(file)).sort();
  return Promise.all(files.map((file) => readFile(path.join(dir, file))));
}

async function readPostSeeds() {
  const json = await readFile(path.join(IMAGES_DIR, 'posts', 'posts.json'), 'utf8');
  return postSeedsSchema.parse(JSON.parse(json));
}

async function clearDatabase() {
  const [posts, users] = await Promise.all([
    Post.find().select('image'),
    User.find({ avatarKey: { $ne: null } }).select('avatarKey'),
  ]);
  await Promise.all([
    ...posts.map((post) => deletePostImage(post.image.key)),
    ...users.flatMap((user) => (user.avatarKey ? [deleteObject(user.avatarKey)] : [])),
  ]);

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Like.deleteMany({}),
    Comment.deleteMany({}),
    CommentLike.deleteMany({}),
    Follow.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
  ]);
  logger.info(`Cleared database (${posts.length} posts, ${users.length} avatars removed from S3)`);
}

async function createUsers(avatars: Buffer[]) {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const users = [];

  for (const [index, data] of USERS.entries()) {
    const user = await User.create({
      ...data,
      email: `${data.username}@ichgram.demo`,
      passwordHash,
      createdAt: new Date(Date.now() - 60 * DAY),
    });
    const avatar = avatars[index % avatars.length];
    if (avatar) {
      user.avatarKey = await uploadAvatar(avatar, user.id);
      await user.save();
    }
    users.push(user);
  }

  logger.info(`Created ${users.length} users`);
  return users;
}

async function createPosts(users: InstanceType<typeof User>[], seeds: PostSeed[]) {
  const usersByName = new Map(users.map((user) => [user.username, user]));
  const ordered = sample(seeds, seeds.length);
  const dates = ordered
    .map(() => new Date(Date.now() - randomInt(0, 30) * DAY - randomInt(0, DAY)))
    .sort((a, b) => a.getTime() - b.getTime());
  const posts = [];

  for (const [index, seed] of ordered.entries()) {
    const author = usersByName.get(seed.user);
    const date = dates[index];
    if (!author || !date) {
      logger.warn(`Skipped ${seed.file}: unknown user "${seed.user}"`);
      continue;
    }

    const buffer = await readFile(path.join(IMAGES_DIR, 'posts', seed.file));
    const image = await uploadPostImage(buffer);
    posts.push(
      await Post.create({
        _id: objectIdAt(date),
        author: author._id,
        caption: seed.caption,
        image,
        createdAt: date,
      }),
    );
    logger.info(`Post ${index + 1}/${ordered.length} uploaded`);
  }

  return posts;
}

async function main() {
  if (process.env.SEED_CONFIRM !== 'yes') {
    logger.warn('Seed NOT started: it deletes all data. Run with SEED_CONFIRM=yes');
    process.exitCode = 1;
    return;
  }

  await connectDB();
  try {
    const [avatars, postSeeds] = await Promise.all([readImages('avatars'), readPostSeeds()]);
    await clearDatabase();

    const users = await createUsers(avatars);
    const posts = await createPosts(users, postSeeds);
    const demo = users[0];
    if (!demo) throw new Error('No users created');

    const followers = new Map<string, number>();
    const following = new Map<string, number>();
    const postsCount = new Map<string, number>();
    const add = (map: Map<string, number>, id: string) => map.set(id, (map.get(id) ?? 0) + 1);

    const follows = users.flatMap((user) => {
      const others = users.filter((other) => other.id !== user.id);
      const count = user.id === demo.id ? 8 : randomInt(3, 7);
      return sample(others, count).map((target) => {
        add(following, user.id);
        add(followers, target.id);
        return { follower: user._id, following: target._id };
      });
    });
    await Follow.insertMany(follows);

    const likes = [];
    const comments = [];
    const notifications = [];

    for (const post of posts) {
      add(postsCount, post.author.toString());
      const others = users.filter((user) => !user._id.equals(post.author));

      const likers = sample(others, randomInt(0, 8));
      post.likesCount = likers.length;
      for (const liker of likers) {
        likes.push({ user: liker._id, post: post._id });
        notifications.push({
          recipient: post.author,
          sender: liker._id,
          type: 'like',
          post: post._id,
          read: Math.random() < 0.6,
        });
      }

      const commentsCount = randomInt(0, 4);
      post.commentsCount = commentsCount;
      for (let i = 0; i < commentsCount; i += 1) {
        const author = pick(others);
        const date = new Date(post.createdAt.getTime() + randomInt(1, 48) * 60 * 60 * 1000);
        const comment = {
          _id: objectIdAt(date),
          post: post._id,
          author: author._id,
          text: pick(COMMENTS),
          createdAt: date,
        };
        comments.push(comment);
        notifications.push({
          recipient: post.author,
          sender: author._id,
          type: 'comment',
          post: post._id,
          comment: comment._id,
          read: Math.random() < 0.6,
        });
      }
      await post.save();
    }

    for (const follow of follows) {
      notifications.push({
        recipient: follow.following,
        sender: follow.follower,
        type: 'follow',
        read: Math.random() < 0.6,
      });
    }

    await Promise.all([
      Like.insertMany(likes),
      Comment.insertMany(comments),
      Notification.insertMany(notifications),
    ]);

    await Promise.all(
      users.map((user) =>
        User.updateOne(
          { _id: user._id },
          {
            postsCount: postsCount.get(user.id) ?? 0,
            followersCount: followers.get(user.id) ?? 0,
            followingCount: following.get(user.id) ?? 0,
          },
        ),
      ),
    );

    for (const other of sample(users.slice(1), 4)) {
      const conversation = await Conversation.create({
        participants: [demo._id, other._id],
        key: makeConversationKey(demo.id, other.id),
      });
      const count = randomInt(3, MESSAGES.length);
      let lastMessage = null;
      for (let i = 0; i < count; i += 1) {
        const [sender, recipient] = i % 2 === 0 ? [other, demo] : [demo, other];
        lastMessage = await Message.create({
          conversation: conversation._id,
          sender: sender._id,
          recipient: recipient._id,
          text: MESSAGES[i],
        });
      }
      if (lastMessage) {
        conversation.lastMessage = {
          text: lastMessage.text,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt,
        };
        await conversation.save();
      }
    }

    logger.info(
      `Seed done: ${users.length} users, ${posts.length} posts, ${follows.length} follows, ` +
        `${likes.length} likes, ${comments.length} comments, ${notifications.length} notifications. ` +
        `Log in as "demo" / "${PASSWORD}"`,
    );
  } finally {
    await disconnectDB();
  }
}

await main();
