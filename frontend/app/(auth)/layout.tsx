import { SplineScene } from "@/components/ui/splite";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Side-by-side at all widths: form left, robot right. Both flex-1.
    <div className="flex min-h-screen bg-[#080808]">
      {/* Left: form — wider than robot on mobile (flex-[2]), 50/50 on desktop.
          Scale the whole form down on mobile so it stays compact beside the
          robot; full size at lg. */}
      <div className="flex flex-[0_0_55%] flex-col items-center justify-center px-3 py-6 lg:flex-1 lg:px-6 lg:py-12">
        <div className="w-full max-w-[380px] scale-[0.85] lg:scale-100">
          {children}
        </div>
      </div>

      {/* Right: robot — smaller heading + shorter robot on mobile */}
      <div className="flex flex-[0_0_45%] flex-col items-center overflow-hidden lg:flex-1">
        {/* Heading */}
        <div className="px-4 pt-6 text-center lg:px-10 lg:pt-10">
          <h2 className="mb-1 text-base font-semibold text-white lg:mb-2 lg:text-2xl">
            Chat that keeps your team in flow.
          </h2>
          <p className="text-xs text-[#555] lg:text-sm">
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot: shorter on mobile, fits its container (overflow hidden).
            Scale the scene down on mobile so it isn't cut off; full on desktop. */}
        <div className="relative mt-2 h-[300px] w-full overflow-hidden lg:mt-4 lg:h-[480px]">
          <SplineScene
            scene={SCENE_URL}
            className="h-full w-full scale-[0.8] lg:scale-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#080808]/30" />
        </div>
      </div>
    </div>
  );
}