"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Mail,
  FileText,
  ShieldOff,
  Calendar,
  Link2,
  Paperclip,
  CircleDot,
  Star,
  Archive,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { useRoomActions } from "@/lib/useRoomActions";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatRoom } from "@/lib/types";

function Toggle({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative h-5 w-9 rounded-full transition",
        on ? "bg-indigo-500" : "bg-gray-200 dark:bg-zinc-700"
      )}
      role="switch"
      aria-checked={on}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
          on ? "left-4" : "left-0.5"
        )}
      />
    </button>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: any;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="flex shrink-0 items-center gap-2 text-gray-500 dark:text-zinc-400">
        <Icon className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 max-w-[55%] truncate text-right font-medium text-gray-800 dark:text-zinc-200",
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function InfoPanel({
  room,
  className,
}: {
  room: ChatRoom | null;
  className?: string;
}) {
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const messages = useChatStore((s) => (room ? s.messages[room.id] : undefined));
  const workspace = useChatStore((s) => s.workspace);
  const rooms = useChatStore((s) => s.rooms);

  // Local-only notification preferences (cosmetic toggles).
  const [muted, setMuted] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const { toggleFavourite, toggleArchive, changeStatus } = useRoomActions(room);

  const copyInvite = () => {
    if (!workspace?.inviteCode) return;
    navigator.clipboard?.writeText(workspace.inviteCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 1500);
  };

  if (!room) {
    // Workspace overview when no conversation is selected.
    const memberCount = workspace?.memberCount ?? 0;
    const convCount = rooms.filter((r) => !!r.lastMessage).length;
    return (
      <aside
        className={cn(
          "w-[300px] flex-col overflow-y-auto border-l border-gray-200 bg-white px-5 py-6 dark:border-border dark:bg-surface",
          className
        )}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
          {workspace?.name || "Your workspace"}
        </h2>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Workspace Overview
        </p>

        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 dark:border-border dark:bg-surfaceHover dark:text-zinc-300">
            <span>👥</span>
            <span className="font-medium">{memberCount}</span>
            member{memberCount === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 dark:border-border dark:bg-surfaceHover dark:text-zinc-300">
            <span>💬</span>
            <span className="font-medium">{convCount}</span>
            conversation{convCount === 1 ? "" : "s"}
          </div>
        </div>

        <button
          onClick={copyInvite}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600"
        >
          {copiedInvite ? "✓ Invite code copied!" : "📨 Invite Teammates"}
        </button>

        <div className="mt-7">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
            📌 Quick Tips
          </h3>
          <ul className="space-y-2 text-xs text-gray-500 dark:text-zinc-400">
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span> Hit the + button to start
              a new message or group.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span> Share your invite code to
              add teammates.
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-500">•</span> Use the categories to
              filter your conversations.
            </li>
          </ul>
        </div>
      </aside>
    );
  }

  const online =
    room.type === "dm" && room.otherUserId
      ? onlineUserIds.has(room.otherUserId)
      : undefined;

  const lastContact = room.lastMessage?.createdAt;

  // Shared media pulled from the loaded message history (real data).
  const sharedImages = (messages || [])
    .filter((m) => m.type === "image" && m.fileUrl)
    .slice(-6)
    .reverse();

  // Counts derived from the loaded messages.
  const sharedFilesCount = (messages || []).filter(
    (m) => (m.type === "file" || m.type === "image") && m.fileUrl
  ).length;
  const urlRe = /(https?:\/\/[^\s]+)/i;
  const sharedLinksCount = (messages || []).filter(
    (m) => m.type === "text" && urlRe.test(m.content || "")
  ).length;
  const joined = room.joinedAt
    ? new Date(room.joinedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <aside
      className={cn(
        "w-[300px] flex-col overflow-y-auto border-l border-gray-200 bg-white dark:border-border dark:bg-surface",
        className
      )}
    >
      {/* Contact header */}
      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <Avatar
          src={room.avatar}
          name={room.name}
          size={88}
          online={online}
        />
        <h2 className="mt-3 text-base font-semibold text-gray-900 dark:text-zinc-100">
          {room.name}
        </h2>
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
            room.type === "group"
              ? "bg-gray-100 text-gray-500 dark:bg-surfaceHover dark:text-zinc-400"
              : online
              ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-surfaceHover dark:text-zinc-400"
          )}
        >
          {room.type === "dm" && (
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                online ? "bg-green-500" : "bg-gray-400 dark:bg-zinc-600"
              )}
            />
          )}
          {room.type === "group" ? "Group" : online ? "Active" : "Offline"}
        </span>
      </div>

      {/* Last contact */}
      <div className="mx-6 mt-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center dark:border-border dark:bg-surfaceHover">
        <p className="text-xs text-gray-400 dark:text-zinc-500">Last contact</p>
        <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-zinc-300">
          {lastContact ? formatTime(lastContact) : "—"}
        </p>
      </div>

      {/* Details */}
      <div className="mt-6 px-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Details
        </h3>
        <div className="space-y-2.5">
          {room.type === "dm" && room.otherEmail && (
            <Detail icon={Mail} label="Email" value={room.otherEmail} />
          )}
          <Detail
            icon={CircleDot}
            label="Status"
            value={
              room.type === "group" ? "Group" : online ? "Online" : "Offline"
            }
            valueClass={
              online ? "text-green-600 dark:text-green-400" : undefined
            }
          />
          {room.type === "dm" && joined && (
            <Detail icon={Calendar} label="Joined" value={joined} />
          )}
          <Detail
            icon={CircleDot}
            label="Assigned"
            value={room.assignedToName || "Unassigned"}
          />
          <Detail
            icon={Paperclip}
            label="Shared files"
            value={String(sharedFilesCount)}
          />
          <Detail
            icon={Link2}
            label="Shared links"
            value={String(sharedLinksCount)}
          />
        </div>
      </div>

      {/* Manage — favourite / archive / status */}
      <div className="mt-6 px-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Manage
        </h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <Star
                className={cn(
                  "h-4 w-4",
                  room.favourite
                    ? "fill-indigo-500 text-indigo-500"
                    : "text-gray-400 dark:text-zinc-500"
                )}
              />{" "}
              Favourite
            </span>
            <Toggle on={!!room.favourite} onClick={toggleFavourite} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <Archive className="h-4 w-4 text-gray-400 dark:text-zinc-500" />{" "}
              Archived
            </span>
            <Toggle on={!!room.archived} onClick={toggleArchive} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <CircleDot className="h-4 w-4 text-gray-400 dark:text-zinc-500" />{" "}
              Status
            </span>
            <select
              value={room.status || "open"}
              onChange={(e) => changeStatus(e.target.value as ChatRoom["status"])}
              className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-800 outline-none dark:border-border dark:bg-surfaceHover dark:text-zinc-200"
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications / settings */}
      <div className="mt-6 px-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Notifications
        </h3>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <Bell className="h-4 w-4 text-gray-400" /> Mute conversation
            </span>
            <Toggle on={muted} onClick={() => setMuted((m) => !m)} />
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <Mail className="h-4 w-4 text-gray-400" /> Email alerts
            </span>
            <Toggle
              on={emailNotifs}
              onClick={() => setEmailNotifs((e) => !e)}
            />
          </div>
        </div>
      </div>

      {/* Shared media */}
      <div className="mt-6 px-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Shared media
        </h3>
        {sharedImages.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-sm text-gray-400 dark:text-zinc-500">
            <FileText className="h-4 w-4" /> No shared media yet
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sharedImages.map((m) => (
              <a
                key={m._id}
                href={m.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 dark:border-border"
              >
                <Image
                  src={m.fileUrl!}
                  alt="shared"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* User settings */}
      <div className="mt-6 px-6 pb-8">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500">
          Settings
        </h3>
        <button className="flex w-full items-center gap-2 rounded-lg py-2 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10">
          <ShieldOff className="h-4 w-4" /> Block &amp; report
        </button>
      </div>
    </aside>
  );
}
