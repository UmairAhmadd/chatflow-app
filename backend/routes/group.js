import express from "express";
import Group from "../models/Group.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/groups — create a group (creator is admin + member)
router.post("/", protect, async (req, res) => {
  try {
    const { name, avatar, members = [] } = req.body;
    if (!name) return res.status(400).json({ message: "Group name required" });

    const uniqueMembers = [
      ...new Set([req.user._id.toString(), ...members.map(String)]),
    ];

    const group = await Group.create({
      name,
      avatar: avatar || "",
      admin: req.user._id,
      members: uniqueMembers,
      workspace: req.user.workspace,
    });
    const populated = await group.populate("members", "-password");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/groups/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "-password")
      .populate("admin", "-password");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/groups/:id/members — add members (admin only)
router.put("/:id/members", protect, async (req, res) => {
  try {
    const { members = [] } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can add members" });

    const set = new Set(group.members.map(String));
    members.forEach((m) => set.add(String(m)));
    group.members = [...set];
    await group.save();
    res.json(await group.populate("members", "-password"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/groups/:id/members/:userId — remove a member (admin only)
router.delete("/:id/members/:userId", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only admin can remove members" });

    group.members = group.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await group.save();
    res.json(await group.populate("members", "-password"));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
