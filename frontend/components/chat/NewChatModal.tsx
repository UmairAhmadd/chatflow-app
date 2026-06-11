"use client";

import { useEffect, useState } from "react";
import { X, Search, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/lib/types";

const modalInput =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400 dark:border-border dark:bg-background dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-background";

export function NewChatModal({
  mode,
  onClose,
  onDmCreated,
  onGroupCreated,
}: {
  mode: "dm" | "group";
  onClose: () => void;
  onDmCreated: (conversation: any) => void;
  onGroupCreated: (group: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<string, User>>({});
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get(`/users?search=${encodeURIComponent(query)}`)
        .then(({ data }) => setUsers(data))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const startDm = async (userId: string) => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/chat/dm", { userId });
      onDmCreated(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (u: User) =>
    setSelected((s) => {
      const next = { ...s };
      if (next[u._id]) delete next[u._id];
      else next[u._id] = u;
      return next;
    });

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/groups", {
        name: groupName.trim(),
        members: Object.keys(selected),
      });
      onGroupCreated(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-border dark:bg-surface"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
              {mode === "group" ? "New group" : "New message"}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {mode === "group" && (
            <input
              className={cn(modalInput, "mb-3")}
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              className={cn(modalInput, "pl-9")}
              placeholder="Search people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            )}
            {!loading &&
              users.map((u) => {
                const isSelected = !!selected[u._id];
                return (
                  <button
                    key={u._id}
                    disabled={submitting}
                    onClick={() =>
                      mode === "group" ? toggle(u) : startDm(u._id)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-surfaceHover"
                  >
                    <Avatar src={u.avatar} name={u.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-gray-900 dark:text-zinc-100">{u.name}</p>
                      <p className="truncate text-xs text-gray-400 dark:text-zinc-500">{u.email}</p>
                    </div>
                    {mode === "group" && isSelected && (
                      <Check className="h-4 w-4 text-indigo-600" />
                    )}
                  </button>
                );
              })}
            {!loading && users.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400 dark:text-zinc-500">
                No users found.
              </p>
            )}
          </div>

          {mode === "group" && (
            <button
              onClick={createGroup}
              disabled={!groupName.trim() || submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create group ({Object.keys(selected).length} members)
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
