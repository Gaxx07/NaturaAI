import { ArrowRight, Info, Loader2, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PARAMETERS,
  type FeatureKey,
  type FormValues,
} from "@/lib/parameters";

interface Props {
  values: FormValues;
  errors: Partial<Record<FeatureKey, string>>;
  loading: boolean;
  onChange: (key: FeatureKey, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onFillSample: () => void;
}

export function FarmConditions({
  values,
  errors,
  loading,
  onChange,
  onSubmit,
  onReset,
  onFillSample,
}: Props) {
  return (
    <Card className="transition-colors duration-300 hover:border-white/[0.11]">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Farm conditions</CardTitle>
            <CardDescription className="mt-1.5">
              Enter your soil and environmental measurements.
            </CardDescription>
          </div>
          <Button
            variant="link"
            size="sm"
            className="-mr-1 shrink-0 px-0 text-[12px]"
            onClick={onFillSample}
            type="button"
          >
            Use sample values
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          {PARAMETERS.map((param) => {
            const error = errors[param.key];
            return (
              <div key={param.key}>
                <div className="mb-2 flex items-center gap-1.5">
                  <label
                    htmlFor={param.key}
                    className="text-[13px] font-medium text-cream-dim"
                  >
                    {param.label}
                  </label>
                  <span className="text-[11px] text-cream-faint">
                    {param.unit}
                  </span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`About ${param.label}`}
                        className="rounded-full p-0.5 text-cream-faint/70 transition-colors hover:text-sage"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{param.hint}</TooltipContent>
                  </Tooltip>
                </div>

                <Input
                  id={param.key}
                  type="number"
                  inputMode="decimal"
                  step={param.step}
                  min={param.min}
                  max={param.max}
                  placeholder={param.placeholder}
                  value={values[param.key]}
                  invalid={Boolean(error)}
                  aria-describedby={error ? `${param.key}-error` : undefined}
                  onChange={(event) => onChange(param.key, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmit();
                  }}
                />

                {error && (
                  <p
                    id={`${param.key}-error`}
                    className="mt-1.5 text-[11.5px] text-red-300/90"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="w-full flex-1"
            onClick={onSubmit}
            disabled={loading}
            type="button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                ANALYSING
              </>
            ) : (
              <>
                ANALYZE FARM CONDITIONS
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={onReset}
            disabled={loading}
            type="button"
            className="sm:w-auto"
            aria-label="Clear all fields"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
