import { IssueModel } from "../models/issueModel.js";
const issues = new Map<string, IssueModel>();

let nextId = 1;

export function addIssue(url: string): IssueModel | undefined {
  const parsed = parseGitHubIssueURL(url);

  if (parsed === undefined) {
    return undefined;
  }

  issues.set(parsed.id.toString(), parsed);
  return issues.get(parsed.id) ?? undefined;
}

export function updateTitle(id: string, newTitle: string): boolean {
  const issue = issues.get(id);
  if (!issue) return false;

  issue.title = newTitle;
  return true;
}

export function getAllIssues() {
  return Array.from(issues.values());
}

export function deleteIssue(id: string) {
  return issues.delete(id);
}

export function getIssue(id: string): IssueModel | undefined {
  return issues.get(id) ?? undefined;
}

function parseGitHubIssueURL(url: string): IssueModel | undefined {
  const id = nextId++;
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return undefined;
  return {
    id: id.toString(),
    repo: match[2],
    number: parseInt(match[3]),
    url: url,
    owner: match[1]
  };
}
