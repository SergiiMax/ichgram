import request from 'supertest';
import { app } from '../src/app.js';

export async function registerUser(username: string) {
  const agent = request.agent(app);
  const res = await agent.post('/api/v1/auth/register').send({
    email: `${username}@test.dev`,
    username,
    fullName: username,
    password: 'Password123',
  });
  return { agent, user: res.body.user as { id: string; username: string } };
}
