"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { buildRooms } from "@/lib/rooms";
import { Sidebar, type SidebarView } from "@/components/chat/Sidebar";
import { ChatList, type Category } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { InfoPanel } from "@/components/chat/InfoPanel";
import { NewChatModal } from "@/components/chat/NewChatModal";
import { cn } from "@/lib/utils";
import type { ChatRoom } from "@/lib/types";

export default function ChatPage() {
  const [view, setView] = useState<SidebarView>("inbox");
  const [category, setCategory] = useState<Category>("all");
  const [modal, setModal] = useState<"dm" | "group" | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const currentUser = useChatStore((s) => s.currentUser);
  const rooms = useChatStore((s) => s.rooms);
  const setRooms = useChatStore((s) => s.setRooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  // Load all conversations once we know who we are.
  useEffect(() => {
    if (!currentUser?._id) return;
    api.get("/chat/conversations").then(({ data }) => {
      setRooms(buildRooms(data.dms, data.groups, currentUser._id, data.unread));
    });
  }, [currentUser?._id, setRooms]);

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

  return (
    <div className="flex h-full bg-gray-50 dark:bg-background">
      {/* 1. Icon sidebar */}
      <Sidebar
        view={view}
        onView={setView}
        onContacts={() => setModal("dm")}
        className={activeRoom ? "hidden lg:flex" : ""}
      />

      {/* 2. Chat list */}
      <ChatList
        category={category}
        onCategory={setCategory}
        onSelect={selectRoom}
        onNew={(mode) => setModal(mode)}
        className={activeRoom ? "hidden lg:flex" : "flex"}
      />

      {/* 3. Chat window */}
      <ChatWindow
        room={activeRoom}
        onBack={() => setActiveRoom(null)}
        onToggleInfo={() => setShowInfo((s) => !s)}
        onNewChat={() => setModal("dm")}
        className={activeRoom ? "flex" : "hidden lg:flex"}
      />

      {/* 4. Right info panel — desktop (xl) only, toggleable */}
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
