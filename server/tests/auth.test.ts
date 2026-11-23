import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { registerUser } from './helpers.js';

const credentials = {
  email: 'anna@test.dev',
  username: 'anna',
  fullName: 'Anna',
  password: 'Password123',
};

describe('auth', () => {
  it('registers a user and sets auth cookies', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('anna');
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(String(res.headers['set-cookie'])).toContain('accessToken=');
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...credentials, username: 'anna2' });

    expect(res.status).toBe(409);
  });

  it('rejects invalid data with 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...credentials, email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in by username and returns the current user', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const agent = request.agent(app);

    const login = await agent
      .post('/api/v1/auth/login')
      .send({ login: 'anna', password: 'Password123' });
    const me = await agent.get('/api/v1/auth/me');

    expect(login.status).toBe(200);
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('anna');
  });

  it('rejects a wrong password with 401', async () => {
    await request(app).post('/api/v1/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ login: 'anna', password: 'WrongPassword' });

    expect(res.status).toBe(401);
  });

  it('requires authentication for /me', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });

  it('rotates the refresh token and rejects the old one', async () => {
    const { agent } = await registerUser('anna');
    const oldCookies = (await agent.post('/api/v1/auth/refresh')).headers['set-cookie'];
    expect(oldCookies).toBeDefined();

    const second = await agent.post('/api/v1/auth/refresh');
    expect(second.status).toBe(204);

    const reuse = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', oldCookies ?? []);
    expect(reuse.status).toBe(401);
  });
});
