import { MemoryIssueRepository } from './memoryIssueRepository.js';
import { JsonIssueRepository } from './jsonIssueRepository.js';
import path from 'path';
export function getIssueRepository() {
    const type = process.env.ISSUE_REPOSITORY ?? 'json';
    switch (type) {
        case 'memory':
            return new MemoryIssueRepository();
        case 'json': {
            const filePath = process.env.ISSUE_STORAGE_PATH ?? path.join(process.cwd(), 'data', 'issues.json');
            return new JsonIssueRepository(filePath);
        }
        default:
            throw new Error(`Unknown ISSUE_REPOSITORY type: ${type}`);
    }
}
//# sourceMappingURL=repositoryFactory.js.map