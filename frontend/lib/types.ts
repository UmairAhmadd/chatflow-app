export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  _id: string;
  sender: User | string;
  roomId: string;
  roomType: "dm" | "group";
  content: string;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  avatar?: string;
  admin: string | User;
  members: User[] | string[];
  lastMessage?: Message;
  updatedAt: string;
}

// A normalized item rendered in the chat list (DM or group).
export interface ChatRoom {
  id: string;
  type: "dm" | "group";
  name: string;
  avatar?: string;
  isOnline?: boolean;
  otherUserId?: string;
  otherEmail?: string; // DM only — the other participant's email
  joinedAt?: string; // DM only — the other participant's account creation date
  lastSeen?: string; // DM only — the other participant's last-seen timestamp
  lastMessage?: Message;
  unread: number;
}
