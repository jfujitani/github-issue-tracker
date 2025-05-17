import { Issue } from '../models/issue';
import { IssueRepository } from '../storage/issueRepository.js';

export class IssueService {
  constructor(private readonly repository: IssueRepository) { }

  async create(issue: Issue): Promise<Issue> {
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
    return await this.repository.update(issue);
  }

  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  async getAll(): Promise<Issue[]> {
    return this.repository.getAll();
  }

  async getStatus(id: string): Promise<Issue | undefined> {
    const issue = await this.getById(id);
    if (!issue) {
      return undefined;
    }

    const apiUrl = `https://api.github.com/repos/${issue.owner}/${issue.repo}/issues/${issue.number}`;
    try {
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Github-Issue-Tracker' }
      });
      if (!response.ok) throw new Error('GitHub API error');
      const data = await response.json();
      issue.status = data.state;
      issue.title = data.title;
      return issue;

    } catch (err) {
      return undefined;
    }

  }
}
