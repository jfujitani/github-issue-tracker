import { Router, json } from 'express';
export default function issuesRoutes(service) {
    const router = Router();
    // GET /issues
    router.get('/', async (_, res) => {
        try {
            const issues = await service.getAll();
            res.status(200).json(issues.map(issue => (mapIssueToDto(issue))));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // GET /issues/:id
    router.get('/:id', async (req, res) => {
        try {
            const issue = await service.getById(req.params.id);
            if (!issue) {
                res.status(404).json({ error: "Issue not found" });
                return;
            }
            res.status(200).json(mapIssueToDto(issue));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // POST /issues
    router.post('/', json(), async (req, res) => {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ error: 'Missing issue URL' });
            return;
        }
        try {
            const issue = await service.create(url);
            if (!issue) {
                res.status(400).json({ error: 'Invalid GitHub issue URL' });
                return;
            }
            res.status(201).json(mapIssueToDto(issue));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // DELETE /issues/:id
    router.delete('/:id', async (req, res) => {
        try {
            const success = await service.delete(req.params.id);
            if (!success) {
                res.status(500).json({ error: 'Unable to delete' });
                return;
            }
            res.status(204).end();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    // GET /issues/:id/status
    router.get('/:id/status', async (req, res) => {
        try {
            const issue = await service.getById(req.params.id);
            if (!issue) {
                res.status(404).json({ error: 'Issue not found' });
                return;
            }
            const status = await service.getStatus(req.params.id);
            if (!status) {
                res.status(404).json({ error: 'Issue not found' });
                return;
            }
            res.json(mapToIssueStatusDto(issue, status));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    function mapIssueToDto(issue) {
        return {
            id: issue.id,
            url: issue.url,
            owner: issue.owner,
            repo: issue.repo,
            number: issue.number,
        };
    }
    function mapToIssueStatusDto(issue, issueStatus) {
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
//# sourceMappingURL=issuesRoute.js.map