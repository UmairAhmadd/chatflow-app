"use client";

import dynamic from "next/dynamic";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

// Glassmorphism floating cards around the robot. Smaller on mobile, full on lg.
const cardClass =
  "pointer-events-none absolute z-10 block animate-float whitespace-nowrap rounded-lg border border-white/15 bg-white/[0.08] px-2 py-1 text-[10px] text-white backdrop-blur-[10px] lg:rounded-xl lg:px-[14px] lg:py-2 lg:text-xs";

// Lazy-load the heavy Spline 3D scene on the client only (no SSR). The dynamic
// `loading` fallback shows a dark placeholder while the bundle downloads — this
// keeps the auth page fast to first paint, especially on mobile.
const SplineScene = dynamic(
  () =>
    import("@/components/ui/splite").then((m) => ({ default: m.SplineScene })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-transparent">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    ),
  }
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Side-by-side at all widths (no stacking, no horizontal scroll).
    // Mobile: form 45% / robot 55%. Desktop: 50/50 via lg:flex-1.
    <div className="flex min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#0f172a,#020617)]">
      {/* Left: compact login card on mobile (45% wide, scaled down). */}
      <div className="flex w-[45%] shrink-0 max-w-full flex-col items-center justify-start px-2 py-4 lg:w-auto lg:flex-1 lg:justify-center lg:px-6 lg:py-12">
        <div className="w-full max-w-[380px] scale-[0.85] lg:scale-100">
          {children}
        </div>
      </div>

      {/* Right: robot/hero — 55% wide on mobile */}
      <div className="flex w-[55%] shrink-0 max-w-full flex-col items-center overflow-hidden pt-4 lg:w-auto lg:flex-1 lg:pt-0">
        {/* Heading */}
        <div className="px-4 pt-0 text-center lg:px-10 lg:pt-10">
          <h2 className="mb-1 text-base font-semibold text-white lg:mb-2 lg:text-2xl">
            Chat that keeps your team in flow.
          </h2>
          <p className="text-xs text-[#555] lg:text-sm">
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot: shorter on mobile, fits its container (overflow hidden).
            Scale the scene down on mobile so it isn't cut off; full on desktop. */}
        <div className="relative mx-auto mt-0 h-[300px] w-[200px] max-w-full overflow-hidden lg:mt-4 lg:h-[480px] lg:w-full">
          <SplineScene
            scene={SCENE_URL}
            className="h-full w-full scale-[0.95] lg:scale-100"
          />

          {/* Floating activity cards — icon + short text on mobile, full on lg */}
          <div className={cardClass} style={{ top: "12%", left: "6%", animationDelay: "0s" }}>
            💬<span className="hidden lg:inline"> New Message</span>
            <span className="lg:hidden"> New</span>
          </div>
          <div className={cardClass} style={{ top: "12%", right: "6%", animationDelay: "0.8s" }}>
            👥<span className="hidden lg:inline"> 5 Members Online</span>
            <span className="lg:hidden"> 5</span>
          </div>
          <div className={cardClass} style={{ bottom: "12%", left: "6%", animationDelay: "1.6s" }}>
            📎<span className="hidden lg:inline"> File Shared</span>
            <span className="lg:hidden"> File</span>
          </div>
          <div className={cardClass} style={{ bottom: "12%", right: "6%", animationDelay: "2.4s" }}>
            🔔<span className="hidden lg:inline"> 3 Notifications</span>
            <span className="lg:hidden"> 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}