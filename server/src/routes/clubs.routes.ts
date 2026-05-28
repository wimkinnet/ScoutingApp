import { Router } from 'express';
import { Club } from '../models/Club';
 
const router = Router();
 
function createClubId() {
  return `cl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
 
// GET /api/clubs
router.get('/', async (_req, res) => {
  try {
    const clubs = await Club.find()
      .sort({ name: 1 })
      .lean();
 
    res.json(clubs);
  } catch (error) {
    console.error('GET /api/clubs failed', error);
    res.status(500).json({ message: 'Failed to fetch clubs' });
  }
});
 
// GET /api/clubs/:id
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findOne({ id: req.params.id }).lean();
 
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
 
    res.json(club);
  } catch (error) {
    console.error(`GET /api/clubs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch club' });
  }
});
 
// POST /api/clubs
router.post('/', async (req, res) => {
  try {
    const { name, registrationNumber } = req.body as {
      name?: string;
      registrationNumber?: string;
    };
 
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
 
    if (!registrationNumber?.trim()) {
      return res.status(400).json({ message: 'Registrationnumber is required' });
    }
 
    const club = await Club.create({
      id: createClubId(),
      name: name.trim(),
      registrationNumber: registrationNumber.trim(),
    });
 
    res.status(201).json(club.toObject());
  } catch (error: any) {
    console.error('POST /api/clubs failed', error);
 
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate club id' });
    }
 
    res.status(500).json({ message: 'Failed to create club' });
  }
});
 
// PATCH /api/clubs/:id
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body as {
      name?: string;
      registrationNumber?: string;
    };
 
    const update: Record<string, unknown> = {};
 
    if (changes.name !== undefined) {
      update.name = changes.name.trim();
    }
 
    if (changes.registrationNumber !== undefined) {
      update.registrationNumber = changes.registrationNumber.trim();
    }
 
    const club = await Club.findOneAndUpdate(
      { id: req.params.id },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();
 
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
 
    res.json(club);
  } catch (error) {
    console.error(`PATCH /api/clubs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update club' });
  }
});
 
// DELETE /api/clubs/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Club.findOneAndDelete({ id: req.params.id }).lean();
 
    if (!deleted) {
      return res.status(404).json({ message: 'Club not found' });
    }
 
    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    console.error(`DELETE /api/clubs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete club' });
  }
});
 
export default router;