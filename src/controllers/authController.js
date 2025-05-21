import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Enrich user data with Google profile information if fields are missing
 */
const enrichUserData = async (user, googleData) => {
  const { given_name: firstName, family_name: lastName } = googleData;
  let hasUpdates = false;
  const updates = {};

  // Check and update firstName if missing
  if (!user.firstName && firstName) {
    updates.firstName = firstName;
    hasUpdates = true;
  }

  // Check and update lastName if missing
  if (!user.lastName && lastName) {
    updates.lastName = lastName;
    hasUpdates = true;
  }

  // Check and update nickname if missing
  if (!user.nickname && firstName) {
    updates.nickname = await User.generateUniqueNickname(firstName, lastName);
    hasUpdates = true;
  }

  // Check and update profilePicture if missing
  if (!user.profilePicture && googleData.picture) {
    updates.profilePicture = googleData.picture;
    hasUpdates = true;
  }

  // Only update if there are changes
  if (hasUpdates) {
    console.log('Enriching user data with Google profile:', {
      userId: user._id,
      updates
    });
    
    // Update user with new data
    Object.assign(user, updates);
    await user.save();
    
    console.log('User data enriched successfully');
  }

  return user;
};

/**
 * Handle Google Sign-In, verify ID token, create or retrieve user, and issue JWT
 */
export const handleGoogleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      console.log('No token provided in request body');
      return res.status(400).json({ message: "ID token is required" });
    }

    console.log('Verifying Google ID token...');
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name: firstName, family_name: lastName, picture: profilePicture, sub: googleId } = payload;
    console.log('Google token verified for user:', email);

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      console.log('Creating new user for:', email);
      
      // Generate a unique nickname
      const nickname = await User.generateUniqueNickname(firstName, lastName);
      
      // Create new user with all required fields
      user = new User({
        googleId,
        email,
        firstName,
        lastName,
        nickname,
        profilePicture,
        bio: '' // Default empty bio
      });
      
      await user.save();
      console.log('New user created:', { email, nickname });
    } else {
      console.log('Found existing user:', email);
      // Enrich existing user data if needed
      user = await enrichUserData(user, payload);
    }

    // Generate application JWT
    const jwtToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie with JWT token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      path: '/',
    };

    // In development, don't set domain explicitly
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    console.log('Setting auth cookie with options:', cookieOptions);
    res.cookie('auth_token', jwtToken, cookieOptions);

    // Add CORS headers explicitly
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:5173');

    // Respond with user data (but no token in the response body)
    return res.status(200).json({
      success: true,
      message: "User authenticated",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed" 
    });
  }
};