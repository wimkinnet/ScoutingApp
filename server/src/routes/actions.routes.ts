import { Router } from 'express';
import { Action } from '../models/Action';
 
const router = Router();
 
// GET /api/actions
router.get('/', async (_req, res) => {
  try {
    const actions = await Action.find()
      .sort({ name: 1 })
      .lean();
 
    res.json(actions);
  } catch (error) {
    console.error('GET /api/actions failed', error);
    res.status(500).json({ message: 'Failed to fetch actions' });
  }
});
 
// GET /api/actions/:id
router.get('/:id', async (req, res) => {
  try {
    const action = await Action.findOne({ id: req.params.id }).lean();
 
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }
 
    res.json(action);
  } catch (error) {
    console.error(`GET /api/actions/${req.params.id} failed`, error);
    res.status(500).json({ message: 'Failed to fetch action' });
  }
});
 
export default router;