import { IssueRepository } from './issueRepository.js';
import { Issue } from '../models/issue.js';

export class MemoryIssueRepository implements IssueRepository {

  private issues = new Map<string, Issue>();

  async getAll(): Promise<Issue[]> {
    return [...this.issues.values()];
  }

  async getById(id: string): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async save(issue: Issue): Promise<boolean> {
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
    this.issues.delete(id);
    return true;
  }
}
