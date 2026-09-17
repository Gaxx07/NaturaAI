import { CloudSun, Mountain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buildProfile, normalise, type Reading } from "@/lib/analysis";
import { PARAMETERS, type FormValues } from "@/lib/parameters";
import { cn } from "@/lib/utils";

const BAND_STYLES = {
  low: "border-amber-300/25 bg-amber-300/[0.08] text-amber-200/90",
  mid: "border-sage/25 bg-sage/[0.08] text-sage",
  high: "border-sky-300/25 bg-sky-300/[0.08] text-sky-200/90",
} as const;

function Row({ reading }: { reading: Reading }) {
  const spec = PARAMETERS.find((p) => p.key === reading.key)!;
  const fill = normalise(reading.value, spec.min, spec.max);

  return (
    <li className="py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13.5px] text-cream-dim">{reading.label}</span>
        <div className="flex items-center gap-3">
          <span className="text-[13.5px] tabular-nums text-cream">
            {reading.display}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium",
              BAND_STYLES[reading.band],
            )}
          >
            {reading.verdict}
          </span>
        </div>
      </div>

      <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-sage/50 transition-[width] duration-700 ease-out"
          style={{ width: `${fill}%` }}
        />
      </div>
    </li>
  );
}

function Panel({
  title,
  icon,
  readings,
}: {
  title: string;
  icon: React.ReactNode;
  readings: Reading[];
}) {
  return (
    <Card className="transition-colors duration-300 hover:border-white/[0.11]">
      <CardContent className="p-6 pt-6 sm:p-7 sm:pt-7">
        <div className="flex items-center gap-2.5 text-sage/70">
          {icon}
          <h3 className="text-[10px] font-medium tracking-[0.2em] text-cream-faint">
            {title}
          </h3>
        </div>
        <ul className="mt-2 divide-y divide-white/[0.05]">
          {readings.map((reading) => (
            <Row key={reading.key} reading={reading} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ConditionAnalysis({ values }: { values: FormValues }) {
  const { soil, climate } = buildProfile(values);

  return (
    <section className="animate-fade-up">
      <div className="mb-6">
        <h2 className="text-2xl font-medium tracking-tight text-cream">
          Farm condition analysis
        </h2>
        <p className="mt-1.5 text-[13.5px] text-cream-faint">
          A plain reading of the values you entered. This is a simple rule-based
          summary, not model output.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="SOIL PROFILE"
          icon={<Mountain className="h-4 w-4" />}
          readings={soil}
        />
        <Panel
          title="CLIMATE PROFILE"
          icon={<CloudSun className="h-4 w-4" />}
          readings={climate}
        />
      </div>
    </section>
  );
}
