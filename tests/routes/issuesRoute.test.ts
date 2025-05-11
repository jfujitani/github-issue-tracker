import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import * as memory from '../../src/storage/memory.js';

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

  it('should return issue status when GitHub API is successful', async () => {
    // Arrange
    vi.spyOn(memory, 'getIssue').mockImplementation((id: string) => {
      // Return a mocked issue based on the id
      if (id === '123') {
        return {
          id: id,
          url: "test",
          owner: 'owner',
          repo: 'repo',
          number: 1
        };
      }
      return undefined;
    });
    const issueId = '123';
    const mockApiResponse = {
      title: 'Test Issue',
      state: 'open',
      comments: 5,
      html_url: 'https://github.com/owner/repo/issues/1',
    };

    // Mock fetch response
    (fetch as Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockApiResponse),
    });

    // Act
    const response = await request(app).get(`/api/issues/${issueId}/status`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      title: mockApiResponse.title,
      state: mockApiResponse.state,
      comments: mockApiResponse.comments,
      url: mockApiResponse.html_url
    });
  });

});
