import { Server } from 'socket.io';

let io: Server | null = null;

export const initSocket = (server: any) => {

  io = new Server(server, {
    cors: {
      origin: '*', // Adjust this in production to restrict origins
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('A client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket first.');
  }
  return io;
}