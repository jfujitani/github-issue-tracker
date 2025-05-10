export interface TrackedIssue {
  id: number;
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  state?: string;
}

