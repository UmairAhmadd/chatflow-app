import type { ChatRoom, Conversation, Group, User } from "./types";

// Build the normalized sidebar list from raw DM + group payloads.
export function buildRooms(
  dms: Conversation[],
  groups: Group[],
  currentUserId: string
): ChatRoom[] {
  const dmRooms: ChatRoom[] = dms.map((c) => {
    const other =
      c.participants.find((p) => p._id !== currentUserId) || c.participants[0];
    return {
      id: c._id,
      type: "dm",
      name: other?.name || "Unknown",
      avatar: other?.avatar,
      otherUserId: other?._id,
      lastMessage: c.lastMessage,
      unread: countUnread(c.lastMessage, currentUserId),
    };
  });

  const groupRooms: ChatRoom[] = groups.map((g) => ({
    id: g._id,
    type: "group",
    name: g.name,
    avatar: g.avatar,
    lastMessage: g.lastMessage,
    unread: countUnread(g.lastMessage, currentUserId),
  }));

  return [...dmRooms, ...groupRooms].sort((a, b) => {
    const at = a.lastMessage?.createdAt || "";
    const bt = b.lastMessage?.createdAt || "";
    return bt.localeCompare(at);
  });
}

function countUnread(lastMessage: any, currentUserId: string) {
  if (!lastMessage) return 0;
  const senderId =
    typeof lastMessage.sender === "string"
      ? lastMessage.sender
      : lastMessage.sender?._id;
  if (senderId === currentUserId) return 0;
  return lastMessage.readBy?.includes(currentUserId) ? 0 : 1;
}
