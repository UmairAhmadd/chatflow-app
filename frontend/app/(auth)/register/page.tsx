"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessagesSquare, Loader2 } from "lucide-react";
import api from "@/lib/api";

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
      router.push("/chat");
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
    >
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <MessagesSquare className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">ChatFlow</span>
      </div>

      <h1 className="text-2xl font-semibold text-white">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Start chatting with your team</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Name</label>
          <input
            required
            className="input"
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={update("name")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Email</label>
          <input
            type="email"
            required
            className="input"
            placeholder="you@company.com"
            value={form.email}
            onChange={update("email")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-zinc-400">Password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={update("password")}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
