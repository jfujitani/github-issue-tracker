import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';

describe('Issue API', () => {
  let createdId: string;
  const url = 'https://github.com/octocat/Hello-World/issues/1347';
  const number = 1347;
  const owner = "octocat";
  const repo = "Hello-World";

  vi.stubGlobal('fetch', vi.fn());

  beforeEach(() => {
    // Clear in-memory data before each test if needed
    // (e.g. by resetting the in-memory store if it's exposed)
    vi.clearAllMocks();    // Mock getIssue method from memory module

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

  it('should return issue status when stubbed fetch is successful', async () => {
    // Arrange
    const issueId = createdId;
    const mockApiResponse = {
    };

    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockApiResponse),
    });

    // Act
    const response = await request(app).get(`/api/issues/${issueId}/status`);

    // Assert
    expect(response.status).toBe(200);
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
