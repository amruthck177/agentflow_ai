const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');

/**
 * Create a new workflow
 */
const createWorkflow = async (userId, data) => {
  const workflow = await Workflow.create({
    ...data,
    owner: userId,
    version: 1,
  });
  return workflow;
};

/**
 * List workflows with search, filter, and pagination
 */
const getWorkflows = async (userId, { page = 1, limit = 10, search = '', status = '' }) => {
  const query = { owner: userId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [workflows, total] = await Promise.all([
    Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
    Workflow.countDocuments(query),
  ]);

  return {
    workflows,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get workflow by ID
 */
const getWorkflowById = async (userId, workflowId) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }
  return workflow;
};

/**
 * Update an existing workflow
 */
const updateWorkflow = async (userId, workflowId, updateData) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  // Auto-increment version if nodes or edges change
  if (updateData.nodes || updateData.edges) {
    workflow.version = (workflow.version || 1) + 1;
  }

  Object.assign(workflow, updateData);
  await workflow.save();
  return workflow;
};

/**
 * Duplicate a workflow
 */
const duplicateWorkflow = async (userId, workflowId) => {
  const original = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!original) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  const cloned = await Workflow.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    owner: userId,
    status: 'draft',
    triggerConfig: original.triggerConfig,
    nodes: original.nodes,
    edges: original.edges,
    version: 1,
    tags: original.tags,
  });

  return cloned;
};

/**
 * Delete a workflow
 */
const deleteWorkflow = async (userId, workflowId) => {
  const workflow = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }
  return { id: workflowId, message: 'Workflow deleted successfully' };
};

/**
 * Dashboard stats: aggregated workflow counts and execution metrics
 */
const getDashboardStats = async (userId) => {
  const [
    totalWorkflows,
    activeWorkflows,
    draftWorkflows,
    pausedWorkflows,
    totalExecutions,
    completedExecutions,
    failedExecutions,
    runningExecutions,
    recentExecutions,
    recentWorkflows,
  ] = await Promise.all([
    Workflow.countDocuments({ owner: userId }),
    Workflow.countDocuments({ owner: userId, status: 'active' }),
    Workflow.countDocuments({ owner: userId, status: 'draft' }),
    Workflow.countDocuments({ owner: userId, status: 'paused' }),
    Execution.countDocuments({ owner: userId }),
    Execution.countDocuments({ owner: userId, status: 'COMPLETED' }),
    Execution.countDocuments({ owner: userId, status: 'FAILED' }),
    Execution.countDocuments({ owner: userId, status: 'RUNNING' }),
    Execution.find({ owner: userId }).sort({ createdAt: -1 }).limit(5).populate('workflowId', 'name'),
    Workflow.find({ owner: userId }).sort({ updatedAt: -1 }).limit(5),
  ]);

  const successRate = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 100;

  return {
    workflows: {
      total: totalWorkflows,
      active: activeWorkflows,
      draft: draftWorkflows,
      paused: pausedWorkflows,
    },
    executions: {
      total: totalExecutions,
      completed: completedExecutions,
      failed: failedExecutions,
      running: runningExecutions,
      successRate,
    },
    recentExecutions,
    recentWorkflows,
  };
};

module.exports = {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  getDashboardStats,
};
