import { Router } from 'express';
import { Player } from '../models/Player';
import { getIo } from '../socket';
 
const router = Router();
 
function createPlayerId() {
  return `pl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
 
// GET /api/players
router.get('/', async (_req, res) => {
  try {
    const players = await Player.find()
      .sort({ lastName: 1, firstName: 1 })
      .lean();
 
    res.json(players);
  } catch (error) {
    console.error('GET /api/players failed', error);
    res.status(500).json({ message: 'Failed to fetch players' });
  }
});
 
// GET /api/players/:id
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findOne({ id: req.params.id }).lean();
 
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
 
    res.json(player);
  } catch (error) {
    console.error(`GET /api/players/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch player' });
  }
});
 
// POST /api/players
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth } = req.body as {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    };
 
    if (!firstName?.trim()) {
      return res.status(400).json({ message: 'First name is required' });
    }
 
    if (!lastName?.trim()) {
      return res.status(400).json({ message: 'Last name is required' });
    }
 
    const player = await Player.create({
      id: createPlayerId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth?.trim() || undefined,
    });

    const io = getIo();
    io.emit('playerCreated', player.toObject());
 
    res.status(201).json(player.toObject());
  } catch (error: any) {
    console.error('POST /api/players failed', error);
 
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate player id' });
    }
 
    res.status(500).json({ message: 'Failed to create player' });
  }
});
 
// PATCH /api/players/:id
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body as {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    };
 
    const update: Record<string, unknown> = {};
 
    if (changes.firstName !== undefined) {
      update.firstName = changes.firstName.trim();
    }
 
    if (changes.lastName !== undefined) {
      update.lastName = changes.lastName.trim();
    }
 
    if (changes.dateOfBirth !== undefined) {
      update.dateOfBirth = changes.dateOfBirth?.trim() || undefined;
    }
 
    const player = await Player.findOneAndUpdate(
      { id: req.params.id },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const io = getIo();
    io.emit('playerUpdated', player);
 
    res.json(player);
  } catch (error) {
    console.error(`PATCH /api/players/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update player' });
  }
});
 
// DELETE /api/players/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Player.findOneAndDelete({ id: req.params.id }).lean();
 
    if (!deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }
 
    const io = getIo();
    io.emit('playerDeleted', req.params.id);
 
    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    console.error(`DELETE /api/players/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete player' });
  }
});
 
export default router;