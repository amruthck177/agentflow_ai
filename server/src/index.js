import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import http from 'node:http';
import { Server } from 'socket.io';

import env from './config/env.js';
import { connectDatabase } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import authRoutes from './routes/authRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import executionRoutes from './routes/executionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please slow down.'
});

app.use('/api/auth', authLimiter);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'Agentflow_AI',
    mode: 'local-dev',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

await connectDatabase();

server.listen(env.PORT, () => {
  console.log(`Agentflow AI server listening on http://localhost:${env.PORT}`);
});
