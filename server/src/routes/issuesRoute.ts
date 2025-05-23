import { Router, Request, Response, json } from 'express';
import { Issue, IssueStatus } from '../models/issue.model.js';
import { IssueDto, CreateIssueDto, IssueStatusDto } from './issue.dto.js';
import { IssueService } from '../services/issueService.js';
import { ErrorResponse } from './errorResponse.dto.js';

export default function issuesRoutes(service: IssueService) {
  const router = Router();

  // GET /issues
  router.get('/', async (_: Request, res: Response<IssueDto[] | ErrorResponse>) => {
    try {
      const issues: Issue[] = await service.getAll();
      res.status(200).json(issues.map(issue => (mapIssueToDto(issue))));
    } catch (error) {
      res.status(500).json({ error: "Internal server error", message: (error as Error).message });
    }
  });

  // GET /issues/:id
  router.get('/:id', async (req: Request, res: Response<IssueDto | ErrorResponse>) => {
    try {
      const issue = await service.getById(req.params.id);
      if (!issue) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }
      res.status(200).json(mapIssueToDto(issue));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
    }
  });

  // POST /issues
  router.post('/', json(), async (req: Request<{}, {}, CreateIssueDto>, res: Response<IssueDto | ErrorResponse>) => {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: 'Invalid arguments', message: 'url is required' });
      return;
    }

    try {
      const issue = await service.create(url);
      if (!issue) {
        res.status(400).json({ error: 'Ivalid arguments', message: 'Invalid GitHub issue URL' });
        return;
      }
      res.status(201).json(mapIssueToDto(issue));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
    }
  });

  // DELETE /issues/:id
  router.delete('/:id', async (req: Request, res: Response<void | ErrorResponse>) => {
    try {
      const success = await service.delete(req.params.id);
      if (!success) {
        res.status(500).json({ error: 'Internal server error', message: 'Unable to delete' });
        return;
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
    }
  });

  // GET /issues/:id/status
  router.get('/:id/status', async (req: Request, res: Response<IssueStatusDto | ErrorResponse>) => {
    try {
      const issue = await service.getById(req.params.id);
      if (!issue) {
        res.status(404).json({ error: 'Not found', message: 'Issue not found' });
        return;
      }
      const status = await service.getStatus(req.params.id);
      if (!status) {
        res.status(404).json({ error: 'Not found', message: 'Issue not found' });
        return
      }
      res.json(mapToIssueStatusDto(issue, status));
    } catch (error) {
      res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
    }
  });

  function mapIssueToDto(issue: Issue): IssueDto {
    return {
      id: issue.id,
      url: issue.url,
      owner: issue.owner,
      repo: issue.repo,
      number: issue.number as number,
    }
  }

  function mapToIssueStatusDto(
    issue: Issue,
    issueStatus: IssueStatus
  ): IssueStatusDto {
    return {
      id: issue.id,
      status: issueStatus.status === 'open' || issueStatus.status === 'closed'
        ? issueStatus.status
        : 'other',
      title: issueStatus.title,
    };
  }
  return router;
}
