require('dotenv').config();

const http = require('http');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cors = require('cors');

const env = require('./src/config/env');
const { connectDB } = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { seedDemoUsers } = require('./src/services/authService');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const workflowRoutes = require('./src/routes/workflowRoutes');
const executionRoutes = require('./src/routes/executionRoutes');
const integrationRoutes = require('./src/routes/integrationRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const httpServer = http.createServer(app);

// ─── Security & Utility Middleware ────────────────────────
app.use(helmet());
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(compression());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────
const start = async () => {
  await connectDB();
  await seedDemoUsers();
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 Agentflow_AI server running on http://localhost:${env.PORT}`);
    console.log(`   Environment : ${env.NODE_ENV}`);
    console.log(`   Client URL  : ${env.CLIENT_URL}`);
  });
};

start();
