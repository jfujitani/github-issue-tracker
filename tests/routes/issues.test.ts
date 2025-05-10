import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { Console } from 'node:console';

describe('Issue API', () => {
  let createdId: string;
  const url = 'https://github.com/octocat/Hello-World/issues/1347';
  const number = 1347;
  const owner = "octocat";
  const repo = "Hello-World";


  beforeEach(() => {
    // Clear in-memory data before each test if needed
    // (e.g. by resetting the in-memory store if it's exposed)
  });

  it('GET /api/issues should return an empty array initially', async () => {
    const res = await request(app).get('/api/issues');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/issues should create a new issue', async () => {
    const newIssue = {
      url: url
    };

    const res = await request(app).post('/api/issues').send(newIssue);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url');
    expect(res.body).toHaveProperty('owner');
    expect(res.body).toHaveProperty('repo');
    expect(res.body).toHaveProperty('number');

    createdId = res.body.id;

  });

  it('GET /api/issues/:id should return the created issue', async () => {
    const res = await request(app).get(`/api/issues/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.url).toBe(url);
    expect(res.body.owner).toBe(owner);
    expect(res.body.repo).toBe(repo);
    expect(res.body.number).toBe(number);
  });

  it('PUT /api/issues/:id should update an issue', async () => {
    const update = { title: 'Updated Title' };
    const res = await request(app).put(`/api/issues/${createdId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe(update.title);
  });

  it('DELETE /api/issues/:id should delete the issue', async () => {
    const res = await request(app).delete(`/api/issues/${createdId}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/issues/:id should return 404 after deletion', async () => {
    const res = await request(app).get(`/api/issues/${createdId}`);
    expect(res.status).toBe(404);
  });
});
