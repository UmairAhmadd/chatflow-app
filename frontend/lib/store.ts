import { create } from "zustand";
import type { ChatRoom, Message, User, Workspace } from "./types";

interface ChatState {
  currentUser: User | null;
  workspace: Workspace | null;
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>; // roomId -> messages
  onlineUserIds: Set<string>;
  typing: Record<string, string | null>; // roomId -> name of person typing

  setCurrentUser: (u: User | null) => void;
  setWorkspace: (w: Workspace | null) => void;
  setRooms: (rooms: ChatRoom[]) => void;
  updateRoom: (id: string, partial: Partial<ChatRoom>) => void;
  setActiveRoom: (id: string | null) => void;
  setMessages: (roomId: string, msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  setOnlineUsers: (ids: string[]) => void;
  userOnline: (id: string) => void;
  userOffline: (id: string) => void;
  setTyping: (roomId: string, name: string | null) => void;
  markRoomRead: (roomId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  workspace: null,
  rooms: [],
  activeRoomId: null,
  messages: {},
  onlineUserIds: new Set(),
  typing: {},

  setCurrentUser: (u) => set({ currentUser: u }),
  setWorkspace: (w) => set({ workspace: w }),
  setRooms: (rooms) => set({ rooms }),
  updateRoom: (id, partial) =>
    set((s) => ({
      rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...partial } : r)),
    })),
  setActiveRoom: (id) => set({ activeRoomId: id }),

  setMessages: (roomId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [roomId]: msgs } })),

  addMessage: (msg) =>
    set((s) => {
      const existing = s.messages[msg.roomId] || [];
      // de-dupe by id
      if (existing.some((m) => m._id === msg._id)) return s;
      const messages = { ...s.messages, [msg.roomId]: [...existing, msg] };

      // bump lastMessage + unread on the room list
      const rooms = s.rooms.map((r) => {
        if (r.id !== msg.roomId) return r;
        const isActive = s.activeRoomId === msg.roomId;
        const senderId =
          typeof msg.sender === "string" ? msg.sender : msg.sender._id;
        const fromMe = senderId === s.currentUser?._id;
        return {
          ...r,
          lastMessage: msg,
          unread: isActive || fromMe ? 0 : r.unread + 1,
        };
      });
      return { messages, rooms };
    }),

  setOnlineUsers: (ids) => set({ onlineUserIds: new Set(ids) }),
  userOnline: (id) =>
    set((s) => ({ onlineUserIds: new Set(s.onlineUserIds).add(id) })),
  userOffline: (id) =>
    set((s) => {
      const next = new Set(s.onlineUserIds);
      next.delete(id);
      return { onlineUserIds: next };
    }),

  setTyping: (roomId, name) =>
    set((s) => ({ typing: { ...s.typing, [roomId]: name } })),

  markRoomRead: (roomId, userId) =>
    set((s) => {
      const msgs = s.messages[roomId];
      if (!msgs) return s;
      const updated = msgs.map((m) =>
        m.readBy.includes(userId) ? m : { ...m, readBy: [...m.readBy, userId] }
      );
      return { messages: { ...s.messages, [roomId]: updated } };
    }),
}));
