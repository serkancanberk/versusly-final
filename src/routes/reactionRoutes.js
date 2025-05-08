import express from 'express';
import {
  getReactionsForClash,
  postReaction,
  deleteReaction
} from '../controllers/reactionController.js';

const router = express.Router();

// Get all reactions for a specific clash
router.get('/:clashId', getReactionsForClash);

// Post a new reaction
router.post('/', postReaction);

// Delete a reaction
router.delete('/', deleteReaction);

export default router;
