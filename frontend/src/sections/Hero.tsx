import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ModelInfo } from "@/lib/api";

/**
 * Stat strip. Values come from the loaded model when the backend is reachable,
 * and fall back to the known training figures when it is not.
 */
function stats(model: ModelInfo | null) {
  return [
    {
      value: String(model?.n_features ?? 7),
      label: "parameters",
    },
    {
      value: String(model?.n_classes ?? 22),
      label: "crop classes",
    },
    {
      value: (model?.training_samples ?? 6596).toLocaleString(),
      label: "training samples",
    },
  ];
}

export function Hero({ model }: { model: ModelInfo | null }) {
  return (
    <section className="relative pt-16 sm:pt-24">
      <div className="container">
        <div className="max-w-3xl animate-fade-up">
          <Badge>
            <Sparkles className="h-3 w-3" />
            AI-POWERED AGRICULTURE
          </Badge>

          <h1 className="mt-7 text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.03em] text-cream sm:text-6xl lg:text-[4.2rem]">
            Know your soil.
            <br />
            <span className="text-sage">Grow smarter.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-dim sm:text-base">
            NaturaAI analyses soil and environmental conditions using machine
            learning to identify crops that may be suitable for your farm.
          </p>
        </div>

        {/* Stat strip */}
        <dl
          className="mt-12 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.06] animate-fade-up sm:mt-14"
          style={{ animationDelay: "120ms" }}
        >
          {stats(model).map((stat) => (
            <div
              key={stat.label}
              className="bg-canvas/80 px-4 py-6 text-center backdrop-blur-xl sm:px-6"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
                {stat.value}
              </dd>
              <p className="mt-1.5 text-[10px] font-medium tracking-[0.16em] text-cream-faint">
                {stat.label.toUpperCase()}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
