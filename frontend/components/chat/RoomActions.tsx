"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Star, Archive, Check } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { useRoomActions } from "@/lib/useRoomActions";
import type { ChatRoom, User } from "@/lib/types";

const STATUSES: ChatRoom["status"][] = ["open", "assigned", "closed"];

const row =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-surface";
const heading =
  "px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500";

export function RoomActions({ room }: { room: ChatRoom }) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const { toggleFavourite, toggleArchive, changeStatus, assign } =
    useRoomActions(room);

  // Lazy-load workspace members for the assignee list when the menu opens.
  useEffect(() => {
    if (open && members.length === 0) {
      api
        .get("/workspace/members")
        .then(({ data }) => setMembers(data))
        .catch(() => {});
    }
  }, [open, members.length]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Conversation actions"
        title="Conversation actions"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-40 mt-1 max-h-[70vh] w-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-border dark:bg-surfaceHover dark:shadow-black/40">
            <button onClick={toggleFavourite} className={row}>
              <Star
                className={cn(
                  "h-4 w-4 shrink-0",
                  room.favourite
                    ? "fill-indigo-500 text-indigo-500"
                    : "text-gray-400 dark:text-zinc-500"
                )}
              />
              <span className="flex-1 text-left">Favourite</span>
              {room.favourite && <Check className="h-4 w-4 text-indigo-500" />}
            </button>

            <button onClick={toggleArchive} className={row}>
              <Archive className="h-4 w-4 shrink-0 text-gray-400 dark:text-zinc-500" />
              <span className="flex-1 text-left">Archive</span>
              {room.archived && <Check className="h-4 w-4 text-indigo-500" />}
            </button>

            <div className="my-1 border-t border-gray-100 dark:border-border" />
            <p className={heading}>Status</p>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => changeStatus(s)} className={row}>
                <span className="flex-1 text-left capitalize">{s}</span>
                {room.status === s && (
                  <Check className="h-4 w-4 text-indigo-500" />
                )}
              </button>
            ))}

            <div className="my-1 border-t border-gray-100 dark:border-border" />
            <p className={heading}>Assign to</p>
            <button onClick={() => assign(null)} className={row}>
              <span className="flex-1 text-left text-gray-500 dark:text-zinc-400">
                Unassigned
              </span>
              {!room.assignedToId && (
                <Check className="h-4 w-4 text-indigo-500" />
              )}
            </button>
            {members.map((m) => (
              <button
                key={m._id}
                onClick={() => assign(m._id, m.name)}
                className={row}
              >
                <Avatar src={m.avatar} name={m.name} size={22} />
                <span className="flex-1 truncate text-left">{m.name}</span>
                {room.assignedToId === m._id && (
                  <Check className="h-4 w-4 shrink-0 text-indigo-500" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
