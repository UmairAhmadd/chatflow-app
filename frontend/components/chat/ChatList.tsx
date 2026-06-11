"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MessageSquarePlus,
  UsersRound,
  Hash,
  AtSign,
  FileEdit,
  Paperclip,
  Inbox,
  MessagesSquare,
  UserCheck,
  Star,
  Handshake,
  CheckCircle2,
  Archive,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatTime } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatRoom } from "@/lib/types";

// Conversation categories. New/All/Assigned are backed by real room data;
// the rest are UI categories that filter to their (currently empty) sets until
// the backend grows fields for them — selecting them still works.
export type Category =
  | "new"
  | "all"
  | "assigned"
  | "favourites"
  | "negotiations"
  | "negotiations-urgent"
  | "negotiations-completed"
  | "closed"
  | "archives";

// Which rooms belong to a given category.
function inCategory(room: ChatRoom, category: Category): boolean {
  switch (category) {
    case "new":
      return room.unread > 0;
    case "assigned":
      return room.type === "group";
    case "all":
      return true;
    // No backend data yet (favourites/negotiations/closed/archives).
    default:
      return false;
  }
}

const NAV_LINKS = [
  { icon: Hash, label: "Channels" },
  { icon: FileEdit, label: "Drafts" },
  { icon: AtSign, label: "Mentions" },
  { icon: Paperclip, label: "Files & Media" },
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
  const [convoOpen, setConvoOpen] = useState(true);
  const [negOpen, setNegOpen] = useState(false);
  const rooms = useChatStore((s) => s.rooms);
  const activeRoomId = useChatStore((s) => s.activeRoomId);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);

  // Counts shown as badges. Only the data-backed categories can be non-zero.
  const counts = {
    new: rooms.filter((r) => r.unread > 0).length,
    all: rooms.length,
    assigned: rooms.filter((r) => r.type === "group").length,
    favourites: 0,
    negotiations: 0,
    closed: 0,
    archives: 0,
  };

  const filtered = rooms
    .filter((r) => inCategory(r, category))
    .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  // Unique DM partners → contacts row at the bottom.
  const seen = new Set<string>();
  const contacts = rooms.filter((r) => {
    if (r.type !== "dm" || !r.otherUserId || seen.has(r.otherUserId)) return false;
    seen.add(r.otherUserId);
    return true;
  });

  // A selectable category row with optional icon and count badge.
  const CategoryRow = ({
    cat,
    icon: Icon,
    label,
    count,
    indented,
  }: {
    cat: Category;
    icon?: any;
    label: string;
    count?: number;
    indented?: boolean;
  }) => {
    const selected = category === cat;
    return (
      <button
        onClick={() => onCategory(cat)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition",
          indented && "text-[13px]",
          selected
            ? "bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            : "text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surfaceHover"
        )}
      >
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0" />
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}
        <span className="flex-1 truncate text-left">{label}</span>
        {typeof count === "number" && (
          <span
            className={cn(
              "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium",
              selected
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 text-gray-500 dark:bg-surfaceHover dark:text-zinc-400"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "w-full flex-col border-r border-gray-200 bg-white dark:border-border dark:bg-surface lg:w-[340px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
          Messages
        </h1>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-600 lg:h-9 lg:w-9"
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
      <div className="shrink-0 px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400 dark:border-border dark:bg-background dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-background"
            placeholder="Search conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable body: nav links + categories + conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {/* Top navigation links */}
        <nav className="space-y-0.5 px-1">
          {NAV_LINKS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surfaceHover"
            >
              <Icon className="h-4 w-4 shrink-0 text-gray-400 dark:text-zinc-500" />
              <span className="truncate text-left">{label}</span>
            </button>
          ))}
        </nav>

        <div className="my-2 border-t border-gray-100 dark:border-border/70" />

        {/* Conversations section (collapsible) */}
        <button
          onClick={() => setConvoOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 transition hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <span>Conversations</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              !convoOpen && "-rotate-90"
            )}
          />
        </button>

        {convoOpen && (
          <div className="space-y-0.5 px-1">
            <CategoryRow cat="new" icon={Inbox} label="New" count={counts.new} />
            <CategoryRow
              cat="all"
              icon={MessagesSquare}
              label="All"
              count={counts.all}
            />
            <CategoryRow
              cat="assigned"
              icon={UserCheck}
              label="Assigned"
              count={counts.assigned}
            />
            <CategoryRow
              cat="favourites"
              icon={Star}
              label="Favourites"
              count={counts.favourites}
            />

            {/* Negotiations — collapsible with sub-categories */}
            <div>
              <button
                onClick={() => setNegOpen((o) => !o)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surfaceHover"
              >
                <Handshake className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">Negotiations</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-transform",
                    !negOpen && "-rotate-90"
                  )}
                />
              </button>
              {negOpen && (
                <div className="ml-[18px] space-y-0.5 border-l border-gray-100 pl-2 dark:border-border">
                  <CategoryRow cat="negotiations" label="All" indented />
                  <CategoryRow
                    cat="negotiations-urgent"
                    label="Urgent"
                    indented
                  />
                  <CategoryRow
                    cat="negotiations-completed"
                    label="Completed"
                    indented
                  />
                </div>
              )}
            </div>

            <CategoryRow
              cat="closed"
              icon={CheckCircle2}
              label="Closed"
              count={counts.closed}
            />
            <CategoryRow
              cat="archives"
              icon={Archive}
              label="Archives"
              count={counts.archives}
            />
          </div>
        )}

        <div className="my-2 border-t border-gray-100 dark:border-border/70" />

        {/* Conversation list (filtered by selected category) */}
        <div className="space-y-0.5 pb-2">
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
          })}
        </div>
      </div>

      {/* Contacts — pinned at the bottom. Clicking opens that DM. */}
      <div className="shrink-0 border-t border-gray-200 px-4 py-3 pb-20 dark:border-border lg:pb-3">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Contacts
        </span>
        {contacts.length === 0 ? (
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            No contacts yet
          </span>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {contacts.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelect(room)}
                title={room.name}
                aria-label={room.name}
                className="shrink-0 rounded-full ring-2 ring-transparent transition hover:ring-indigo-400"
              >
                <Avatar
                  src={room.avatar}
                  name={room.name}
                  size={38}
                  online={
                    room.otherUserId
                      ? onlineUserIds.has(room.otherUserId)
                      : undefined
                  }
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
