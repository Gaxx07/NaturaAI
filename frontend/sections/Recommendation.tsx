import { Leaf, Loader2, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ConfidenceRing, LeafMark } from "@/components/Brand";
import type { PredictionResponse } from "@/lib/api";
import { titleCase, toPercent } from "@/lib/utils";

interface Props {
  result: PredictionResponse | null;
  loading: boolean;
  error: string | null;
}

export function Recommendation({ result, loading, error }: Props) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!result) return <EmptyState />;
  return <ResultState result={result} />;
}

/* ------------------------------------------------------------------ states */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Card className="flex min-h-[420px] flex-col justify-center">
      <CardContent className="p-8 pt-8 text-center sm:p-10 sm:pt-10">
        {children}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Shell>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sage/15 bg-sage/[0.06] p-3.5 text-sage/70">
        <LeafMark />
      </div>
      <h3 className="text-lg font-medium text-cream">Ready to analyse</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-cream-faint">
        Enter your farm conditions and let NaturaAI evaluate the environment.
      </p>
    </Shell>
  );
}

function LoadingState() {
  return (
    <Shell>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sage/15 bg-sage/[0.06] text-sage">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-cream">Running the model</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-cream-faint">
        Passing your seven measurements through the Random Forest classifier.
      </p>
    </Shell>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Shell>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.07] text-red-300/80">
        <WifiOff className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-cream">{message}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-cream-faint">
        Start the Python backend, then run the analysis again.
      </p>
    </Shell>
  );
}

/* ------------------------------------------------------------------ result */

function ResultState({ result }: { result: PredictionResponse }) {
  return (
    <div className="space-y-5 animate-fade-up">
      {/* Headline prediction */}
      <Card className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-emerald-muted/15 blur-3xl"
        />
        <CardContent className="relative p-7 pt-7 sm:p-8 sm:pt-8">
          <p className="text-[10px] font-medium tracking-[0.2em] text-sage/80">
            AI RECOMMENDATION
          </p>

          <div className="mt-5 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h3 className="truncate text-4xl font-semibold tracking-[-0.03em] text-cream sm:text-5xl">
                {titleCase(result.crop)}
              </h3>
              <p className="mt-3 text-sm text-cream-dim">
                Model confidence: {toPercent(result.confidence)}
              </p>

              {/* Horizontal bar, in addition to the ring */}
              <div className="mt-3 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-muted to-sage transition-[width] duration-700 ease-out"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            <ConfidenceRing value={result.confidence} />
          </div>
        </CardContent>
      </Card>

      {/* Ranked alternatives */}
      <Card>
        <CardContent className="p-7 pt-7 sm:p-8 sm:pt-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-sage/70" />
            <h3 className="text-base font-medium text-cream">
              Top recommendations
            </h3>
          </div>
          <p className="mt-1.5 text-[12.5px] text-cream-faint">
            The three highest-probability classes from the model.
          </p>

          <ol className="mt-5 space-y-2.5">
            {result.ranked.map((item, index) => (
              <li
                key={item.crop}
                className="group flex items-center gap-4 rounded-field border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-colors duration-200 hover:border-sage/25 hover:bg-white/[0.045]"
              >
                <span className="w-6 shrink-0 text-[11px] tabular-nums text-cream-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex-1 truncate text-[15px] text-cream">
                  {titleCase(item.crop)}
                </span>

                <span className="hidden h-1 w-24 overflow-hidden rounded-full bg-white/[0.07] sm:block">
                  <span
                    className="block h-full rounded-full bg-sage/70"
                    style={{ width: `${Math.max(item.probability * 100, 1.5)}%` }}
                  />
                </span>

                <span className="w-16 shrink-0 text-right text-[13px] tabular-nums text-cream-dim">
                  {toPercent(item.probability)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
