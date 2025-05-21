import User from '../models/User.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

/**
 * Get the profile of the currently authenticated user
 * @route GET /api/user/profile
 * @access Private
 */
export const getUserProfile = async (req, res) => {
  try {
    // Debug log to check if user is authenticated
    logger.info('getUserProfile called with user:', {
      userId: req.user?.id,
      userEmail: req.user?.email
    });

    if (!req.user?.id) {
      logger.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find user by ID from the authenticated request
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      logger.warn(`User not found with ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Debug log the user data being sent
    logger.info('Sending user profile data:', {
      userId: user._id,
      hasFirstName: !!user.firstName,
      hasLastName: !!user.lastName,
      hasNickname: !!user.nickname,
      hasBio: !!user.bio,
      hasProfilePicture: !!user.profilePicture
    });

    // Return user profile data
    return res.status(200).json({
      success: true,
      data: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || null,
        email: user.email // Include email for debugging
      }
    });

  } catch (error) {
    logger.error('Error in getUserProfile:', {
      error: error.message,
      userId: req.user?.id,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the profile'
    });
  }
};

/**
 * Update the profile of the currently authenticated user
 * @route PATCH /api/user/profile
 * @access Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    // Debug log to check if user is authenticated
    logger.info('updateUserProfile called with user:', {
      userId: req.user?.id,
      userEmail: req.user?.email,
      updateData: req.body,
      hasFile: !!req.file
    });

    if (!req.user?.id) {
      logger.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Extract update fields from request body
    const { firstName, lastName, nickname, bio } = req.body;

    // Create update object with only provided fields
    const updateFields = {};
    if (nickname) {
      const existingUser = await User.findOne({ 
        nickname: nickname,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Nickname is already taken',
          field: 'nickname'
        });
      }
      updateFields.nickname = nickname;
    }
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if it exists
      const user = await User.findById(req.user.id);
      if (user.profilePicture) {
        const oldPicturePath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
    } else if (req.body.removeProfilePicture === 'true') {
      // Handle profile picture removal
      const user = await User.findById(req.user.id);
      if (user.profilePicture) {
        const oldPicturePath = path.join(process.cwd(), user.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      updateFields.profilePicture = null;
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        select: 'firstName lastName nickname bio profilePicture email'
      }
    ).select('-password');

    if (!updatedUser) {
      logger.warn(`User not found with ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Debug log the updated user data
    logger.info('User profile updated successfully:', {
      userId: updatedUser._id,
      hasFirstName: !!updatedUser.firstName,
      hasLastName: !!updatedUser.lastName,
      hasNickname: !!updatedUser.nickname,
      hasBio: !!updatedUser.bio,
      hasProfilePicture: !!updatedUser.profilePicture
    });

    // Return updated user data
    return res.status(200).json({
      success: true,
      data: {
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        nickname: updatedUser.nickname || '',
        bio: updatedUser.bio || '',
        profilePicture: updatedUser.profilePicture || null,
        email: updatedUser.email
      }
    });

  } catch (error) {
    logger.error('Error in updateUserProfile:', {
      error: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });

    // Handle multer errors
    if (error.name === 'MulterError') {
      if (error.code === 'LIMIT_FILE_SIZE' || error.message?.includes('File too large')) {
        return res.status(400).json({
          success: false,
          message: 'The profile picture must be smaller than 5MB.'
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        message: 'Validation error',
        errors 
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the profile'
    });
  }
};