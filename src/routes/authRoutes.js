import express from "express";
import User from "../models/User.js";
import { handleGoogleLogin } from "../controllers/authController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/google", handleGoogleLogin);

router.get("/protected", authenticateUser, (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  // Clear the auth cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ message: "Logged out successfully" });
});

router.get("/status", authenticateUser, (req, res) => {
  res.json({ isAuthenticated: true });
});

export default router;