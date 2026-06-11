"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, CheckCheck, FileText } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import type { Message, User } from "@/lib/types";

export function MessageBubble({
  message,
  mine,
  showAvatar,
  isGroup,
  otherReadCount,
}: {
  message: Message;
  mine: boolean;
  showAvatar: boolean;
  isGroup: boolean;
  otherReadCount: number;
}) {
  const sender = message.sender as User;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn("flex gap-2", mine ? "flex-row-reverse" : "flex-row")}
    >
      {!mine && (
        <div className="w-8">
          {showAvatar && (
            <Avatar src={sender?.avatar} name={sender?.name} size={32} />
          )}
        </div>
      )}

      <div className={cn("max-w-[68%]", mine && "items-end")}>
        {isGroup && !mine && showAvatar && (
          <span className="mb-0.5 block px-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {sender?.name}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm shadow-sm",
            mine
              ? "rounded-br-md bg-indigo-500 text-white"
              : "rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-border dark:bg-surfaceHover dark:text-zinc-200"
          )}
        >
          {message.type === "image" && message.fileUrl && (
            <Image
              src={message.fileUrl}
              alt="shared image"
              width={240}
              height={240}
              className="mb-1 rounded-lg object-cover"
            />
          )}
          {message.type === "file" && message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-1 flex items-center gap-2 underline-offset-2 hover:underline"
            >
              <FileText className="h-4 w-4" />
              {message.fileName || "Download file"}
            </a>
          )}
          {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
        </div>

        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 px-1 text-[10px] text-gray-400 dark:text-zinc-500",
            mine ? "justify-end" : "justify-start"
          )}
        >
          {formatTime(message.createdAt)}
          {mine &&
            (otherReadCount > 0 ? (
              <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
            ) : (
              <Check className="h-3.5 w-3.5 text-gray-400" />
            ))}
        </div>
      </div>
    </motion.div>
  );
}
