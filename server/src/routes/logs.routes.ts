import { Router } from 'express';
import { Log } from '../models/Log';

const router = Router();

function createLogId() {
  return `lg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// GET /api/logs
router.get('/', async (_req, res) => {
  try {
    const logs = await Log.find()
      .sort({ gameId: 1 })
      .lean();

    res.json(logs);
  } catch (error) {
    console.error('GET /api/logs failed', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

// GET /api/logs/:id
router.get('/:id', async (req, res) => {
  try {
    const log = await Log.findOne({ id: req.params.id }).lean();

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error(`GET /api/logs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch log' });
  }
});

// POST /api/logs
router.post('/', async (req, res) => {
  try {
    const { gameId, actionId, playerId, positionX, positionY, quarter, secRem } = req.body as {
      gameId: string;
      actionId: string;
      playerId: string;
      positionX: number;
      positionY: number;
      quarter: number;
      secRem: number;
    };

    if (!gameId) {
      return res.status(400).json({ message: 'Game Id is required' });
    }

    if (!actionId) {
      return res.status(400).json({ message: 'Action Id is required' });
    }

    if (!playerId) {
      return res.status(400).json({ message: 'Player Id is required' });
    }

    if (positionX === undefined || positionX === null) return res.status(400).json({ message: 'position X is required' });
    if (positionY === undefined || positionY === null) return res.status(400).json({ message: 'position Y is required' });

    if (quarter === undefined || quarter === null) return res.status(400).json({ message: 'Quarter is required' });
    if (secRem === undefined || secRem === null) return res.status(400).json({ message: 'Seconds remaining is required' });

    const log = await Log.create({
      id: createLogId(),
      gameId: gameId,
      actionId: actionId,
      playerId: playerId,
      positionX: positionX,
      positionY: positionY,
      quarter: quarter,
      secRem: secRem, 
    });

    res.status(201).json(log.toObject());
  } catch (error: any) {
    console.error('POST /api/logs failed', error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Duplicate log id' });
    }

    res.status(500).json({ message: 'Failed to create log' });
  }
});

// PATCH /api/logs/:id
router.patch('/:id', async (req, res) => {
  try {
    const changes = req.body as {
      gameId: string;
      actionId: string;
      playerId: string;
      positionX: number;
      positionY: number;
      quarter: number;
      secRem: number;
    };

    const update: Record<string, unknown> = {};

    if (changes.gameId !== undefined) {
      update.gameId = changes.gameId.trim();
    }

    if (changes.actionId !== undefined) {
      update.actionId = changes.actionId.trim();
    }

    if (changes.playerId !== undefined) {
      update.playerId = changes.playerId.trim();
    }

    if (changes.positionX !== undefined) {
      update.positionX = changes.positionX;
    }

    if (changes.positionY !== undefined) {
      update.positionY = changes.positionY;
    }

    if (changes.quarter !== undefined) {
      update.quarter = changes.quarter;
    }

    if (changes.secRem !== undefined) {
      update.secRem = changes.secRem;
    }

    const log = await Log.findOneAndUpdate(
      { id: req.params.id },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error(`PATCH /api/logs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to update log' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Log.findOneAndDelete({ id: req.params.id }).lean();

    if (!deleted) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    console.error(`DELETE /api/logs/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to delete log' });
  }
});

export default router;