import { Router, json } from 'express';
import { addIssue, getAllIssues, deleteIssue, getIssue } from '../storage/memory.js';
const router = Router();

function parseGitHubIssueURL(url: string) {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: match[3] };
}

router.get('/', (req, res) => {
  res.json(getAllIssues());
});

router.post('/', json(), (req, res) => {
  const { url } = req.body;
  if (!url) res.status(400).json({ error: 'Missing issue URL' });

  const parsed = parseGitHubIssueURL(url);
  if (!parsed) res.status(400).json({ error: 'Invalid GitHub issue URL' });

  const issue = addIssue(url);
  res.status(201).json(issue);
});

router.delete('/:id', (req, res) => {
  const success = deleteIssue(req.params.id);
  if (!success) res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/:id/status', async (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue) res.status(404).json({ error: 'Issue not found' });

  const parsed = parseGitHubIssueURL(issue.url);
  if (!parsed) res.status(400).json({ error: 'Invalid stored URL' });

  if (parsed !== null) {
    const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${parsed.number}`;
    try {
      const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Github-Issue-Tracker' }
      });
      if (!response.ok) throw new Error('GitHub API error');
      const data = await response.json();
      res.json({
        title: data.title,
        state: data.state,
        comments: data.comments,
        url: data.html_url
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch issue status' });
    }
  }
  res.status(500).json({ error: 'Failed to fetch issue status' });
});

export default router;

