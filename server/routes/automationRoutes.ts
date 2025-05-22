import { Router } from 'express';
import {
  processNLPQuery,
  createTask,
  runBusinessAudit,
  getLogs
} from '../controllers/automationController';

const router = Router();

/**
 * POST /api/automation/nlp-query
 * Process natural language queries using GPT-4
 */
router.post('/nlp-query', processNLPQuery);

/**
 * POST /api/automation/create-task
 * Create and save a new automation task
 */
router.post('/create-task', createTask);

/**
 * POST /api/automation/run-audit
 * Run a comprehensive business audit using AI
 */
router.post('/run-audit', runBusinessAudit);

/**
 * GET /api/automation/logs
 * Get all completed tasks and logs
 */
router.get('/logs', getLogs);

/**
 * GET /api/automation/cron-tasks
 * Get status of automated scheduled tasks
 */
router.get('/cron-tasks', (req, res) => {
  res.json({
    message: 'Automation workflows are running',
    activeAutomations: [
      'pending-task-checker',
      'daily-summary',
      'log-cleanup'
    ],
    status: 'operational'
  });
});

export default router;