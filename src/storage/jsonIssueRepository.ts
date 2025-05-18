import { Issue } from '../models/issue.model.js';
import { IssueRepository } from './issueRepository.js';
import { promises as fs } from 'fs';
import path from 'path';

export class JsonIssueRepository implements IssueRepository {
  private issues = new Map<string, Issue>();
  private readonly filePath: string;
  private loaded = false;

  constructor(fileName = 'issues.json') {
    this.filePath = path.resolve(process.cwd(), fileName);
  }

  private async load(): Promise<void> {
    if (this.loaded) return;

    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed: Issue[] = JSON.parse(data);
      this.issues = new Map(parsed.map(issue => [issue.id, issue]));
      this.loaded = true;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      this.issues = new Map();
    }
  }

  private async save(): Promise<void> {
    const all = [...this.issues.values()];
    await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
  }

  async getAll(): Promise<Issue[]> {
    await this.load();
    return [...this.issues.values()];
  }

  async getById(id: string): Promise<Issue | null> {
    await this.load();
    return this.issues.get(id) ?? null;
  }

  async create(issue: Issue): Promise<Issue> {
    await this.load();
    this.issues.set(issue.id, issue);
    await this.save();
    return issue;
  }

  async update(issue: Issue): Promise<Issue> {
    await this.load();
    if (!this.issues.has(issue.id)) {
      throw new Error(`Issue with id ${issue.id} not found.`);
    }
    this.issues.set(issue.id, issue);
    await this.save();
    return issue;
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const result = this.issues.delete(id);
    if (result) {
      await this.save();
    }
    return result;
  }
}

