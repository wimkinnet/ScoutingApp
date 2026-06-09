import { Router } from 'express';
import { Season } from '../models/Season';
import { getIo } from '../socket';
 
const router = Router();
 
function createSeasonId() {
  return `se-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
 
// GET /api/seasons
router.get('/', async (_req, res) => {
  try {
    const seasons = await Season.find()
      .sort({ lastName: 1, firstName: 1 })
      .lean();
 
    res.json(seasons);
  } catch (error) {
    console.error('GET /api/seasons failed', error);
    res.status(500).json({ message: 'Failed to fetch seasons' });
  }
});
 
// GET /api/seasons/:id
router.get('/:id', async (req, res) => {
  try {
    const season = await Season.findOne({ id: req.params.id }).lean();
 
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }
 
    res.json(season);
  } catch (error) {
    console.error(`GET /api/seasons/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch season' });
  }
});
 
// POST /api/seasons
router.post('/', async (req, res) => {
  try {
    const { name } = req.body as {
      name: string;
    };
 
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
 
    const season = await Season.create({
      id: createSeasonId(),
      name: name.trim(),
    });

    const io = getIo();
    io.emit('seasonCreated', season.toObject());
 
    res.status(201).json(season.toObject());
  } catch (error: any) {
    console.error('POST /api/seasons failed', error);
 
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate season id' });
    }
 
    res.status(500).json({ message: 'Failed to create season' });
  }
});
 
// PATCH /api/seasons/:id
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body as {
      name?: string;
    };
 
    const update: Record<string, unknown> = {};
 
    if (changes.name !== undefined) {
      update.name = changes.name.trim();
    }
 
    const season = await Season.findOneAndUpdate(
      { id: req.params.id },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();
 
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    const io = getIo();
    io.emit('seasonUpdated', season);
 
    res.json(season);
  } catch (error) {
    console.error(`PATCH /api/seasons/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update season' });
  }
});
 
// DELETE /api/seasons/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Season.findOneAndDelete({ id: req.params.id }).lean();
 
    if (!deleted) {
      return res.status(404).json({ message: 'Season not found' });
    }
 
    const io = getIo();
    io.emit('seasonDeleted', req.params.id);
 
    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    console.error(`DELETE /api/seasons/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete season' });
  }
});
 
export default router;