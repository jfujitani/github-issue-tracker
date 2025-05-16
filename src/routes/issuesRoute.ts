import { Router, Request, Response, json } from 'express';
import { Issue } from '../models/issue.js';
import { IssueDto, CreateIssueDto, UpdateIssueTitleDto } from './issue.dto.js';
import { IssueService } from '../services/issueService.js';
import { MemoryIssueRepository } from '../storage/memoryIssueRepository.js';
import { ApiResponse } from './apiResponse.dto.js';

const router = Router();
const service = new IssueService(new MemoryIssueRepository);

// GET /issues
router.get('/', async (_: Request, res: Response<ApiResponse<IssueDto[]>>): Promise<void> => {
  try {
    const issues: Issue[] = await service.getAll();
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
  const issue = await service.getById(req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  res.status(200).json(mapIssueToDto(issue));
});

// POST /issues
router.post('/', json(), async (req: Request<{}, {}, CreateIssueDto>, res: Response<ApiResponse<IssueDto>>) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'Missing issue URL' });
    return;
  }

  const issue = Issue.fromUrl(url);
  const result = await service.create(issue); if (result) {
    res.status(201).json(mapIssueToDto(issue));
    return;
  }
  res.status(400).json({ error: 'Invalid GitHub issue URL' });
});

// PATCH /issues/:id/title
router.patch('/:id/title', json(), async (req: Request<{ id: string }, {}, UpdateIssueTitleDto>, res: Response<ApiResponse<IssueDto>>): Promise<void> => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ error: "Missing issute Title" });
    return;
  }


  const issue = await service.getById(req.params.id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }
  await service.updateTitle(req.params.id, title);

  res.status(200).json(mapIssueToDto(issue));
});

// DELETE /issues/:id
router.delete('/:id', async (req: Request, res: Response<ApiResponse<void>>) => {
  const success = await service.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.status(204).end();
});

// GET /issues/:id/status
// Todo define and return correct dto for this
router.get('/:id/status', async (req: Request, res: Response<ApiResponse<IssueDto>>): Promise<void> => {
  const status = await service.getStatus(req.params.id);
  if (status) {
    res.json(mapIssueToDto(status));
  }
  res.status(404).json({ error: 'Issue not found' });
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
