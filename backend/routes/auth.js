import express from "express";
import User from "../models/User.js";
import { generateToken, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  bio: u.bio,
  isOnline: u.isOnline,
  lastSeen: u.lastSeen,
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/oauth — upsert a Google user, return our JWT
router.post("/oauth", async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, avatar: avatar || "" });

    const token = generateToken(user._id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
