export type IssueDto = {
  id: string;
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  status?: string;
}

export type CreateIssueDto = {
  url: string;
}

export type UpdateIssueTitleDto = {
  title: string;
}
