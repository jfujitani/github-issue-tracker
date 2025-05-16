import { randomUUID } from 'crypto';

export class Issue {
  public readonly id: string;
  public readonly url: string;
  public readonly owner: string;
  public readonly repo: string;
  public readonly number: number;
  public title: string;
  public status: string;

  private constructor(params: {
    id: string;
    url: string;
    owner: string;
    repo: string;
    number: number;
    title: string;
    status: string;
  }) {
    this.id = params.id;
    this.url = params.url;
    this.owner = params.owner;
    this.repo = params.repo;
    this.number = params.number;
    this.title = params.title;
    this.status = params.status;
  }

  static fromUrl(url: string, title = ''): Issue {
    const match = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)$/
    );
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

  updateTitle(newTitle: string): void {
    this.title = newTitle;
  }

  toJSON(): Record<string, string | number> {
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


