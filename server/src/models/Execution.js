const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    // Immutable snapshot of the workflow at runtime
    workflowSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'],
      default: 'PENDING',
    },
    currentNode: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // milliseconds
    inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    jobId: { type: String }, // BullMQ job ID
    agentMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

executionSchema.index({ workflowId: 1, createdAt: -1 });
executionSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Execution', executionSchema);
