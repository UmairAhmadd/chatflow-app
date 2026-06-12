import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/chat/conversations — all DMs + groups for the sidebar list
router.get("/conversations", protect, async (req, res) => {
  try {
    // Users without a workspace have no conversations to show.
    if (!req.user.workspace)
      return res.json({ dms: [], groups: [], unread: {} });

    const dms = await Conversation.find({
      participants: req.user._id,
      workspace: req.user.workspace,
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .populate("assignedTo", "name avatar")
      .sort({ updatedAt: -1 });

    const groups = await Group.find({
      members: req.user._id,
      workspace: req.user.workspace,
    })
      .populate("lastMessage")
      .populate("assignedTo", "name avatar")
      .sort({ updatedAt: -1 });

    // Real per-room unread count: messages not sent by me and not yet read by me.
    const roomIds = [...dms.map((d) => d._id), ...groups.map((g) => g._id)];
    const agg = await Message.aggregate([
      {
        $match: {
          roomId: { $in: roomIds },
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        },
      },
      { $group: { _id: "$roomId", count: { $sum: 1 } } },
    ]);
    const unread = {};
    agg.forEach((a) => {
      unread[String(a._id)] = a.count;
    });

    res.json({ dms, groups, unread });
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
        workspace: req.user.workspace,
      });
      convo = await convo.populate("participants", "-password");
    }
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const modelFor = (roomType) => (roomType === "group" ? Group : Conversation);

// POST /api/chat/:roomId/favourite — toggle favourite for the current user
router.post("/:roomId/favourite", protect, async (req, res) => {
  try {
    const doc = await modelFor(req.body.roomType).findById(req.params.roomId);
    if (!doc) return res.status(404).json({ message: "Room not found" });
    const uid = String(req.user._id);
    const has = (doc.favouritedBy || []).some((id) => String(id) === uid);
    doc.favouritedBy = has
      ? doc.favouritedBy.filter((id) => String(id) !== uid)
      : [...(doc.favouritedBy || []), req.user._id];
    await doc.save();
    res.json({ favourite: !has });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/chat/:roomId/archive — toggle archived for the current user
router.post("/:roomId/archive", protect, async (req, res) => {
  try {
    const doc = await modelFor(req.body.roomType).findById(req.params.roomId);
    if (!doc) return res.status(404).json({ message: "Room not found" });
    const uid = String(req.user._id);
    const has = (doc.archivedBy || []).some((id) => String(id) === uid);
    doc.archivedBy = has
      ? doc.archivedBy.filter((id) => String(id) !== uid)
      : [...(doc.archivedBy || []), req.user._id];
    await doc.save();
    res.json({ archived: !has });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/chat/:roomId/status — set the shared status (open/assigned/closed)
router.put("/:roomId/status", protect, async (req, res) => {
  try {
    const { roomType, status } = req.body;
    if (!["open", "assigned", "closed"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const doc = await modelFor(roomType).findByIdAndUpdate(
      req.params.roomId,
      { status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Room not found" });
    res.json({ status: doc.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/chat/:roomId/assign — assign the room to a user (or null to clear)
router.put("/:roomId/assign", protect, async (req, res) => {
  try {
    const { roomType, userId } = req.body;
    const update = userId
      ? { assignedTo: userId, status: "assigned" }
      : { assignedTo: null, status: "open" };
    const doc = await modelFor(roomType)
      .findByIdAndUpdate(req.params.roomId, update, { new: true })
      .populate("assignedTo", "name avatar");
    if (!doc) return res.status(404).json({ message: "Room not found" });
    res.json({ assignedTo: doc.assignedTo, status: doc.status });
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
