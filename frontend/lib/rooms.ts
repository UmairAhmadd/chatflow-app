import type { ChatRoom, Conversation, Group, User } from "./types";

// Build the normalized sidebar list from raw DM + group payloads.
export function buildRooms(
  dms: Conversation[],
  groups: Group[],
  currentUserId: string,
  unread?: Record<string, number>
): ChatRoom[] {
  // Prefer the backend's real unread count; fall back to a last-message guess.
  const unreadFor = (id: string, lastMessage: any) =>
    unread?.[id] ?? countUnread(lastMessage, currentUserId);

  const flags = (doc: any) => ({
    favourite: (doc.favouritedBy || []).some(
      (id: any) => String(id) === currentUserId
    ),
    archived: (doc.archivedBy || []).some(
      (id: any) => String(id) === currentUserId
    ),
    status: doc.status || "open",
    // assignedTo may be populated ({ _id, name }) or a raw id, or null.
    assignedToId: doc.assignedTo
      ? String(doc.assignedTo._id || doc.assignedTo)
      : undefined,
    assignedToName: doc.assignedTo?.name,
  });

  const dmRooms: ChatRoom[] = dms.map((c) => {
    const other =
      c.participants.find((p) => p._id !== currentUserId) || c.participants[0];
    return {
      id: c._id,
      type: "dm",
      name: other?.name || "Unknown",
      avatar: other?.avatar,
      otherUserId: other?._id,
      otherEmail: other?.email,
      // createdAt / lastSeen are on the populated user doc (not in the TS type).
      joinedAt: (other as any)?.createdAt,
      lastSeen: (other as any)?.lastSeen,
      ...flags(c),
      lastMessage: c.lastMessage,
      unread: unreadFor(c._id, c.lastMessage),
    };
  });

  const groupRooms: ChatRoom[] = groups.map((g) => ({
    id: g._id,
    type: "group",
    name: g.name,
    avatar: g.avatar,
    ...flags(g),
    lastMessage: g.lastMessage,
    unread: unreadFor(g._id, g.lastMessage),
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
