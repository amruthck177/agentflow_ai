const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');
const { queueExecution } = require('../queues/executionQueue');

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user._id, req.body);
    res.status(201).json({ success: true, data: workflow });
  } catch (err) {
    next(err);
  }
};

const getWorkflows = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await workflowService.getWorkflows(req.user._id, { page, limit, search, status });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.user._id, req.params.id);
    res.json({ success: true, data: workflow });
  } catch (err) {
    next(err);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.user._id, req.params.id, req.body);
    res.json({ success: true, data: workflow });
  } catch (err) {
    next(err);
  }
};

const duplicateWorkflow = async (req, res, next) => {
  try {
    const cloned = await workflowService.duplicateWorkflow(req.user._id, req.params.id);
    res.status(201).json({ success: true, data: cloned });
  } catch (err) {
    next(err);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    const result = await workflowService.deleteWorkflow(req.user._id, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await workflowService.getDashboardStats(req.user._id);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

const generateWorkflow = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const generated = await aiService.generateWorkflowFromPrompt(prompt);
    res.json({ success: true, data: generated });
  } catch (err) {
    next(err);
  }
};

const executeWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.user._id, req.params.id);
    const execution = await queueExecution(workflow, req.user._id, req.body.inputs || {});
    res.status(202).json({ success: true, data: execution, message: 'Execution started' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  getDashboardStats,
  generateWorkflow,
  executeWorkflow,
};
