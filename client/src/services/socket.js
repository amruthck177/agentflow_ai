import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Socket.IO disconnected');
    });
  }
  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s) {
    s.emit('leave:execution', executionId);
  }
};
