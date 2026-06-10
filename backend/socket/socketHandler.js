import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Group from "../models/Group.js";

// Map<userId, Set<socketId>> — a user may have multiple tabs/devices.
const onlineUsers = new Map();

const addOnline = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};
const removeOnline = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return true; // user fully offline
  }
  return false;
};

export const initSocket = (io) => {
  // Authenticate every socket connection with the JWT.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.userId;
    addOnline(userId, socket.id);

    // Mark online in DB and broadcast presence.
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit("user:online", { userId });
    socket.emit("users:online", [...onlineUsers.keys()]);

    // room:join — client joins a DM/group room to receive its messages
    socket.on("room:join", (roomId) => {
      if (roomId) socket.join(String(roomId));
    });

    // message:send -> persist, update lastMessage, emit message:new to room
    socket.on("message:send", async (payload, ack) => {
      try {
        const { roomId, roomType, content, type, fileUrl, fileName } = payload;
        const message = await Message.create({
          sender: userId,
          roomId,
          roomType,
          content: content || "",
          type: type || "text",
          fileUrl: fileUrl || "",
          fileName: fileName || "",
          readBy: [userId],
        });

        if (roomType === "group") {
          await Group.findByIdAndUpdate(roomId, { lastMessage: message._id });
        } else {
          await Conversation.findByIdAndUpdate(roomId, {
            lastMessage: message._id,
          });
        }

        const populated = await message.populate("sender", "name avatar");
        io.to(String(roomId)).emit("message:new", populated);
        ack?.({ ok: true, message: populated });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    // message:read -> mark messages read by this user (blue tick)
    socket.on("message:read", async ({ roomId }) => {
      try {
        await Message.updateMany(
          { roomId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        io.to(String(roomId)).emit("message:read", { roomId, userId });
      } catch (err) {
        // swallow — read receipts are best-effort
      }
    });

    // typing indicators
    socket.on("typing:start", ({ roomId, name }) => {
      socket.to(String(roomId)).emit("typing:start", { roomId, userId, name });
    });
    socket.on("typing:stop", ({ roomId }) => {
      socket.to(String(roomId)).emit("typing:stop", { roomId, userId });
    });

    socket.on("disconnect", async () => {
      const fullyOffline = removeOnline(userId, socket.id);
      if (fullyOffline) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit("user:offline", { userId });
      }
    });
  });
};
