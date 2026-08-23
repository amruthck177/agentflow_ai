const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');

/**
 * List executions for a user
 */
const getExecutions = async (userId, { page = 1, limit = 20, status, workflowId }) => {
  const query = { owner: userId };
  if (status && status !== 'all') query.status = status;
  if (workflowId) query.workflowId = workflowId;

  const skip = (Number(page) - 1) * Number(limit);
  const [executions, total] = await Promise.all([
    Execution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('workflowId', 'name'),
    Execution.countDocuments(query),
  ]);

  return {
    executions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get execution details by ID
 */
const getExecutionById = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: userId }).populate('workflowId', 'name description');
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }
  return execution;
};

/**
 * Get execution timeline logs
 */
const getExecutionTimeline = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: userId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  const logs = await ExecutionLog.find({ executionId }).sort({ createdAt: 1 });
  return logs;
};

/**
 * Pause execution
 */
const pauseExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: userId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  if (execution.status !== 'RUNNING') {
    const err = new Error(`Cannot pause an execution in "${execution.status}" status.`);
    err.statusCode = 400;
    throw err;
  }

  execution.status = 'PAUSED';
  await execution.save();
  return execution;
};

/**
 * Resume execution
 */
const resumeExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: userId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  if (execution.status !== 'PAUSED') {
    const err = new Error(`Cannot resume an execution in "${execution.status}" status.`);
    err.statusCode = 400;
    throw err;
  }

  execution.status = 'RUNNING';
  await execution.save();

  // Trigger runner to continue
  setImmediate(async () => {
    const orchestrator = require('../agents/orchestrator');
    await orchestrator.runExecution(executionId);
  });

  return execution;
};

/**
 * Cancel execution
 */
const cancelExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, owner: userId });
  if (!execution) {
    const err = new Error('Execution not found');
    err.statusCode = 404;
    throw err;
  }

  execution.status = 'CANCELLED';
  execution.endTime = new Date();
  await execution.save();
  return execution;
};

module.exports = {
  getExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
