import { LeafMark } from "@/components/Brand";
import { cn } from "@/lib/utils";

export type SystemStatus = "checking" | "online" | "offline";

const STATUS_COPY: Record<SystemStatus, string> = {
  checking: "CHECKING MODEL",
  online: "AI SYSTEM ONLINE",
  offline: "MODEL OFFLINE",
};

export function Navbar({ status }: { status: SystemStatus }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-canvas/70 backdrop-blur-xl">
      <div className="container flex h-[68px] items-center justify-between gap-4">
        {/* Left: mark + wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sage/20 bg-sage/[0.08] p-2 text-sage">
            <LeafMark />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight text-cream">
              NaturaAI
            </div>
            <div className="text-[9.5px] font-medium tracking-[0.2em] text-cream-faint">
              SMART FARMING INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Right: the single module that exists, plus model status */}
        <div className="flex items-center gap-3 sm:gap-5">
          <a
            href="#dashboard"
            className="hidden text-[13px] text-cream-dim transition-colors hover:text-sage sm:block"
          >
            Crop recommendation
          </a>

          <div
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5",
              status === "online" && "border-emerald-muted/30 bg-emerald-muted/10",
              status === "offline" && "border-red-400/25 bg-red-400/[0.07]",
              status === "checking" && "border-white/10 bg-white/[0.04]",
            )}
          >
            <span className="relative flex h-1.5 w-1.5">
              {status === "online" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-1.5 w-1.5 rounded-full",
                  status === "online" && "bg-sage",
                  status === "offline" && "bg-red-400",
                  status === "checking" && "bg-cream-faint",
                )}
              />
            </span>
            <span className="text-[9.5px] font-medium tracking-[0.16em] text-cream-dim">
              {STATUS_COPY[status]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
