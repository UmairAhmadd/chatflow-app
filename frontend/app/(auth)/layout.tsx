"use client";

import dynamic from "next/dynamic";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

// Glassmorphism floating cards around the robot. Shown on all sizes.
// Outer wrapper holds position + scale (scale lives here, not on the animated
// element, because the float keyframe overrides `transform`). Inner floats.
const cardWrap = "pointer-events-none absolute z-10 scale-[0.65] lg:scale-100";
const cardInner =
  "animate-float whitespace-nowrap rounded-xl border border-white/15 bg-white/[0.08] px-2 py-1 text-xs text-white backdrop-blur-[10px] lg:px-[14px] lg:py-2";

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
    // Mobile: vertical stack (hero + robot on top, card below).
    // Desktop: side-by-side (form left, robot right) via lg:flex-row.
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[linear-gradient(180deg,#0f172a,#020617)] lg:flex-row">
      {/* Hero + robot — top on mobile (order-1), right column on desktop (order-2) */}
      <div className="order-1 flex w-full flex-col items-center overflow-hidden pt-8 lg:order-2 lg:w-auto lg:flex-1 lg:pt-0">
        {/* Heading */}
        <div className="px-6 text-center lg:px-10 lg:pt-10">
          <h2 className="mb-1 text-lg font-semibold text-white lg:mb-2 lg:text-2xl">
            Chat that keeps your team in flow.
          </h2>
          <p className="text-xs text-[#555] lg:text-sm">
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot: small + visible on mobile (190px), full on desktop. */}
        <div className="relative mx-auto mt-6 h-[185px] w-[190px] max-w-full overflow-hidden lg:mt-4 lg:h-[480px] lg:w-full">
          <SplineScene
            scene={SCENE_URL}
            className="h-full w-full scale-[0.7] lg:scale-100"
          />

          {/* Floating activity cards — shown on all sizes; smaller + closer
              to the robot on mobile, full size/position on desktop. */}
          <div className={`${cardWrap} left-[2%] top-[8%] lg:left-[6%] lg:top-[12%]`}>
            <div className={cardInner} style={{ animationDelay: "0s" }}>
              💬<span className="lg:hidden"> New</span>
              <span className="hidden lg:inline"> New Message</span>
            </div>
          </div>
          <div className={`${cardWrap} right-[2%] top-[8%] lg:right-[6%] lg:top-[12%]`}>
            <div className={cardInner} style={{ animationDelay: "0.8s" }}>
              👥<span className="lg:hidden"> 5 online</span>
              <span className="hidden lg:inline"> 5 Members Online</span>
            </div>
          </div>
          <div className={`${cardWrap} bottom-[8%] left-[2%] lg:bottom-[12%] lg:left-[6%]`}>
            <div className={cardInner} style={{ animationDelay: "1.6s" }}>
              📎<span className="lg:hidden"> File</span>
              <span className="hidden lg:inline"> File Shared</span>
            </div>
          </div>
          <div className={`${cardWrap} bottom-[8%] right-[2%] lg:bottom-[12%] lg:right-[6%]`}>
            <div className={cardInner} style={{ animationDelay: "2.4s" }}>
              🔔<span className="lg:hidden"> 3 alerts</span>
              <span className="hidden lg:inline"> 3 Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login card — below on mobile (order-2), left column on desktop (order-1) */}
      <div className="order-2 flex w-full flex-col items-center justify-start px-4 pb-10 pt-[30px] lg:order-1 lg:w-auto lg:flex-1 lg:justify-center lg:px-6 lg:py-12">
        <div className="w-full max-w-[360px] lg:max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}