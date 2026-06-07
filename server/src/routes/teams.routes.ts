import { Router } from 'express';
import { Team } from '../models/Team';
 
const router = Router();
 
function createTeamId() {
  return `te-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
 
// GET /api/teams
router.get('/', async (_req, res) => {
  try {
    const teams = await Team.find()
      .sort({ name: 1 })
      .lean();
 
    res.json(teams);
  } catch (error) {
    console.error('GET /api/teams failed', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});
 
// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findOne({ id: req.params.id }).lean();
 
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
 
    res.json(team);
  } catch (error) {
    console.error(`GET /api/teams/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch team' });
  }
});
 
// POST /api/teams
router.post('/', async (req, res) => {
  try {
    const { name, clubId, seasonId, playerIds } = req.body as {
      name?: string;
      clubId?: string;
      seasonId?: string;
      playerIds?: [string];
    };
 
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
 
    if (!clubId?.trim()) {
      return res.status(400).json({ message: 'Club is required' });
    }

    if (!seasonId?.trim()) {
      return res.status(400).json({ message: 'Season is required' });
    }
 
    const team = await Team.create({
      id: createTeamId(),
      name: name.trim(),
      clubId: clubId.trim(),
      seasonId: seasonId.trim(),
      playerIds: playerIds,
    });

 
    res.status(201).json(team.toObject());
  } catch (error: any) {
    console.error('POST /api/teams failed', error);
 
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate team id' });
    }
 
    res.status(500).json({ message: 'Failed to create team' });
  }
});
 
// PATCH /api/teams/:id
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body as {
      name?: string;
      clubId?: string;
      seasonId?: string;
      playerIds?: [string];
    };
 
    const update: Record<string, unknown> = {};
 
    if (changes.name !== undefined) {
      update.name = changes.name.trim();
    }
 
    if (changes.clubId !== undefined) {
      update.clubId = changes.clubId.trim();
    }

    if (changes.seasonId !== undefined) {
      update.seasonId = changes.seasonId.trim();
    }

    if (changes.playerIds !== undefined) {
      update.playerIds = changes.playerIds;
    }
 
    const team = await Team.findOneAndUpdate(
      { id: req.params.id },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();
 
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
 
    res.json(team);
  } catch (error) {
    console.error(`PATCH /api/teams/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update team' });
  }
});
 
// DELETE /api/teams/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Team.findOneAndDelete({ id: req.params.id }).lean();
 
    if (!deleted) {
      return res.status(404).json({ message: 'Team not found' });
    }
 
    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    console.error(`DELETE /api/teams/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
});
 
export default router;