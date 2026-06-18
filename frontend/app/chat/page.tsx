"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { buildRooms } from "@/lib/rooms";
import { type Category } from "@/lib/categories";
import { Sidebar } from "@/components/chat/Sidebar";
import { CategorySidebar } from "@/components/chat/CategorySidebar";
import { ConversationsPanel } from "@/components/chat/ConversationsPanel";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { InfoPanel } from "@/components/chat/InfoPanel";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "@/lib/types";

export default function ChatPage() {
  const [category, setCategory] = useState<Category>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"dm" | "group" | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  // Mobile: which left panel is showing when no chat is open.
  const [mobilePanel, setMobilePanel] = useState<"list" | "categories">("list");

  const currentUser = useChatStore((s) => s.currentUser);
  const rooms = useChatStore((s) => s.rooms);
  const setRooms = useChatStore((s) => s.setRooms);
  const setRoomsLoaded = useChatStore((s) => s.setRoomsLoaded);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  // Load all conversations once we know who we are.
  useEffect(() => {
    if (!currentUser?._id) return;
    api
      .get("/chat/conversations")
      .then(({ data }) => {
        setRooms(buildRooms(data.dms, data.groups, currentUser._id, data.unread));
      })
      .finally(() => setRoomsLoaded(true));
  }, [currentUser?._id, setRooms, setRoomsLoaded]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;

  const selectRoom = (room: ChatRoom) => {
    setActiveRoom(room.id);
    setRooms(rooms.map((r) => (r.id === room.id ? { ...r, unread: 0 } : r)));
  };

  const handleDmCreated = (conversation: any) => {
    if (!currentUser) return;
    const [room] = buildRooms([conversation], [], currentUser._id);
    if (!rooms.some((r) => r.id === room.id)) setRooms([room, ...rooms]);
    setActiveRoom(room.id);
  };

  const handleGroupCreated = (group: any) => {
    if (!currentUser) return;
    const [room] = buildRooms([], [group], currentUser._id);
    setRooms([room, ...rooms]);
    setActiveRoom(room.id);
  };

  // Mobile panel visibility (one panel at a time). Desktop shows all via lg:flex.
  const showCategories = !activeRoom && mobilePanel === "categories";
  const showList = !activeRoom && mobilePanel === "list";

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-gray-50 dark:bg-background">
      {/* Column 1 — icon navigation (70px) */}
      <Sidebar className={activeRoom ? "hidden lg:flex" : "flex"} />

      {/* Column 2 — categories sidebar (220px) */}
      <CategorySidebar
        category={category}
        onCategory={(c) => {
          setCategory(c);
          setMobilePanel("list");
        }}
        query={query}
        onQuery={setQuery}
        onSelect={selectRoom}
        onBack={() => setMobilePanel("list")}
        className={cn(showCategories ? "flex" : "hidden", "lg:flex")}
      />

      {/* Column 3 — conversations list (300px) */}
      <ConversationsPanel
        category={category}
        query={query}
        onSelect={selectRoom}
        onNew={(mode) => setModal(mode)}
        onOpenCategories={() => setMobilePanel("categories")}
        className={cn(showList ? "flex" : "hidden", "lg:flex")}
      />

      {/* Column 4 — main chat area */}
      <ChatWindow
        room={activeRoom}
        onBack={() => setActiveRoom(null)}
        onToggleInfo={() => setShowInfo((s) => !s)}
        onNewChat={() => setModal("dm")}
        className={activeRoom ? "flex" : "hidden lg:flex"}
      />

      {/* Collapsible right profile panel — desktop (xl) only */}
      <InfoPanel
        room={activeRoom}
        className={cn("hidden", showInfo && "xl:flex")}
      />

      {modal && (
        <NewChatModal
          mode={modal}
          onClose={() => setModal(null)}
          onDmCreated={handleDmCreated}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
