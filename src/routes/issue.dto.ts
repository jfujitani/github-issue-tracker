export interface IssueDto {
  id: string;
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  status?: string;
}

export interface CreateIssueDto {
  url: string;
}

export interface UpdateIssueTitleDto {
  title: string;
}
