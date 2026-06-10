"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2, Check } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentUser = useChatStore((s) => s.currentUser);
  const setCurrentUser = useChatStore((s) => s.setCurrentUser);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Hydrate the form. Fetch /auth/me directly so a hard refresh works.
  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (!token) return;
    localStorage.setItem("chatflow_token", token);
    api.get("/auth/me").then(({ data }) => {
      setCurrentUser(data.user);
      setName(data.user.name || "");
      setBio(data.user.bio || "");
      setAvatar(data.user.avatar || "");
    });
  }, [session, setCurrentUser]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(data.url);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put("/users/me", { name, bio, avatar });
      setCurrentUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-6 py-10">
        <button
          onClick={() => router.push("/chat")}
          className="mb-8 flex items-center gap-2 text-sm text-muted hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-white">Your profile</h1>
          <p className="mt-1 text-sm text-muted">
            Update how teammates see you.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="relative">
              <Avatar src={avatar} name={name || currentUser?.name} size={80} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent text-white"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
              />
            </div>
            <div>
              <p className="font-medium text-zinc-100">
                {currentUser?.name}
              </p>
              <p className="text-sm text-muted">{currentUser?.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Bio</label>
              <textarea
                className="input min-h-24 resize-none"
                maxLength={200}
                placeholder="Tell your team a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-muted">
                {bio.length}/200
              </p>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved && <Check className="h-4 w-4" />}
              {saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
