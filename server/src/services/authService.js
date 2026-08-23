const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const env = require('../config/env');

const signToken = (userId) =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

/**
 * Seed default demo users and initial workflows if they don't exist
 */
const seedDemoUsers = async () => {
  try {
    let demoUser = await User.findOne({ email: 'demo@agentflow.ai' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Operator',
        email: 'demo@agentflow.ai',
        password: 'password123',
        role: 'operator',
      });
      console.log('👤 Seeded demo user: demo@agentflow.ai (password: password123)');
    }

    const existingAdmin = await User.findOne({ email: 'admin@agentflow.ai' });
    if (!existingAdmin) {
      await User.create({
        name: 'System Admin',
        email: 'admin@agentflow.ai',
        password: 'password123',
        role: 'admin',
      });
      console.log('👤 Seeded admin user: admin@agentflow.ai (password: password123)');
    }

    // Seed sample workflow for demo user
    const existingWf = await Workflow.findOne({ owner: demoUser._id });
    if (!existingWf) {
      await Workflow.create({
        name: 'Automated Invoice & Alert Pipeline',
        description: 'Multi-agent pipeline that parses customer invoices, validates transaction status, and routes alerts.',
        owner: demoUser._id,
        status: 'active',
        version: 1,
        nodes: [
          {
            id: 'node_1',
            type: 'trigger',
            label: 'Inbound Webhook Trigger',
            position: { x: 250, y: 50 },
            data: { event: 'invoice_created' },
          },
          {
            id: 'node_2',
            type: 'ai',
            label: 'Extract Invoice Details (AI)',
            position: { x: 250, y: 180 },
            data: { instruction: 'Extract invoice total, customer email, and line items' },
          },
          {
            id: 'node_3',
            type: 'action',
            label: 'Format Notification Message',
            position: { x: 250, y: 310 },
            data: { actionType: 'formatter', template: 'Invoice processed for ${customer}' },
          },
          {
            id: 'node_4',
            type: 'end',
            label: 'Execution Complete',
            position: { x: 250, y: 440 },
            data: { status: 'COMPLETED' },
          },
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e3-4', source: 'node_3', target: 'node_4', animated: true },
        ],
      });
      console.log('⚡ Seeded sample workflow for demo user');
    }
  } catch (e) {
    console.error('Demo seeding error:', e.message);
  }
};

/**
 * Register a new user.
 */
const register = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email: normalizedEmail, password });
  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};

/**
 * Log in an existing user.
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
    },
  };
};

/**
 * Get the current authenticated user's profile.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getProfile, seedDemoUsers };
