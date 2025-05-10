import { Router, json } from 'express';
import { addIssue, getAllIssues, deleteIssue, getIssue, updateTitle } from '../storage/memory.js';

const router = Router();


router.get('/', (_, res) => {
  res.json(getAllIssues());
  return;
});

router.get('/:id', (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.status(200).json(issue);
  return;
});

router.post('/', json(), (req, res) => {
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

router.put('/:id', json(), (req, res) => {
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

router.delete('/:id', (req, res) => {
  const success = deleteIssue(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).end();
  return;
});

router.get('/:id/status', async (req, res) => {
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
