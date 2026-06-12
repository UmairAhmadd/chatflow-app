"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/lib/types";

export default function TeamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const workspace = useChatStore((s) => s.workspace);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (!token) return;
    localStorage.setItem("chatflow_token", token);
    api
      .get("/workspace/members")
      .then(({ data }) => setMembers(data))
      .finally(() => setLoading(false));
  }, [session]);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <button
          onClick={() => router.push("/chat")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Team members
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {workspace?.name ? `${workspace.name} · ` : ""}
          {members.length} member{members.length === 1 ? "" : "s"}
        </p>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-border dark:bg-surface dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-border dark:border-border dark:bg-surface">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400 dark:text-zinc-500">
              No members found.
            </p>
          ) : (
            filtered.map((m) => (
              <div key={m._id} className="flex items-center gap-3 px-4 py-3">
                <Avatar
                  src={m.avatar}
                  name={m.name}
                  size={42}
                  online={m.isOnline}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {m.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {m.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    m.isOnline
                      ? "text-green-500"
                      : "text-gray-400 dark:text-zinc-500"
                  )}
                >
                  {m.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
