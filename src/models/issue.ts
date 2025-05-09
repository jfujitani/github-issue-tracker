export interface TrackedIssue {
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  state?: string;
}

