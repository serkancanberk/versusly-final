import express from 'express';
import {
  getReactionsForClash,
  postReaction,
  deleteReaction
} from '../controllers/reactionController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all reactions for a specific clash
router.get('/:clashId', authenticateUser, getReactionsForClash);

// Post a new reaction
router.post('/', postReaction);

// Delete a reaction
router.delete('/', deleteReaction);

export default router;
