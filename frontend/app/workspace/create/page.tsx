"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessagesSquare,
  Loader2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

export default function CreateWorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // Ensure the backend token is in localStorage so api calls are authorized.
  useEffect(() => {
    const token = (session as any)?.backendToken;
    if (token) localStorage.setItem("chatflow_token", token);
  }, [session]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/workspace/create", { name });
      setInviteCode(data.workspace.inviteCode);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

        {!inviteCode ? (
          <>
            <h1 className="text-2xl font-semibold text-white">
              Create your workspace
            </h1>
            <p className="mt-1 text-sm text-muted">
              Set up a shared space for your team.
            </p>

            <form onSubmit={create} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-zinc-400">
                  Workspace name
                </label>
                <input
                  className="input"
                  required
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create workspace
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Have an invite code?{" "}
              <Link href="/workspace/join" className="text-accent hover:underline">
                Join a workspace
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white">
              Workspace ready 🎉
            </h1>
            <p className="mt-1 text-sm text-muted">
              Share this invite code with your team so they can join.
            </p>

            <div className="mt-8">
              <label className="mb-1.5 block text-sm text-zinc-400">
                Invite code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.2em] text-white">
                  {inviteCode}
                </div>
                <button
                  onClick={copy}
                  aria-label="Copy invite code"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-zinc-300 transition hover:bg-surfaceHover"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push("/chat")}
              className="btn-primary mt-8 w-full"
            >
              Continue to ChatFlow <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
