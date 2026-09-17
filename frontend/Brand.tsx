import { cn } from "@/lib/utils";

/** Minimal leaf mark built from two arcs and a midrib. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <path
        d="M20 4c0 8.5-5.2 13.4-11.6 13.4C6.1 17.4 4 15.3 4 12.6 4 6.6 11 4 20 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M19 5C13.6 8.2 9.6 13.2 7.4 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

/**
 * Soft out-of-focus shapes behind the page. Purely decorative, so it is hidden
 * from assistive technology and sits behind everything.
 */
export function BotanicalField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-40 top-24 h-[26rem] w-[26rem] animate-drift rounded-full bg-emerald-deep/20 blur-[110px]" />
      <div
        className="absolute -right-32 top-[36rem] h-[30rem] w-[30rem] animate-drift rounded-full bg-forest-600/25 blur-[130px]"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] animate-drift rounded-full bg-sage/[0.06] blur-[120px]"
        style={{ animationDelay: "-11s" }}
      />

      {/* Two oversized leaf outlines, barely visible. */}
      <LeafMark className="absolute -right-16 top-40 h-72 w-72 rotate-[18deg] text-sage/[0.05]" />
      <LeafMark className="absolute -left-24 bottom-32 h-80 w-80 -rotate-[150deg] text-sage/[0.04]" />
    </div>
  );
}

/** Circular progress ring used for model confidence. */
export function ConfidenceRing({
  value,
  size = 104,
}: {
  value: number; // 0–1
  size?: number;
}) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - Math.min(Math.max(value, 0), 1));

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Model confidence ${(value * 100).toFixed(1)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="animate-ring-fill text-sage"
          style={
            {
              strokeDasharray: circumference,
              strokeDashoffset: circumference,
              "--ring-circumference": `${circumference}`,
              "--ring-offset-target": `${target}`,
            } as React.CSSProperties
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-cream">
          {(value * 100).toFixed(1)}
        </span>
        <span className="text-[10px] text-cream-faint">percent</span>
      </div>
    </div>
  );
}
