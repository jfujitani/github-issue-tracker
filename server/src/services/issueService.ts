import { Issue, IssueStatus } from '../models/issue.model.js';
import { IssueRepository } from '../storage/issueRepository.js';

export class IssueService {
  constructor(private readonly repository: IssueRepository) { }

  async create(url: string): Promise<Issue> {
    const issue = Issue.fromUrl(url);
    const existing = await this.repository.getById(issue.id);
    if (existing) return existing;

    return await this.repository.create(issue);
  }

  async getById(id: string): Promise<Issue | null> {
    return await this.repository.getById(id);
  }

  async updateTitle(id: string, newTitle: string): Promise<Issue> {
    const issue = await this.repository.getById(id);
    if (!issue) {
      throw new Error('Issue not found');
    }
    issue.title = newTitle;
    return await this.repository.create(issue);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  async getAll(): Promise<Issue[]> {
    return this.repository.getAll();
  }

  async getStatus(id: string): Promise<IssueStatus | null> {
    const issue = await this.getById(id);
    if (!issue) {
      return null;
    }

    const apiUrl = `https://api.github.com/repos/${issue.owner}/${issue.repo}/issues/${issue.number}`;
    try {
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Github-Issue-Tracker' }
      });
      if (!response.ok) throw new Error('GitHub API error');
      const data = await response.json();

      return { title: data.title, status: data.state as IssueStatus['status'] };

    } catch (err) {
      return null;
    }

  }
}
