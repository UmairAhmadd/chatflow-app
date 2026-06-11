import { SplineScene } from "@/components/ui/splite";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      {/* Left: form — full width on mobile, half on desktop */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:px-6">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>

      {/* Right: Spline robot — desktop only (hidden on mobile to avoid overlap) */}
      <div className="hidden w-1/2 flex-col items-center overflow-hidden lg:flex">
        {/* Heading top */}
        <div className="px-10 pt-10 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-white">
            Chat that keeps your team in flow.
          </h2>
          <p className="text-sm text-[#555]">
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot */}
        <div className="relative mt-4 h-[480px] w-full">
          <SplineScene scene={SCENE_URL} className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-[#080808]/30" />
        </div>
      </div>
    </div>
  );
}