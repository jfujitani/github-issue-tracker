import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import issuesRouter from './routes/issuesRoute.js';
import { IssueService } from './services/issueService.js';
import { getIssueRepository } from './storage/repositoryFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
const issueRepository = getIssueRepository();
const issueService = new IssueService(issueRepository);
app.use('/api/issues', issuesRouter(issueService));


if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

