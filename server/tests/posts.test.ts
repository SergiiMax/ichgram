import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { registerUser } from './helpers.js';

const image = Buffer.from('fake image');

async function createPost(agent: ReturnType<typeof request.agent>, caption = 'Hello') {
  const res = await agent
    .post('/api/v1/posts')
    .field('caption', caption)
    .attach('image', image, 'photo.jpg');
  return res;
}

describe('posts', () => {
  it('creates a post with an image', async () => {
    const { agent } = await registerUser('anna');
    const res = await createPost(agent);

    expect(res.status).toBe(201);
    expect(res.body.post.caption).toBe('Hello');
    expect(res.body.post.author.username).toBe('anna');
    expect(res.body.post.image.small).toContain('posts/test');
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/posts').attach('image', image, 'photo.jpg');

    expect(res.status).toBe(401);
  });

  it('requires an image', async () => {
    const { agent } = await registerUser('anna');
    const res = await agent.post('/api/v1/posts').field('caption', 'No image');

    expect(res.status).toBe(400);
  });

  it('likes a post only once (idempotent)', async () => {
    const { agent: anna } = await registerUser('anna');
    const { agent: boris } = await registerUser('boris');
    const postId = (await createPost(anna)).body.post.id;

    await boris.post(`/api/v1/posts/${postId}/like`);
    const second = await boris.post(`/api/v1/posts/${postId}/like`);
    const post = await boris.get(`/api/v1/posts/${postId}`);

    expect(second.body).toEqual({ liked: true, likesCount: 1 });
    expect(post.body.post.isLiked).toBe(true);
  });

  it('forbids deleting someone else’s post', async () => {
    const { agent: anna } = await registerUser('anna');
    const { agent: boris } = await registerUser('boris');
    const postId = (await createPost(anna)).body.post.id;

    const res = await boris.delete(`/api/v1/posts/${postId}`);

    expect(res.status).toBe(403);
  });

  it('lets the author delete a post', async () => {
    const { agent } = await registerUser('anna');
    const postId = (await createPost(agent)).body.post.id;

    const res = await agent.delete(`/api/v1/posts/${postId}`);
    const after = await agent.get(`/api/v1/posts/${postId}`);

    expect(res.status).toBe(204);
    expect(after.status).toBe(404);
  });

  it('shows posts of followed users in the feed (follow uses a transaction)', async () => {
    const { agent: anna } = await registerUser('anna');
    const { agent: boris } = await registerUser('boris');
    await registerUser('olga');
    await createPost(anna, 'From Anna');

    const follow = await boris.post('/api/v1/users/anna/follow');
    const feed = await boris.get('/api/v1/posts/feed');

    expect(follow.body).toEqual({ isFollowing: true, followersCount: 1 });
    expect(feed.body.posts.map((post: { caption: string }) => post.caption)).toEqual(['From Anna']);
  });
});
