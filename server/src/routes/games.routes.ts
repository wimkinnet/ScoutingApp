import { Router } from 'express';
import { Game } from '../models/Game'

const router = Router();

// Helper to generate unique game IDs
function createGameId() {
  return `gm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// 1. GET /api/games - Fetch all games
router.get('/', async (_req, res) => {
  try {
    const games = await Game.find()
      .sort({ date: -1 }) // Show newest matches first
      .lean();

    res.json(games);
  } catch (error) {
    console.error('GET /api/games failed', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
});

// 2. GET /api/games/:id - Fetch a single game by its custom ID
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({ id: req.params.id }).lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error(`GET /api/games/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch game' });
  }
});

// 3. POST /api/games - Create a new game with players array
router.post('/', async (req, res) => {
  try {
    const { homeTeamId, awayTeamId, date, homePlayers, awayPlayers } = req.body;

    // Strict validation blocks
    if (!homeTeamId?.trim()) return res.status(400).json({ message: 'Home team ID is required' });
    if (!awayTeamId?.trim()) return res.status(400).json({ message: 'Away team ID is required' });
    if (!date?.trim()) return res.status(400).json({ message: 'Game date is required' });
    if (!Array.isArray(homePlayers)) return res.status(400).json({ message: 'homePlayers must be an array' });

    // Validate structure inside the array
    for (const player of homePlayers) {
      if (!player.playerId?.trim() || typeof player.shirtNumber !== 'number' || typeof player.homeTeam !== 'boolean') {
        return res.status(400).json({ 
          message: 'Invalid player record format. Each must have playerId, shirtNumber, and homeTeam status.' 
        });
      }
    }

    const game = await Game.create({
      id: createGameId(),
      homeTeamId: homeTeamId.trim(),
      awayTeamId: awayTeamId.trim(),
      date: date.trim(),
      homePlayers: homePlayers,
      awayPlayers: awayPlayers,
    });

    res.status(201).json(game.toObject());
  } catch (error: any) {
    console.error('POST /api/games failed', error);
    if (error?.code === 11000) return res.status(409).json({ message: 'Duplicate game id' });
    res.status(500).json({ message: 'Failed to create game' });
  }
});

// 4. PATCH /api/games/:id - Safely modify a match or player lineup
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body;
    const update: Record<string, any> = {};

    if (changes.homeTeamId !== undefined) update.homeTeamId = changes.homeTeamId.trim();
    if (changes.awayTeamId !== undefined) update.awayTeamId = changes.awayTeamId.trim();
    if (changes.date !== undefined) update.date = changes.date.trim();
    
    // Complete array replacement strategy for your lineups
    if (changes.homePlayers !== undefined) {
      if (!Array.isArray(changes.homePlayers)) {
        return res.status(400).json({ message: 'homePlayers must be a valid array' });
      }
      update.homePlayers = changes.homePlayers;
    }

    if (changes.awayPlayers !== undefined) {
      if (!Array.isArray(changes.awayPlayers)) {
        return res.status(400).json({ message: 'awayPlayers must be a valid array' });
      }
      update.awayPlayers = changes.awayPlayers;
    }

    const game = await Game.findOneAndUpdate(
      { id: req.params.id },
      { $set: update }, // Explicit atomic set to guarantee object and array synchronization
      { new: true, runValidators: true }
    ).lean();

    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
  } catch (error) {
    console.error(`PATCH /api/games/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update game' });
  }
});

// 5. DELETE /api/games/:id - Remove a game
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Game.findOneAndDelete({ id: req.params.id }).lean();

    if (!deleted) return res.status(404).json({ message: 'Game not found' });
    
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    console.error(`DELETE /api/games/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete game' });
  }
});

export default router;