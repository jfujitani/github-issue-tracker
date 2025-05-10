import { Router, json } from 'express';
import { addIssue, getAllIssues, deleteIssue, getIssue, updateTitle } from '../storage/memory.js';
const router = Router();


router.get('/', (_, res) => {
  res.json(getAllIssues());
});

router.get('/:id', (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue)
    res.status(404).json({ error: "Issue not found" });

  res.status(200).json(issue);
});

router.post('/', json(), (req, res) => {
  const { url } = req.body;
  if (!url) res.status(400).json({ error: 'Missing issue URL' });

  const issue = addIssue(url);
  if (!url) res.status(400).json({ error: 'Invalid GitHub issue URL' });

  res.status(201).json(issue);
});

router.put('/:id', json(), (req, res) => {
  const { title } = req.body;
  if (!title) res.status(400).json({ error: "Missing issute Title" });

  if (updateTitle(req.params.id, title)) {
    const issue = getIssue(req.params.id);
    res.status(200).json(issue);
  }
  res.status(404).json({ error: "Issue not found" });

})
router.delete('/:id', (req, res) => {
  const success = deleteIssue(req.params.id);
  if (!success) res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

router.get('/:id/status', async (req, res) => {
  const issue = getIssue(req.params.id);
  if (!issue) res.status(404).json({ error: 'Issue not found' });

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
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch issue status' });
    }
  }
  res.status(500).json({ error: 'Failed to fetch issue status' });
});

export default router;

