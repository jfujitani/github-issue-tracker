import { TrackedIssue } from "../models/issue.js";
const issues = new Map<number, TrackedIssue>();

let nextId = 1;

export function addIssue(url: string): TrackedIssue | null {
  const parsed = parseGitHubIssueURL(url);

  if (parsed === null) {
    return null;
  }

  issues.set(parsed.id, parsed);
  return issues.get(parsed.id) ?? null;
}

export function updateTitle(id: string, newTitle: string): boolean {
  const issue = issues.get(Number(id));
  if (!issue) return false;

  issue.title = newTitle;
  return true;
}

export function getAllIssues() {
  return Array.from(issues.values());
}

export function deleteIssue(id: string) {
  return issues.delete(Number(id));
}

export function getIssue(id: string): TrackedIssue | null {
  return issues.get(Number(id)) ?? null;
}

function parseGitHubIssueURL(url: string): TrackedIssue | null {
  const id = nextId++;
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  return {
    id: id,
    repo: match[2],
    number: parseInt(match[3]),
    url: url,
    owner: match[1]
  };
}
