import express from 'express';
import { deleteArgument, createArgument, getArgumentsByClashId } from '../controllers/argumentController.js';
import authenticateUser from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getArgumentsByClashId);
router.post("/", authenticateUser, createArgument);
router.delete("/:id", authenticateUser, deleteArgument);

export default router; 