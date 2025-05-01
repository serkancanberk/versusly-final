import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.cjs";
import { handleGoogleLogin } from "../controllers/authController.cjs";
import authenticateUser from "../middleware/authMiddleware.cjs";

const router = express.Router();
const client = new OAuth2Client();

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

export default router;
