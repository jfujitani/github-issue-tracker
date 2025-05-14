export interface Issue {
  id: string;
  url: string;
  owner: string;
  repo: string;
  number: number;
  title?: string;
  status?: string;
}

