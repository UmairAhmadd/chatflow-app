"use client";

import { useEffect, useRef } from "react";
import { MessagesSquare, ArrowLeft, PanelRight, Plus } from "lucide-react";
import api from "@/lib/api";
import { currentSocket } from "@/lib/socket";
import { cn, timeAgo } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RoomActions } from "./RoomActions";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { ChatRoom, Message, User } from "@/lib/types";

export function ChatWindow({
  room,
  onBack,
  onToggleInfo,
  onNewChat,
  className,
}: {
  room: ChatRoom | null;
  onBack?: () => void;
  onToggleInfo?: () => void;
  onNewChat?: () => void;
  className?: string;
}) {
  const currentUser = useChatStore((s) => s.currentUser);
  const messages = useChatStore((s) => (room ? s.messages[room.id] : undefined));
  const setMessages = useChatStore((s) => s.setMessages);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const rooms = useChatStore((s) => s.rooms);
  const typingName = useChatStore((s) => (room ? s.typing[room.id] : null));
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineCount =
    onlineUserIds.size -
    (currentUser?._id && onlineUserIds.has(currentUser._id) ? 1 : 0);
  const hasConversations = rooms.some((r) => !!r.lastMessage);

  // Load history + join room + mark read whenever the active room changes.
  useEffect(() => {
    if (!room) return;
    const socket = currentSocket();
    socket?.emit("room:join", room.id);

    let cancelled = false;
    api.get(`/chat/messages/${room.id}`).then(({ data }) => {
      if (!cancelled) setMessages(room.id, data);
    });

    socket?.emit("message:read", { roomId: room.id });
    return () => {
      cancelled = true;
    };
  }, [room?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
    // Mark incoming messages as read while the room is open.
    if (room && messages?.length) {
      currentSocket()?.emit("message:read", { roomId: room.id });
    }
  }, [messages?.length, room?.id]);

  if (!room) {
    return (
      <div
        className={cn(
          "relative flex-1 flex-col items-center justify-center bg-gray-50 px-6 text-center dark:bg-[#161622]",
          className
        )}
      >
        <ThemeToggle className="absolute right-4 top-4" />
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
          <MessagesSquare className="h-8 w-8 text-indigo-500" />
        </div>

        {hasConversations ? (
          <>
            <h2 className="mt-4 text-lg font-medium text-gray-700 dark:text-zinc-300">
              Select a conversation
            </h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
              Choose a chat from the list to start messaging.
            </p>
          </>
        ) : (
          // No conversations yet → welcome screen.
          <>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-zinc-100">
              No conversations yet
            </h2>
            <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">
              Start chatting with your team.
            </p>
            <button
              onClick={onNewChat}
              className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:bg-indigo-600 hover:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            >
              <Plus className="h-4 w-4" /> New Conversation
            </button>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {onlineCount} {onlineCount === 1 ? "person" : "people"} online
            </p>
          </>
        )}
      </div>
    );
  }

  const online =
    room.type === "dm" && room.otherUserId
      ? onlineUserIds.has(room.otherUserId)
      : undefined;

  return (
    <div className={cn("flex-1 flex-col bg-gray-50 dark:bg-[#161622]", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-border dark:bg-[#161622] lg:px-5">
        {/* Back button — mobile only, returns to the chat list */}
        <button
          onClick={onBack}
          aria-label="Back"
          className="-ml-1 flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 dark:text-zinc-400 dark:hover:bg-surfaceHover dark:hover:text-zinc-100 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar
          src={room.avatar}
          name={room.name}
          size={40}
          online={online}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {room.name}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
            {room.type === "dm" && (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  online ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-600"
                )}
              />
            )}
            {room.type === "group"
              ? "Group chat"
              : online
              ? "Active now"
              : room.lastSeen
              ? `Last seen ${timeAgo(room.lastSeen)}`
              : "Offline"}
          </p>
        </div>

        {/* Room actions — favourite/archive/status/assign (all screen sizes) */}
        <RoomActions room={room} />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Toggle the right info panel (desktop) */}
        <button
          onClick={onToggleInfo}
          aria-label="Conversation info"
          title="Conversation info"
          className="hidden h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200 lg:flex"
        >
          <PanelRight className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4 lg:px-6">
        {(messages || []).map((m: Message, i: number) => {
          const senderId =
            typeof m.sender === "string" ? m.sender : m.sender._id;
          const mine = senderId === currentUser?._id;
          const prev = (messages || [])[i - 1];
          const prevSenderId = prev
            ? typeof prev.sender === "string"
              ? prev.sender
              : prev.sender._id
            : null;
          const showAvatar = prevSenderId !== senderId;
          // read by anyone other than me => blue ticks
          const otherReadCount = m.readBy.filter(
            (id) => id !== currentUser?._id
          ).length;
          return (
            <MessageBubble
              key={m._id}
              message={m}
              mine={mine}
              showAvatar={showAvatar}
              isGroup={room.type === "group"}
              otherReadCount={otherReadCount}
              delivered={room.type === "group" ? true : !!online}
            />
          );
        })}

        {typingName && (
          <div className="flex items-center gap-1 px-10 text-xs text-gray-400 dark:text-zinc-500">
            <span>{typingName} is typing</span>
            <span className="flex gap-0.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 dark:bg-zinc-500 [animation-delay:-0.2s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 dark:bg-zinc-500 [animation-delay:-0.1s]" />
              <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 dark:bg-zinc-500" />
            </span>
          </div>
        )}
      </div>

      <MessageInput room={room} />
    </div>
  );
}
