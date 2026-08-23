const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const Execution = require('../models/Execution');

// Check LangGraph availability
let langGraphStatus = 'not-installed';
try {
  require('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (e) {
  langGraphStatus = 'not-installed';
}

/**
 * Main Agentic Orchestrator
 * Runs a workflow execution through the cooperating chain:
 * Planner -> Execution -> Validation -> Recovery -> Monitoring
 */
class Orchestrator {
  /**
   * Run workflow execution
   * @param {string} executionId - Execution document ID
   * @returns {Promise<object>} Finished execution record
   */
  async runExecution(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const { workflowSnapshot, owner, workflowId } = execution;
    const userId = owner.toString();

    // 1. Initialise Run
    execution.status = 'RUNNING';
    execution.startTime = new Date();
    execution.agentMeta = { langGraph: langGraphStatus };
    await execution.save();

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'system',
      level: 'info',
      message: `Execution initiated. LangGraph substrate: ${langGraphStatus}.`,
      metadata: { langGraph: langGraphStatus },
      userId,
    });

    const context = {
      inputs: execution.inputs || {},
      outputs: {},
    };

    try {
      // 2. PLANNER AGENT: Generate plan
      const planResult = await plannerAgent.plan(workflowSnapshot, context.inputs);
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'info',
        message: `Plan created with ${planResult.plan.length} nodes. Confidence: ${Math.round(planResult.confidence * 100)}%.`,
        metadata: {
          confidenceScore: planResult.confidence,
          nodeCount: planResult.plan.length,
          reasoning: planResult.reasoning,
        },
        userId,
      });

      const plan = planResult.plan;

      // 3. EXECUTE NODES IN PLANNED SEQUENCE
      for (let i = 0; i < plan.length; i++) {
        const node = plan[i];

        // Check if execution was paused or cancelled by user
        const freshExecution = await Execution.findById(executionId);
        if (freshExecution.status === 'PAUSED' || freshExecution.status === 'CANCELLED') {
          await monitoringAgent.logEvent({
            executionId,
            workflowId,
            nodeId: node.id,
            agent: 'system',
            level: 'warning',
            message: `Execution was ${freshExecution.status.toLowerCase()} by operator.`,
            userId,
          });
          return freshExecution;
        }

        freshExecution.currentNode = node.id;
        await freshExecution.save();

        let retryCount = 0;
        let nodeSuccess = false;
        let nodeOutput = null;

        while (!nodeSuccess) {
          try {
            await monitoringAgent.logEvent({
              executionId,
              workflowId,
              nodeId: node.id,
              agent: 'execution',
              level: 'info',
              message: `Executing node "${node.label || node.id}" (Type: ${node.type}).`,
              metadata: { nodeType: node.type, retryCount },
              userId,
            });

            // EXECUTION AGENT
            nodeOutput = await executionAgent.executeNode(node, context, userId);

            // VALIDATION AGENT
            const validation = validationAgent.validate(node, nodeOutput);
            if (!validation.isValid) {
              const valErr = new Error(`Validation failed: ${validation.errors.join(', ')}`);
              valErr.code = 'MISSING_FIELDS';
              throw valErr;
            }

            await monitoringAgent.logEvent({
              executionId,
              workflowId,
              nodeId: node.id,
              agent: 'validation',
              level: 'success',
              message: `Node "${node.label || node.id}" outputs validated successfully.`,
              metadata: { outputKeys: Object.keys(nodeOutput) },
              userId,
            });

            context.outputs[node.id] = nodeOutput;
            nodeSuccess = true;
          } catch (stepErr) {
            // RECOVERY AGENT
            const recovery = recoveryAgent.recover(stepErr, retryCount);

            await monitoringAgent.logEvent({
              executionId,
              workflowId,
              nodeId: node.id,
              agent: 'recovery',
              level: recovery.action === 'escalate' ? 'error' : 'warning',
              message: `Failure on node "${node.label}": ${stepErr.message}. Strategy: ${recovery.action}.`,
              metadata: recovery,
              userId,
            });

            if (recovery.action === 'retry_with_backoff') {
              retryCount += 1;
              execution.retryCount += 1;
              await execution.save();
              // Backoff delay
              await new Promise((res) => setTimeout(res, recovery.backoffMs));
            } else {
              // Escalate / fail
              throw stepErr;
            }
          }
        }
      }

      // 4. Execution Completed Successfully
      execution.status = 'COMPLETED';
      execution.endTime = new Date();
      execution.duration = execution.endTime - execution.startTime;
      execution.outputs = context.outputs;
      await execution.save();

      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'success',
        message: `Workflow completed successfully in ${execution.duration}ms.`,
        metadata: { durationMs: execution.duration, status: 'COMPLETED' },
        userId,
      });

      return execution;
    } catch (err) {
      execution.status = 'FAILED';
      execution.endTime = new Date();
      execution.duration = execution.endTime - (execution.startTime || new Date());
      execution.error = err.message;
      await execution.save();

      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'monitoring',
        level: 'error',
        message: `Execution failed: ${err.message}`,
        metadata: { error: err.message, stack: err.stack },
        userId,
      });

      return execution;
    }
  }
}

module.exports = new Orchestrator();
