import { Router, Request, Response, json } from 'express';
import { addIssue, getAllIssues, deleteIssue, getIssue, updateTitle } from '../storage/memory.js';
import { Issue } from '../models/issue.js';
import { IssueDto, CreateIssueDto, UpdateIssueTitleDto } from './issue.dto.js';
import { ApiResponse } from './apiResponse.dto.js';

const router = Router();

// GET /issues
router.get('/', async (_: Request, res: Response<ApiResponse<IssueDto[]>>): Promise<void> => {
  try {
    const issues: Issue[] = getAllIssues();
    const dtos: IssueDto[] = issues.map(issue => (
      mapIssueToDto(issue)
    ));
    res.json(dtos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /issues/:id
router.get('/:id', async (req: Request, res: Response<ApiResponse<IssueDto>>) => {
  const issue = getIssue(req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.status(200).json(mapIssueToDto(issue));
});

// POST /issues
router.post('/', json(), async (req: Request<{}, {}, CreateIssueDto>,
  res: Response<ApiResponse<IssueDto>>) => {
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

  res.status(201).json(mapIssueToDto(issue));
});

// PATCH /issues/:id/title
router.patch('/:id/title', json(), async (req: Request<{ id: string }, {},
  UpdateIssueTitleDto>, res: Response<ApiResponse<IssueDto>>): Promise<void> => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Missing issute Title" });
    return;
  }

  if (updateTitle(req.params.id, title)) {
    const issue = getIssue(req.params.id);
    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(mapIssueToDto(issue));
  }
});

// DELETE /issues/:id
router.delete('/:id', async (req: Request, res: Response<ApiResponse<void>>) => {
  const success = deleteIssue(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).end();
});

// GET /issues/:id/status
// Todo define and return correct dto for this
router.get('/:id/status', async (req: Request, res: Response<ApiResponse<IssueDto>>): Promise<void> => {
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
      const issueDto = mapIssueToDto(issue);
      // Todo consider if this should be retrived and stored before this point. 
      issueDto.status = data.state;
      issueDto.title = data.title;
      res.json(issueDto);
      return;
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch issue status' });
      return;
    }
  }
  res.status(500).json({ error: 'Failed to fetch issue status' });
});

function mapIssueToDto(issue: Issue): IssueDto {
  return {
    id: issue.id,
    url: issue.url,
    owner: issue.owner,
    repo: issue.repo,
    number: issue.number as number,
    title: issue.title,
    status: issue.status
  }
}

export default router;
