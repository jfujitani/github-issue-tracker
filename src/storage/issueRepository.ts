import { Issue } from '../models/issue.js';

export interface IssueRepository {
  getAll(): Promise<Issue[]>;
  getById(id: string): Promise<Issue | undefined>;
  save(issue: Issue): Promise<boolean>;
  update(issue: Issue): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
