import { useCallback, useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BotanicalField } from "@/components/Brand";
import { Navbar, type SystemStatus } from "@/sections/Navbar";
import { Hero } from "@/sections/Hero";
import { FarmConditions } from "@/sections/FarmConditions";
import { Recommendation } from "@/sections/Recommendation";
import { ConditionAnalysis } from "@/sections/ConditionAnalysis";
import { Insights } from "@/sections/Insights";
import { ModelTransparency } from "@/sections/ModelTransparency";
import {
  ApiError,
  fetchHealth,
  predictCrop,
  type ModelInfo,
  type PredictionResponse,
} from "@/lib/api";
import {
  EMPTY_FORM,
  PARAMETERS,
  SAMPLE_VALUES,
  type FeatureKey,
  type FormValues,
} from "@/lib/parameters";

type FieldErrors = Partial<Record<FeatureKey, string>>;

/** Check all seven values before anything is sent to the model. */
function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  for (const param of PARAMETERS) {
    const raw = values[param.key].trim();

    if (raw === "") {
      errors[param.key] = "Required";
      continue;
    }

    const value = Number(raw);
    if (!Number.isFinite(value)) {
      errors[param.key] = "Enter a number";
      continue;
    }

    if (value < param.min || value > param.max) {
      errors[param.key] = `Must be between ${param.min} and ${param.max}`;
    }
  }

  return errors;
}

export default function App() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [analysedValues, setAnalysedValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SystemStatus>("checking");
  const [model, setModel] = useState<ModelInfo | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Ask the backend once on load so the status pill reflects reality.
  useEffect(() => {
    let cancelled = false;

    fetchHealth().then((info) => {
      if (cancelled) return;
      setModel(info);
      setStatus(info ? "online" : "offline");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = useCallback((key: FeatureKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const fieldErrors = validate(values);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      const firstKey = PARAMETERS.find((p) => fieldErrors[p.key])?.key;
      if (firstKey) document.getElementById(firstKey)?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const prediction = await predictCrop(values);
      setResult(prediction);
      setAnalysedValues(values); // freeze the inputs behind the analysis panels
      setModel(prediction.model);
      setStatus("online");

      // On narrow screens the result sits below the fold; bring it into view.
      requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch (caught) {
      setResult(null);
      setAnalysedValues(null);
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Unable to connect to the AI model.",
      );
      setStatus("offline");
    } finally {
      setLoading(false);
    }
  }, [values]);

  const handleReset = useCallback(() => {
    setValues(EMPTY_FORM);
    setErrors({});
    setResult(null);
    setAnalysedValues(null);
    setError(null);
  }, []);

  const handleFillSample = useCallback(() => {
    setValues({ ...SAMPLE_VALUES });
    setErrors({});
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <BotanicalField />
      <Navbar status={status} />

      <main>
        <Hero model={model} />

        {/* ------------------------------------------------ dashboard */}
        <section id="dashboard" className="scroll-mt-24 py-16 sm:py-20">
          <div className="container">
            <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-7">
              <div className="animate-fade-up">
                <FarmConditions
                  values={values}
                  errors={errors}
                  loading={loading}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onReset={handleReset}
                  onFillSample={handleFillSample}
                />
              </div>

              <div
                ref={resultRef}
                className="scroll-mt-24 animate-fade-up"
                style={{ animationDelay: "90ms" }}
                aria-live="polite"
              >
                <Recommendation
                  result={result}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>

            {/* Analysis appears only once a prediction has been made. */}
            {result && analysedValues && (
              <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
                <ConditionAnalysis values={analysedValues} />
                <Insights values={analysedValues} />
              </div>
            )}
          </div>
        </section>

        <ModelTransparency model={model} />
      </main>

      <footer className="border-t border-white/[0.06] py-8">
        <div className="container flex flex-col items-start justify-between gap-2 text-[12px] text-cream-faint sm:flex-row sm:items-center">
          <span>NaturaAI · Smart farming intelligence</span>
          <span>Version 1 · Crop recommendation</span>
        </div>
      </footer>
    </TooltipProvider>
  );
}
