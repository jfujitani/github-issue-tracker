export class MemoryIssueRepository {
    issues = new Map();
    async getAll() {
        return [...this.issues.values()];
    }
    async getById(id) {
        const issue = this.issues.get(id);
        if (!issue) {
            return null;
        }
        return issue;
    }
    async create(issue) {
        this.issues.set(issue.id, issue);
        return issue;
    }
    async update(issue) {
        if (!this.issues.has(issue.id)) {
            throw new Error(`Issue with id ${issue.id} not found.`);
        }
        this.issues.set(issue.id, issue);
        return issue;
    }
    async delete(id) {
        return this.issues.delete(id);
    }
}
//# sourceMappingURL=memoryIssueRepository.js.map