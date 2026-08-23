const { Server } = require('socket.io');
const env = require('./env');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join a specific execution room to receive live events
    socket.on('join:execution', (executionId) => {
      socket.join(`execution:${executionId}`);
      console.log(`Socket ${socket.id} joined execution:${executionId}`);
    });

    socket.on('leave:execution', (executionId) => {
      socket.leave(`execution:${executionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialised');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised. Call initSocket(httpServer) first.');
  return io;
};

/**
 * Broadcast an agent event to all clients subscribed to a given execution.
 * @param {string} executionId
 * @param {string} event  - e.g. 'agent:planner', 'agent:execution', 'agent:validation', 'agent:recovery', 'agent:monitoring'
 * @param {object} payload
 */
const emitExecutionEvent = (executionId, event, payload) => {
  if (!io) return;
  io.to(`execution:${executionId}`).emit(event, payload);
};

module.exports = { initSocket, getIO, emitExecutionEvent };
