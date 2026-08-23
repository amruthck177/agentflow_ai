const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply auth to all workflow routes
router.use(auth);

// GET /api/workflows/dashboard - Aggregated stats
router.get('/dashboard', workflowController.getDashboardStats);

// POST /api/workflows/generate - Generate workflow from prompt
router.post(
  '/generate',
  [body('prompt').trim().notEmpty().withMessage('Prompt is required')],
  validate,
  workflowController.generateWorkflow
);

// GET /api/workflows - List workflows
router.get('/', workflowController.getWorkflows);

// POST /api/workflows - Create manual workflow
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
  ],
  validate,
  workflowController.createWorkflow
);

// GET /api/workflows/:id - Fetch single workflow
router.get('/:id', workflowController.getWorkflowById);

// PUT /api/workflows/:id - Update workflow
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Workflow name cannot be empty'),
  ],
  validate,
  workflowController.updateWorkflow
);

// POST /api/workflows/:id/duplicate - Duplicate workflow
router.post('/:id/duplicate', workflowController.duplicateWorkflow);

// POST /api/workflows/:id/execute - Trigger execution
router.post('/:id/execute', workflowController.executeWorkflow);

// DELETE /api/workflows/:id - Delete workflow
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
