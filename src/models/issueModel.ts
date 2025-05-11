export interface IssueModel {
  id: string;
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  state?: string;
}

