"use client";

import { useRef, useState } from "react";
import { Send, Paperclip, Loader2, Smile } from "lucide-react";
import { currentSocket } from "@/lib/socket";
import api from "@/lib/api";
import type { ChatRoom } from "@/lib/types";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉", "🔥", "❤️", "😅", "😎", "🤝", "👏", "🚀", "💡", "✅", "😢"];

export function MessageInput({ room }: { room: ChatRoom }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const send = (payload: Partial<{ content: string; type: string; fileUrl: string; fileName: string }>) => {
    const socket = currentSocket();
    if (!socket) return;
    socket.emit("message:send", {
      roomId: room.id,
      roomType: room.type,
      content: payload.content || "",
      type: payload.type || "text",
      fileUrl: payload.fileUrl || "",
      fileName: payload.fileName || "",
    });
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    send({ content: trimmed, type: "text" });
    setText("");
    currentSocket()?.emit("typing:stop", { roomId: room.id });
  };

  const handleTyping = (value: string) => {
    setText(value);
    const socket = currentSocket();
    if (!socket) return;
    socket.emit("typing:start", { roomId: room.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { roomId: room.id });
    }, 1500);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      send({ type: data.type, fileUrl: data.url, fileName: data.fileName });
    } catch {
      // surfaced minimally; a toast system could go here
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addEmoji = (emoji: string) => {
    setText((t) => t + emoji);
    setEmojiOpen(false);
  };

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:border-border dark:bg-[#161622] lg:px-4">
      <div className="flex items-end gap-2">
        {/* Emoji */}
        <div className="relative">
          <button
            onClick={() => setEmojiOpen((o) => !o)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200"
            title="Emoji"
            aria-label="Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
          {emojiOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setEmojiOpen(false)}
              />
              <div className="absolute bottom-12 left-0 z-20 grid w-56 grid-cols-8 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-border dark:bg-surfaceHover dark:shadow-black/40">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => addEmoji(e)}
                    className="flex h-7 w-7 items-center justify-center rounded text-lg hover:bg-gray-100 dark:hover:bg-surface"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Attach */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200"
          title="Attach file"
          aria-label="Attach file"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFile}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
        />

        <textarea
          rows={1}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="max-h-32 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400 dark:border-border dark:bg-background dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:bg-background"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-600 disabled:opacity-40"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
