import { SplineScene } from "@/components/ui/splite";

const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Mobile: single column (robot, heading, then form). Desktop: 2 columns.
    <div className="flex min-h-screen flex-col bg-[#080808] lg:flex-row">
      {/* Form — bottom on mobile (order-3), left column on desktop */}
      <div className="order-3 flex w-full flex-col items-center justify-center px-6 py-12 lg:order-1 lg:w-1/2 lg:px-6">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>

      {/* Heading — mobile only, sits between robot and form */}
      <div className="order-2 px-6 pt-6 text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-semibold text-white">
          Chat that keeps your team in flow.
        </h2>
        <p className="text-sm text-[#555]">
          Real-time messaging, groups, and presence — built for remote teams.
        </p>
      </div>

      {/* Spline robot — top on mobile (order-1), right column on desktop */}
      <div className="order-1 flex w-full flex-col items-center overflow-hidden lg:order-2 lg:w-1/2">
        {/* Heading — desktop only */}
        <div className="hidden px-10 pt-10 text-center lg:block">
          <h2 className="mb-2 text-2xl font-semibold text-white">
            Chat that keeps your team in flow.
          </h2>
          <p className="text-sm text-[#555]">
            Real-time messaging, groups, and presence — built for remote teams.
          </p>
        </div>

        {/* Robot: 280px on mobile (overflow hidden), 480px on desktop */}
        <div className="relative h-[280px] w-full overflow-hidden lg:mt-4 lg:h-[480px]">
          <SplineScene scene={SCENE_URL} className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 bg-[#080808]/30" />
        </div>
      </div>
    </div>
  );
}