"use client";

import { useState } from "react";
import {
  Search,
  Hash,
  AtSign,
  FileEdit,
  Paperclip,
  MessagesSquare,
  UserCheck,
  Star,
  UsersRound,
  Archive,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { type Category } from "@/lib/categories";
import type { ChatRoom } from "@/lib/types";

const NAV_LINKS = [
  { icon: Hash, label: "Channels" },
  { icon: FileEdit, label: "Drafts" },
  { icon: AtSign, label: "Mentions" },
  { icon: Paperclip, label: "Files & Media" },
];

const CATEGORIES: { cat: Category; icon: any; label: string }[] = [
  { cat: "all", icon: MessagesSquare, label: "All" },
  { cat: "assigned", icon: UserCheck, label: "Assigned" },
  { cat: "favourites", icon: Star, label: "Favourites" },
  { cat: "groups", icon: UsersRound, label: "Groups" },
  { cat: "archived", icon: Archive, label: "Archived" },
];

export function CategorySidebar({
  category,
  onCategory,
  query,
  onQuery,
  onSelect,
  onBack,
  className,
}: {
  category: Category;
  onCategory: (c: Category) => void;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (room: ChatRoom) => void;
  onBack?: () => void;
  className?: string;
}) {
  const rooms = useChatStore((s) => s.rooms);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const workspace = useChatStore((s) => s.workspace);
  const currentUser = useChatStore((s) => s.currentUser);
  const [copied, setCopied] = useState(false);

  const activeRooms = rooms.filter((r) => !!r.lastMessage);
  const visible = activeRooms.filter((r) => !r.archived);
  const counts: Record<Category, number> = {
    all: visible.length,
    assigned: visible.filter((r) => r.assignedToId === currentUser?._id).length,
    favourites: visible.filter((r) => r.favourite).length,
    groups: visible.filter((r) => r.type === "group").length,
    archived: activeRooms.filter((r) => r.archived).length,
  };

  const copyInvite = () => {
    if (!workspace?.inviteCode) return;
    navigator.clipboard?.writeText(workspace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Unique DM partners → contacts at the bottom.
  const seen = new Set<string>();
  const contacts = rooms.filter((r) => {
    if (r.type !== "dm" || !r.otherUserId || seen.has(r.otherUserId)) return false;
    seen.add(r.otherUserId);
    return true;
  });

  return (
    <div
      className={cn(
        "w-full flex-col border-r border-gray-200 bg-white dark:border-border dark:bg-[#111118] lg:w-[220px] lg:shrink-0",
        className
      )}
    >
      {/* Workspace header */}
      <div className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-4">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-surfaceHover lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-gray-900 dark:text-zinc-100">
            {workspace?.name || "ChatFlow"}
          </h1>
          <p className="truncate text-[11px] text-gray-400 dark:text-zinc-500">
            Workspace
          </p>
        </div>
      </div>

      {/* Invite code */}
      {workspace?.inviteCode && (
        <div className="mx-3 mb-2 shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-2 dark:border-border dark:bg-surfaceHover">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
            Invite code
          </p>
          <p className="truncate font-mono text-xs tracking-wider text-gray-900 dark:text-zinc-100">
            {workspace.inviteCode}
          </p>
          <button
            onClick={copyInvite}
            className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-md bg-indigo-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-indigo-600"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Invite Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="shrink-0 px-3 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400 dark:border-border dark:bg-background dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-background"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Nav links + categories */}
      <div className="flex-1 overflow-y-auto px-2">
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

        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Conversations
        </p>
        <div className="space-y-0.5 px-1">
          {CATEGORIES.map(({ cat, icon: Icon, label }) => {
            const selected = category === cat;
            const count = counts[cat];
            return (
              <button
                key={cat}
                onClick={() => onCategory(cat)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition",
                  selected
                    ? "bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-gray-600 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surfaceHover"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">{label}</span>
                {count > 0 && (
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
          })}
        </div>
      </div>

      {/* Contacts */}
      <div className="shrink-0 border-t border-gray-200 px-3 py-3 pb-20 dark:border-border lg:pb-3">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Contacts
        </span>
        {contacts.length === 0 ? (
          <button
            onClick={copyInvite}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-indigo-500 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-indigo-600"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied!
              </>
            ) : (
              "+ Invite teammates"
            )}
          </button>
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
                  size={36}
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
