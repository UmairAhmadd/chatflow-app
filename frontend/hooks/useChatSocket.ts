"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useChatStore } from "@/lib/store";
import type { Message } from "@/lib/types";

/**
 * Central socket lifecycle: stores the backend JWT, connects the socket,
 * and wires server events into the Zustand store. Mount once (in the chat layout).
 */
export function useChatSocket() {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);

  const {
    setOnlineUsers,
    userOnline,
    userOffline,
    addMessage,
    setTyping,
    markRoomRead,
    currentUser,
  } = useChatStore();

  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (!token) return;

    // Make the token available to the axios client too.
    localStorage.setItem("chatflow_token", token);

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on("users:online", (ids: string[]) => setOnlineUsers(ids));
    socket.on("user:online", ({ userId }) => userOnline(userId));
    socket.on("user:offline", ({ userId }) => userOffline(userId));

    socket.on("message:new", (msg: Message) => addMessage(msg));

    socket.on("message:read", ({ roomId, userId }) =>
      markRoomRead(roomId, userId)
    );

    socket.on("typing:start", ({ roomId, name }) => setTyping(roomId, name));
    socket.on("typing:stop", ({ roomId }) => setTyping(roomId, null));

    return () => {
      socket.off("users:online");
      socket.off("user:online");
      socket.off("user:offline");
      socket.off("message:new");
      socket.off("message:read");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentUser?._id]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return socketRef;
}
