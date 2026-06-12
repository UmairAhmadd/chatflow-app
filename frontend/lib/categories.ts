import type { ChatRoom } from "./types";

// Conversation categories shown in the category sidebar (column 2).
export type Category = "all" | "assigned" | "favourites" | "groups" | "archived";

export function inCategory(
  room: ChatRoom,
  category: Category,
  currentUserId?: string
): boolean {
  // Archived rooms only show under the Archived category.
  if (category === "archived") return !!room.archived;
  if (room.archived) return false;

  switch (category) {
    case "all":
      return true;
    case "groups":
      return room.type === "group";
    case "assigned":
      // "Assigned" = assigned to me (per-person assignment).
      return !!room.assignedToId && room.assignedToId === currentUserId;
    case "favourites":
      return !!room.favourite;
    default:
      return false;
  }
}
