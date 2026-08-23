const express = require('express');
const executionController = require('../controllers/executionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// GET /api/executions - List all executions
router.get('/', executionController.listExecutions);

// GET /api/executions/:id - Fetch single execution details & snapshot
router.get('/:id', executionController.getExecutionById);

// GET /api/executions/:id/timeline - Fetch granular timeline logs
router.get('/:id/timeline', executionController.getTimeline);

// POST /api/executions/:id/pause - Pause running execution
router.post('/:id/pause', executionController.pauseExecution);

// POST /api/executions/:id/resume - Resume paused execution
router.post('/:id/resume', executionController.resumeExecution);

// POST /api/executions/:id/cancel - Cancel active execution
router.post('/:id/cancel', executionController.cancelExecution);

module.exports = router;
