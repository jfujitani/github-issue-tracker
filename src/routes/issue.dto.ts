export type IssueDto = {
  id: string;
  url: string;
  owner: string;
  repo: string;
  number: number;
}

export type CreateIssueDto = {
  url: string;
}

export type IssueStatusDto = {
  id: string;
  status: string;
  title: string;
}
