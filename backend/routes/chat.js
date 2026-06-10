import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chat/conversations — all DMs + groups for the sidebar list
router.get("/conversations", protect, async (req, res) => {
  try {
    const dms = await Conversation.find({ participants: req.user._id })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const groups = await Group.find({ members: req.user._id })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.json({ dms, groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat/dm — find or create a DM with another user
router.post("/dm", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    let convo = await Conversation.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "-password");

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, userId],
      });
      convo = await convo.populate("participants", "-password");
    }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/messages/:roomId — message history for a room
router.get("/messages/:roomId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
