"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { useChatSocket } from "@/hooks/useChatSocket";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setCurrentUser = useChatStore((s) => s.setCurrentUser);
  const setWorkspace = useChatStore((s) => s.setWorkspace);

  // Establishes socket connection + wires events once authenticated.
  useChatSocket();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (!token) return;
    localStorage.setItem("chatflow_token", token);
    api.get("/auth/me").then(({ data }) => {
      // Users must belong to a workspace before entering the chat.
      if (!data.user.workspace) {
        router.replace("/workspace/create");
        return;
      }
      setCurrentUser(data.user);
      // Load workspace details (name + invite code) for the sidebar.
      api
        .get("/workspace/current")
        .then(({ data: ws }) => setWorkspace(ws))
        .catch(() => {});
    });
  }, [session, setCurrentUser, setWorkspace, router]);

  if (status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center bg-gray-50 dark:bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return <div className="h-dvh overflow-hidden bg-white dark:bg-background">{children}</div>;
}
