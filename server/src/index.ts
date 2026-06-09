import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import playersRoutes from './routes/players.routes';
import clubsRoutes from './routes/clubs.routes';
import seasonsRoutes from './routes/seasons.routes';
import teamsRoutes from './routes/teams.routes';
import gamesRoutes from './routes/games.routes';
import logsRoutes from './routes/logs.routes';
import actionsRoutes from './routes/actions.routes';
import { initSocket } from './socket';
 
dotenv.config();
 
const app = express();
// 1. Let Express handle the string port naturally (don't convert to a Number)
const PORT = process.env.PORT || '4000'; 
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scoutingapp';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
 
const allowedOrigins = CLIENT_ORIGIN.split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
 
app.use(express.json());
 
const server = http.createServer(app);

initSocket(server);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
 
app.use('/api/players', playersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/actions', actionsRoutes);

async function start() {
  try {
    // 2. Start listening IMMEDIATELY on 0.0.0.0 so Render detects the open port
    server.listen(parseInt(PORT, 10), '0.0.0.0', () => {
      console.log(`Server successfully listening on host 0.0.0.0, port ${PORT}`);
    });

    // 3. Connect to MongoDB in the background without blocking the port open check
    mongoose.connect(MONGO_URI)
      .then(() => console.log('MongoDB connected successfully'))
      .catch((err) => console.error('MongoDB connection deferred error:', err));

  } catch (error) {
    console.error('Fatal error during startup sequence:', error);
    process.exit(1);
  }
}

start();