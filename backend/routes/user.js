import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users?search=  — list/search users (for starting DMs, adding members)
router.get("/", protect, async (req, res) => {
  try {
    // Only surface users from the caller's own workspace.
    if (!req.user.workspace) return res.json([]);

    const { search = "" } = req.query;
    const filter = {
      _id: { $ne: req.user._id },
      workspace: req.user.workspace,
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }),
    };
    const users = await User.find(filter).select("-password").limit(30);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me — update profile (name, bio, avatar)
router.put("/me", protect, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
