"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessagesSquare, Loader2, Check } from "lucide-react";

const FEATURES = [
  "Real-time Messaging",
  "Team Channels",
  "File Sharing",
  "Online Presence",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/chat");
    }
  };

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
        Welcome back
      </h1>
      <p className="mt-1 text-xs text-muted lg:text-sm">
        Sign in to your account
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3 lg:mt-6 lg:space-y-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-400 lg:mb-1.5 lg:text-sm">
            Email
          </label>
          <input
            type="email"
            required
            className="input auth-input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-400 lg:mb-1.5 lg:text-sm">
            Password
          </label>
          <input
            type="password"
            required
            className="input auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-muted lg:my-6">
        <div className="h-px flex-1 bg-white/10" />
        OR
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/chat" })}
        className="btn-ghost h-12 w-full whitespace-nowrap border-white/10 text-sm hover:border-white/20 hover:bg-white/10 lg:h-auto"
      >
        <GoogleIcon /> Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Sign up
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

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
