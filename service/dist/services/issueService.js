import { Issue } from '../models/issue.model.js';
export class IssueService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(url) {
        const issue = Issue.fromUrl(url);
        const existing = await this.repository.getById(issue.id);
        if (existing)
            return existing;
        return await this.repository.create(issue);
    }
    async getById(id) {
        return await this.repository.getById(id);
    }
    async updateTitle(id, newTitle) {
        const issue = await this.repository.getById(id);
        if (!issue) {
            throw new Error('Issue not found');
        }
        issue.title = newTitle;
        return await this.repository.create(issue);
    }
    async delete(id) {
        return await this.repository.delete(id);
    }
    async getAll() {
        return this.repository.getAll();
    }
    async getStatus(id) {
        const issue = await this.getById(id);
        if (!issue) {
            return null;
        }
        const apiUrl = `https://api.github.com/repos/${issue.owner}/${issue.repo}/issues/${issue.number}`;
        try {
            const response = await fetch(apiUrl, {
                headers: { 'User-Agent': 'Github-Issue-Tracker' }
            });
            if (!response.ok)
                throw new Error('GitHub API error');
            const data = await response.json();
            return { title: data.title, status: data.state };
        }
        catch (err) {
            return null;
        }
    }
}
//# sourceMappingURL=issueService.js.map