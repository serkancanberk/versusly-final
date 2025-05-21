import express from 'express';
import authenticateUser from '../middleware/authMiddleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
const { upload, optimizeImage } = uploadMiddleware;

const router = express.Router();

// GET /api/user/profile - Get current user's profile
router.get('/profile', authenticateUser, getUserProfile);

// PATCH /api/user/profile - Update current user's profile
router.patch('/profile', 
  authenticateUser,
  upload.single('profilePicture'),
  optimizeImage,
  updateUserProfile
);

export default router;