import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import playersRoutes from './routes/players.routes';
import clubsRoutes from './routes/clubs.routes';
import seasonsRoutes from './routes/seasons.routes';
import teamsRoutes from './routes/teams.routes';
import gamesRoutes from './routes/games.routes';
import logsRoutes from './routes/logs.routes';
 
dotenv.config();
 
const app = express();
const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scoutingapp';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
 
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
 
app.use(express.json());
 
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});
 
app.use('/api/players', playersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/logs', logsRoutes);

async function start() {
  // 1. Immediately start the server so Render detects the open port
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend v2 listening on port ${PORT}`);
  });

  // 2. Attempt the database connection asynchronously
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    // Optional: Close the server and crash if DB is strictly required
    server.close(() => process.exit(1));
  }
}
 
start();