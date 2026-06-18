"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Menu,
  MessageSquarePlus,
  UsersRound,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { inCategory, type Category } from "@/lib/categories";
import type { ChatRoom } from "@/lib/types";

const LABELS: Record<Category, string> = {
  all: "All conversations",
  assigned: "Assigned",
  favourites: "Favourites",
  groups: "Groups",
  archived: "Archived",
};

export function ConversationsPanel({
  category,
  query,
  onSelect,
  onNew,
  onOpenCategories,
  className,
}: {
  category: Category;
  query: string;
  onSelect: (room: ChatRoom) => void;
  onNew: (mode: "dm" | "group") => void;
  onOpenCategories?: () => void;
  className?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rooms = useChatStore((s) => s.rooms);
  const roomsLoaded = useChatStore((s) => s.roomsLoaded);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const currentUser = useChatStore((s) => s.currentUser);

  const filtered = rooms
    .filter((r) => !!r.lastMessage)
    .filter((r) => inCategory(r, category, currentUser?._id))
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className={cn(
        "w-full min-h-0 flex-col border-r border-gray-200 bg-white dark:border-border dark:bg-[#111118] lg:w-[24%] lg:min-w-[240px] lg:shrink-0",
        className
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-border">
        <button
          onClick={onOpenCategories}
          aria-label="Categories"
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-surfaceHover lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
          {LABELS[category]}
        </h2>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-600 hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
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

      {/* List */}
      <div className="flex-1 min-h-0 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-2 pb-20 lg:pb-2">
        {!roomsLoaded ? (
          // Skeletons only while the conversation list is loading.
          <div className="space-y-1 px-1 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-3 rounded-xl px-2.5 py-2.5"
              >
                <div className="h-[46px] w-[46px] shrink-0 rounded-full bg-gray-200 dark:bg-surfaceHover" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-surfaceHover" />
                  <div className="h-2.5 w-3/4 rounded bg-gray-100 dark:bg-border" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Loaded but empty → Getting Started checklist.
          <div className="px-3 py-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
              Getting Started
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span> Create first conversation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span> Invite teammates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-500">✓</span> Share files
              </li>
            </ul>
          </div>
        ) : (
          filtered.map((room) => {
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
                    ? "bg-indigo-50 dark:bg-indigo-500/10"
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
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1.5 text-[11px] font-medium text-white">
                        {room.unread}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}
