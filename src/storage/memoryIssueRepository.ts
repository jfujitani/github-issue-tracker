import { IssueRepository } from './issueRepository.js';
import { Issue } from '../models/issue.js';

export class MemoryIssueRepository implements IssueRepository {

  private issues = new Map<string, Issue>();

  async getAll(): Promise<Issue[]> {
    return [...this.issues.values()];
  }

  async getById(id: string): Promise<Issue | null> {
    const issue = this.issues.get(id);
    if (!issue) {
      return null;
    }
    return issue;
  }

  async create(issue: Issue): Promise<boolean> {
    this.issues.set(issue.id, issue);
    return true;
  }

  async update(issue: Issue): Promise<boolean> {
    if (!this.issues.has(issue.id)) {
      throw new Error(`Issue with id ${issue.id} not found.`);
    }
    this.issues.set(issue.id, issue);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    return this.issues.delete(id);
  }
}
