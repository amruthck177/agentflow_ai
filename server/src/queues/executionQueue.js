const env = require('../config/env');
const Execution = require('../models/Execution');

let executionQueue = null;
let isRedisAvailable = false;

// Attempt BullMQ setup if REDIS_URL is provided
if (env.REDIS_URL) {
  try {
    const { Queue, Worker } = require('bullmq');
    const IORedis = require('ioredis');

    const connection = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    executionQueue = new Queue('workflow-executions', { connection });

    // Worker processing
    const worker = new Worker(
      'workflow-executions',
      async (job) => {
        const { executionId } = job.data;
        const orchestrator = require('../agents/orchestrator');
        return orchestrator.runExecution(executionId);
      },
      { connection, concurrency: 5 }
    );

    worker.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed for execution ${job.data.executionId}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job?.id} failed:`, err.message);
    });

    isRedisAvailable = true;
    console.log('✅ BullMQ Execution Queue initialised with Redis');
  } catch (err) {
    console.warn('⚠️  BullMQ/Redis connection failed, switching to in-memory queue runner:', err.message);
    isRedisAvailable = false;
  }
} else {
  console.log('ℹ️  REDIS_URL not configured — using in-memory execution runner');
}

/**
 * Enqueue a workflow run.
 * Creates an Execution document and dispatches to BullMQ or immediate asynchronous runner.
 */
const queueExecution = async (workflow, userId, inputs = {}) => {
  // 1. Create Execution document with immutable snapshot
  const execution = await Execution.create({
    workflowId: workflow._id,
    workflowSnapshot: {
      id: workflow._id,
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
      triggerConfig: workflow.triggerConfig,
      version: workflow.version,
    },
    owner: userId,
    status: 'PENDING',
    inputs,
  });

  // 2. Dispatch
  if (isRedisAvailable && executionQueue) {
    const job = await executionQueue.add(
      'run',
      { executionId: execution._id.toString() },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      }
    );
    execution.jobId = job.id;
    await execution.save();
  } else {
    // In-memory asynchronous execution fallback
    setImmediate(async () => {
      try {
        const orchestrator = require('../agents/orchestrator');
        await orchestrator.runExecution(execution._id.toString());
      } catch (err) {
        console.error(`In-memory execution error for ${execution._id}:`, err.message);
      }
    });
  }

  return execution;
};

module.exports = {
  queueExecution,
  isRedisAvailable: () => isRedisAvailable,
};
