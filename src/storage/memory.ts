import { TrackedIssue } from "../models/issue.js";
const issues = new Map();

let nextId = 1;

export function addIssue(issue: TrackedIssue) {
  const id = nextId++;
  issues.set(id, { id, issue });
  return issues.get(id);
}

export function getAllIssues() {
  return Array.from(issues.values());
}

export function deleteIssue(id: string) {
  return issues.delete(Number(id));
}

export function getIssue(id: string) {
  return issues.get(Number(id));
}


