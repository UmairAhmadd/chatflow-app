"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessagesSquare, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function JoinWorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Ensure the backend token is in localStorage so api calls are authorized.
  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (token) localStorage.setItem("chatflow_token", token);
  }, [session]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/workspace/join", { inviteCode: code.trim() });
      router.push("/chat");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not join workspace.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <MessagesSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ChatFlow</span>
        </div>

        <h1 className="text-2xl font-semibold text-white">Join a workspace</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the invite code your teammate shared with you.
        </p>

        <form onSubmit={join} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-zinc-400">
              Invite code
            </label>
            <input
              className="input text-center font-mono tracking-[0.2em] uppercase"
              required
              placeholder="A1B2C3D4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Join workspace
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have a code?{" "}
          <Link href="/workspace/create" className="text-accent hover:underline">
            Create a workspace
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
