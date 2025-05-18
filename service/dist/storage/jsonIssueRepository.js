import { promises as fs } from 'fs';
import path from 'path';
export class JsonIssueRepository {
    issues = new Map();
    filePath;
    loaded = false;
    constructor(fileName = 'issues.json') {
        this.filePath = path.resolve(process.cwd(), fileName);
    }
    async load() {
        if (this.loaded)
            return;
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(data);
            this.issues = new Map(parsed.map(issue => [issue.id, issue]));
            this.loaded = true;
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                throw err;
            this.issues = new Map();
        }
    }
    async save() {
        const all = [...this.issues.values()];
        await fs.writeFile(this.filePath, JSON.stringify(all, null, 2));
    }
    async getAll() {
        await this.load();
        return [...this.issues.values()];
    }
    async getById(id) {
        await this.load();
        return this.issues.get(id) ?? null;
    }
    async create(issue) {
        await this.load();
        this.issues.set(issue.id, issue);
        await this.save();
        return issue;
    }
    async update(issue) {
        await this.load();
        if (!this.issues.has(issue.id)) {
            throw new Error(`Issue with id ${issue.id} not found.`);
        }
        this.issues.set(issue.id, issue);
        await this.save();
        return issue;
    }
    async delete(id) {
        await this.load();
        const result = this.issues.delete(id);
        if (result) {
            await this.save();
        }
        return result;
    }
}
//# sourceMappingURL=jsonIssueRepository.js.map