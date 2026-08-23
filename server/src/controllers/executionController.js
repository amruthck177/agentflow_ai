const executionService = require('../services/executionService');

const listExecutions = async (req, res, next) => {
  try {
    const { page, limit, status, workflowId } = req.query;
    const result = await executionService.getExecutions(req.user._id, { page, limit, status, workflowId });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getExecutionById = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.user._id, req.params.id);
    res.json({ success: true, data: execution });
  } catch (err) {
    next(err);
  }
};

const getTimeline = async (req, res, next) => {
  try {
    const timeline = await executionService.getExecutionTimeline(req.user._id, req.params.id);
    res.json({ success: true, data: timeline });
  } catch (err) {
    next(err);
  }
};

const pauseExecution = async (req, res, next) => {
  try {
    const execution = await executionService.pauseExecution(req.user._id, req.params.id);
    res.json({ success: true, data: execution, message: 'Execution paused' });
  } catch (err) {
    next(err);
  }
};

const resumeExecution = async (req, res, next) => {
  try {
    const execution = await executionService.resumeExecution(req.user._id, req.params.id);
    res.json({ success: true, data: execution, message: 'Execution resumed' });
  } catch (err) {
    next(err);
  }
};

const cancelExecution = async (req, res, next) => {
  try {
    const execution = await executionService.cancelExecution(req.user._id, req.params.id);
    res.json({ success: true, data: execution, message: 'Execution cancelled' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listExecutions,
  getExecutionById,
  getTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
