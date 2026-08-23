const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['trigger', 'action', 'condition', 'integration', 'ai', 'end'],
      required: true,
    },
    label: { type: String, required: true },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const edgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    label: { type: String },
    animated: { type: Boolean, default: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'draft',
    },
    triggerConfig: {
      type: { type: String, default: 'manual' },
      schedule: String,
      webhook: String,
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    version: {
      type: Number,
      default: 1,
    },
    tags: [{ type: String, trim: true }],
    generatedFromPrompt: { type: String },
  },
  { timestamps: true }
);

workflowSchema.index({ owner: 1, createdAt: -1 });
workflowSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
