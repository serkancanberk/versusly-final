import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { email, name, picture, sub: googleId } = payload;
    console.log('Google token verified for user:', email);

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      console.log('Creating new user for:', email);
      user = new User({ googleId, email, name, picture });
      await user.save();
    } else {
      console.log('Found existing user:', email);
    }

    // Generate application JWT
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
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
      message: "User authenticated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(401).json({ message: "Authentication failed" });
  }
};