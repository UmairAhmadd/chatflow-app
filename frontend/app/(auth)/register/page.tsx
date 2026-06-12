"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessagesSquare, Loader2, Check } from "lucide-react";
import api from "@/lib/api";

const FEATURES = [
  "Real-time Messaging",
  "Team Channels",
  "File Sharing",
  "Online Presence",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      // Registered — now sign in to establish the NextAuth session.
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) throw new Error();
      // New users set up (or join) a workspace before entering the app.
      router.push("/workspace/create");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Could not create account. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_50px_rgba(0,0,0,0.5)] backdrop-blur-[20px] sm:p-8"
    >
      {/* Branding */}
      <div className="mb-4 lg:mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <MessagesSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">ChatFlow</span>
        </div>
        <p className="mt-2 text-[11px] text-muted lg:text-sm">
          Built for modern teams
        </p>
      </div>

      {/* Social proof */}
      <ul className="mb-4 grid grid-cols-1 gap-x-3 gap-y-1.5 text-[10px] text-zinc-400 lg:mb-6 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-2 lg:text-xs">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-1 whitespace-nowrap lg:gap-1.5">
            <Check className="h-3 w-3 shrink-0 text-accent lg:h-3.5 lg:w-3.5" />
            {f}
          </li>
        ))}
      </ul>

      <h1 className="text-[20px] font-semibold text-white lg:text-2xl">
        Create your account
      </h1>
      <p className="mt-1 text-xs text-muted lg:text-sm">
        Start chatting with your team
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 lg:mt-6 lg:space-y-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-400 lg:mb-1.5 lg:text-sm">
            Name
          </label>
          <input
            required
            className="input auth-input"
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={update("name")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400 lg:mb-1.5 lg:text-sm">
            Email
          </label>
          <input
            type="email"
            required
            className="input auth-input"
            placeholder="you@company.com"
            value={form.email}
            onChange={update("email")}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400 lg:mb-1.5 lg:text-sm">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="input auth-input"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={update("password")}
          />
        </div>

        {error && <p className="text-xs text-red-400 lg:text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary h-10 w-full text-[13px] lg:h-auto lg:text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>

      {/* Footer */}
      <p className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-muted">
        © 2026 ChatFlow ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Privacy Policy
        </a>{" "}
        ·{" "}
        <a href="#" className="hover:text-zinc-300">
          Terms
        </a>
      </p>
    </motion.div>
  );
}
