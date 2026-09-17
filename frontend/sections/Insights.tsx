import { ShieldAlert, Sprout } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildInsights } from "@/lib/analysis";
import type { FormValues } from "@/lib/parameters";
import { cn } from "@/lib/utils";

export function Insights({ values }: { values: FormValues }) {
  const insights = buildInsights(values);

  return (
    <section className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-cream">
            Smart farming insights
          </h2>
          <p className="mt-1.5 text-[13.5px] text-cream-faint">
            Observations drawn directly from your measurements.
          </p>
        </div>
        <Badge variant="muted">GENERAL INSIGHTS</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className="transition-colors duration-300 hover:border-white/[0.11]"
          >
            <CardContent className="flex gap-3.5 p-5 pt-5 sm:p-6 sm:pt-6">
              <Sprout
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  insight.tone === "watch" ? "text-amber-200/80" : "text-sage/70",
                )}
              />
              <p className="text-[13.5px] leading-relaxed text-cream-dim">
                {insight.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-field border border-white/[0.06] bg-white/[0.02] px-5 py-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-cream-faint" />
        <p className="text-[12.5px] leading-relaxed text-cream-faint">
          AI recommendations are predictions and should be validated with local
          agricultural expertise and soil testing.
        </p>
      </div>
    </section>
  );
}
