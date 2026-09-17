/**
 * Interpretation layer.
 *
 * These are plain if/else rules applied to the numbers the user typed. They are
 * NOT model output and are labelled as general reading in the interface. The
 * only machine-learning output in this app comes from /api/predict.
 */

import type { FeatureKey, FormValues } from "./parameters";

export type Band = "low" | "mid" | "high";

export interface Reading {
  key: FeatureKey;
  label: string;
  value: number;
  display: string;
  verdict: string;
  band: Band;
}

function nutrient(value: number): { verdict: string; band: Band } {
  if (value < 40) return { verdict: "Low", band: "low" };
  if (value < 80) return { verdict: "Moderate", band: "mid" };
  if (value <= 120) return { verdict: "Balanced", band: "mid" };
  return { verdict: "High", band: "high" };
}

function readPh(value: number): { verdict: string; band: Band } {
  if (value < 5.5) return { verdict: "Acidic", band: "low" };
  if (value < 6.5) return { verdict: "Slightly acidic", band: "mid" };
  if (value <= 7.5) return { verdict: "Near neutral", band: "mid" };
  return { verdict: "Alkaline", band: "high" };
}

function readTemperature(value: number): { verdict: string; band: Band } {
  if (value < 15) return { verdict: "Cool", band: "low" };
  if (value <= 30) return { verdict: "Warm", band: "mid" };
  return { verdict: "Hot", band: "high" };
}

function readHumidity(value: number): { verdict: string; band: Band } {
  if (value < 40) return { verdict: "Dry", band: "low" };
  if (value <= 75) return { verdict: "Moderate", band: "mid" };
  return { verdict: "High", band: "high" };
}

function readRainfall(value: number): { verdict: string; band: Band } {
  if (value < 60) return { verdict: "Low", band: "low" };
  if (value <= 200) return { verdict: "Moderate", band: "mid" };
  return { verdict: "High", band: "high" };
}

export interface ProfileSummary {
  soil: Reading[];
  climate: Reading[];
}

export function buildProfile(values: FormValues): ProfileSummary {
  const n = Number(values.N);
  const p = Number(values.P);
  const k = Number(values.K);
  const ph = Number(values.ph);
  const temperature = Number(values.temperature);
  const humidity = Number(values.humidity);
  const rainfall = Number(values.rainfall);

  const soil: Reading[] = [
    { key: "N", label: "Nitrogen", value: n, display: `${n}`, ...nutrient(n) },
    { key: "P", label: "Phosphorus", value: p, display: `${p}`, ...nutrient(p) },
    { key: "K", label: "Potassium", value: k, display: `${k}`, ...nutrient(k) },
    {
      key: "ph",
      label: "Soil pH",
      value: ph,
      display: ph.toFixed(1),
      ...readPh(ph),
    },
  ];

  const climate: Reading[] = [
    {
      key: "temperature",
      label: "Temperature",
      value: temperature,
      display: `${temperature.toFixed(1)}°C`,
      ...readTemperature(temperature),
    },
    {
      key: "humidity",
      label: "Humidity",
      value: humidity,
      display: `${humidity.toFixed(0)}%`,
      ...readHumidity(humidity),
    },
    {
      key: "rainfall",
      label: "Rainfall",
      value: rainfall,
      display: `${rainfall.toFixed(0)} mm`,
      ...readRainfall(rainfall),
    },
  ];

  return { soil, climate };
}

export interface Insight {
  id: string;
  text: string;
  tone: "neutral" | "watch";
}

/** Short, hedged observations drawn from the same rules. */
export function buildInsights(values: FormValues): Insight[] {
  const insights: Insight[] = [];

  const n = Number(values.N);
  const p = Number(values.P);
  const k = Number(values.K);
  const ph = Number(values.ph);
  const temperature = Number(values.temperature);
  const humidity = Number(values.humidity);
  const rainfall = Number(values.rainfall);

  // pH
  if (ph < 5.5) {
    insights.push({
      id: "ph",
      text: "Soil pH is on the acidic side, which can limit how well some nutrients are taken up.",
      tone: "watch",
    });
  } else if (ph > 7.5) {
    insights.push({
      id: "ph",
      text: "Soil pH reads alkaline. Nutrient availability tends to narrow at this end of the scale.",
      tone: "watch",
    });
  } else {
    insights.push({
      id: "ph",
      text: "Soil pH sits in a near-neutral range, which suits a wide set of crops.",
      tone: "neutral",
    });
  }

  // Nutrients
  const lowNutrients = [
    n < 40 ? "nitrogen" : null,
    p < 40 ? "phosphorus" : null,
    k < 40 ? "potassium" : null,
  ].filter(Boolean) as string[];

  const highNutrients = [
    n > 120 ? "nitrogen" : null,
    p > 120 ? "phosphorus" : null,
    k > 120 ? "potassium" : null,
  ].filter(Boolean) as string[];

  if (lowNutrients.length) {
    insights.push({
      id: "nutrients-low",
      text: `Readings for ${lowNutrients.join(", ")} are on the lower side compared with the rest of the profile.`,
      tone: "watch",
    });
  }

  if (highNutrients.length) {
    insights.push({
      id: "nutrients-high",
      text: `Readings for ${highNutrients.join(", ")} are relatively high, so further application may add little.`,
      tone: "neutral",
    });
  }

  if (!lowNutrients.length && !highNutrients.length) {
    insights.push({
      id: "nutrients-balanced",
      text: "Nitrogen, phosphorus and potassium sit close to one another, so the nutrient profile looks balanced.",
      tone: "neutral",
    });
  }

  // Water
  if (rainfall < 60) {
    insights.push({
      id: "rainfall",
      text: "Rainfall is relatively low, so water availability may need additional attention.",
      tone: "watch",
    });
  } else if (rainfall > 250) {
    insights.push({
      id: "rainfall",
      text: "Rainfall is high. Drainage is worth checking where water tends to collect.",
      tone: "watch",
    });
  }

  // Humidity and heat
  if (humidity > 80) {
    insights.push({
      id: "humidity",
      text: "Humidity is high, and damp conditions often call for regular crop monitoring.",
      tone: "watch",
    });
  } else if (humidity < 35) {
    insights.push({
      id: "humidity",
      text: "The air is dry, which can increase how quickly soil moisture is lost.",
      tone: "neutral",
    });
  }

  if (temperature > 35) {
    insights.push({
      id: "temperature",
      text: "Temperature is high enough that heat stress is worth keeping in view.",
      tone: "watch",
    });
  } else if (temperature < 12) {
    insights.push({
      id: "temperature",
      text: "Temperature is cool, which narrows the range of crops that grow comfortably.",
      tone: "neutral",
    });
  }

  // Keep the list readable on a projector.
  return insights.slice(0, 5);
}

/** Small helper used by the profile bars. */
export function normalise(value: number, min: number, max: number): number {
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}
