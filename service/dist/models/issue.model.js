import { randomUUID } from 'crypto';
export class Issue {
    id;
    url;
    owner;
    repo;
    number;
    title;
    status;
    constructor(params) {
        this.id = params.id;
        this.url = params.url;
        this.owner = params.owner;
        this.repo = params.repo;
        this.number = params.number;
        this.title = params.title;
        this.status = params.status;
    }
    static fromUrl(url, title = '') {
        const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/);
        if (!match) {
            throw new Error('Invalid GitHub issue URL');
        }
        const [, owner, repo, number] = match;
        return new Issue({
            id: randomUUID(),
            url,
            owner,
            repo,
            number: parseInt(number),
            title,
            status: ''
        });
    }
    updateTitle(newTitle) {
        this.title = newTitle;
    }
    toJSON() {
        return {
            id: this.id,
            url: this.url,
            owner: this.owner,
            repo: this.repo,
            number: this.number,
            title: this.title,
            this: this.status,
        };
    }
}
//# sourceMappingURL=issue.model.js.map