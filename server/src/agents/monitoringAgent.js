const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const { emitExecutionEvent } = require('../config/socket');

/**
 * Monitoring Agent
 * Emits timeline events, records ExecutionLog documents, triggers real-time Socket.IO broadcasts, and saves persistent user notifications.
 */
class MonitoringAgent {
  /**
   * Log an event, broadcast to Socket.IO, and persist to MongoDB
   * @param {object} params
   * @param {string} params.executionId
   * @param {string} params.workflowId
   * @param {string} params.nodeId
   * @param {'planner'|'execution'|'validation'|'recovery'|'monitoring'|'system'} params.agent
   * @param {'info'|'warning'|'error'|'success'} params.level
   * @param {string} params.message
   * @param {object} params.metadata
   * @param {string} [params.userId]
   * @returns {Promise<object>}
   */
  async logEvent({ executionId, workflowId, nodeId, agent, level = 'info', message, metadata = {}, userId }) {
    // 1. Write ExecutionLog in DB
    const logDoc = await ExecutionLog.create({
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
    });

    // 2. Broadcast via Socket.IO to subscribed clients
    const eventPayload = {
      id: logDoc._id,
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      createdAt: logDoc.createdAt,
    };
    emitExecutionEvent(executionId, `agent:${agent}`, eventPayload);
    emitExecutionEvent(executionId, 'execution:log', eventPayload);

    // 3. Create persistent Notification on critical milestones
    if (userId && (level === 'error' || level === 'success' || agent === 'recovery')) {
      const type = level === 'error' ? 'failure' : level === 'success' ? 'success' : 'info';
      await Notification.create({
        owner: userId,
        workflowId,
        executionId,
        type,
        title: `${agent.toUpperCase()} Agent Event`,
        message,
      });
    }

    return logDoc;
  }
}

module.exports = new MonitoringAgent();
