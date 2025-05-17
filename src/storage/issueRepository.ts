import { Issue } from '../models/issue.js';

export interface IssueRepository {
  getAll(): Promise<Issue[]>;
  getById(id: string): Promise<Issue | null>;
  create(issue: Issue): Promise<Issue>;
  update(issue: Issue): Promise<Issue>;
  delete(id: string): Promise<boolean>;
}
