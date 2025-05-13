import { Router, Request, Response, json } from 'express';
import { addIssue, getAllIssues, deleteIssue, getIssue, updateTitle } from '../storage/memory.js';
import { Issue } from '../models/issue.js';

const router = Router();

// GET /issues
router.get('/', async (_: Request, res: Response): Promise<void> => {
  try {
    const issues: Issue[] = getAllIssues();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ mess: (error as Error).message });
  }
});

// GET /issues/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const issue = getIssue(req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.status(200).json(issue);
  return;
});

// POST /issues
router.post('/', json(), async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'Missing issue URL' });
    return;
  }

  const issue = addIssue(url);
  if (!issue) {
    res.status(400).json({ error: 'Invalid GitHub issue URL' });
    return;
  }

  res.status(201).json(issue);
  return;
});

// PATCH /issues/:id/title
router.patch('/:id/title', json(), async (req: Request, res: Response): Promise<void> => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Missing issute Title" });
    return;
  }

  if (updateTitle(req.params.id, title)) {
    const issue = getIssue(req.params.id);
    res.status(200).json(issue);
    return;
  }
  res.status(404).json({ error: "Issue not found" });
  return;
})

// DELETE /issues/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const success = deleteIssue(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).end();
  return;
});

// GET /issues/:id/status
router.get('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const issue = getIssue(req.params.id);
  if (!issue) {
    res.status(404).json({ error: 'Issue not found' });
    return;
  }

  if (issue !== null) {
    const apiUrl = `https://api.github.com/repos/${issue.owner}/${issue.repo}/issues/${issue.number}`;
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
      return;
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch issue status' });
      return;
    }
  }
  res.status(500).json({ error: 'Failed to fetch issue status' });
  return;
});

export default router;
