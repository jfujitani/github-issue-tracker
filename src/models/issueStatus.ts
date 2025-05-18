import { Issue } from '../models/issue';

export type IssueStatus = {
  status: 'open' | 'closed' | string;
  title: string;
};


