"use client";

import { useState } from "react";
import { Search, Plus, MessageSquarePlus, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatTime } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatRoom } from "@/lib/types";

export type Category = "all" | "new" | "assigned";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "new", label: "New" },
  { key: "all", label: "All" },
  { key: "assigned", label: "Assigned" },
];

export function ChatList({
  category,
  onCategory,
  onSelect,
  onNew,
  className,
}: {
  category: Category;
  onCategory: (c: Category) => void;
  onSelect: (room: ChatRoom) => void;
  onNew: (mode: "dm" | "group") => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);

  const filtered = rooms
    .filter((r) => {
      if (category === "new") return r.unread > 0;
      if (category === "assigned") return r.type === "group";
      return true;
    })
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className={cn(
        "w-full flex-col border-r border-gray-200 bg-white dark:border-border dark:bg-surface lg:w-[340px]",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Messages</h1>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-white transition hover:bg-green-600"
            title="New conversation"
            aria-label="New conversation"
          >
            <Plus className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-border dark:bg-surfaceHover dark:shadow-black/40">
                <button
                  onClick={() => {
                    onNew("dm");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surface"
                >
                  <MessageSquarePlus className="h-4 w-4" /> New message
                </button>
                <button
                  onClick={() => {
                    onNew("group");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surface"
                >
                  <UsersRound className="h-4 w-4" /> New group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-400 focus:bg-white focus:ring-1 focus:ring-green-400 dark:border-border dark:bg-background dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-background"
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => onCategory(c.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              category === c.key
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-surfaceHover dark:text-zinc-400 dark:hover:bg-border"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-20 lg:pb-2">
        {filtered.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-gray-400 dark:text-zinc-500">
            No conversations here.
          </p>
        )}
        {filtered.map((room) => {
          const online =
            room.type === "dm" && room.otherUserId
              ? onlineUserIds.has(room.otherUserId)
              : undefined;
          const isActive = room.id === activeRoomId;
          return (
            <motion.button
              key={room.id}
              layout
              onClick={() => onSelect(room)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition",
                isActive
                  ? "bg-green-50 dark:bg-green-500/10"
                  : "hover:bg-gray-50 dark:hover:bg-surfaceHover"
              )}
            >
              <Avatar
                src={room.avatar}
                name={room.name}
                size={46}
                online={online}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {room.name}
                  </span>
                  {room.lastMessage && (
                    <span className="shrink-0 text-[11px] text-gray-400 dark:text-zinc-500">
                      {formatTime(room.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {room.lastMessage
                      ? room.lastMessage.type === "text"
                        ? room.lastMessage.content
                        : `📎 ${room.lastMessage.type}`
                      : "No messages yet"}
                  </span>
                  {room.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-[11px] font-medium text-white">
                      {room.unread}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
