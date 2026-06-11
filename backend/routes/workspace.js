import express from "express";
import crypto from "crypto";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "workspace";

// POST /api/workspace/create — create a workspace and join it as owner
router.post("/create", protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "Workspace name is required" });

    const slug = `${slugify(name)}-${crypto.randomBytes(2).toString("hex")}`;
    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const workspace = await Workspace.create({
      name: name.trim(),
      slug,
      owner: req.user._id,
      members: [req.user._id],
      inviteCode,
    });

    await User.findByIdAndUpdate(req.user._id, { workspace: workspace._id });

    res.status(201).json({ workspace });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/workspace/join — join an existing workspace via invite code
router.post("/join", protect, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || !inviteCode.trim())
      return res.status(400).json({ message: "Invite code is required" });

    const workspace = await Workspace.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });
    if (!workspace)
      return res.status(404).json({ message: "Invalid invite code" });

    await Workspace.findByIdAndUpdate(workspace._id, {
      $addToSet: { members: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, { workspace: workspace._id });

    res.json({ workspace });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workspace/members — users in the caller's workspace
router.get("/members", protect, async (req, res) => {
  try {
    if (!req.user.workspace) return res.json([]);
    const members = await User.find({ workspace: req.user.workspace })
      .select("-password")
      .limit(100);
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
