/**
 * Thin client for the Python backend.
 *
 * Every prediction number shown in the interface comes from here. Nothing in
 * the frontend guesses a crop or a probability.
 */

import type { FeatureKey, FormValues } from "./parameters";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000";

export interface RankedCrop {
  crop: string;
  probability: number;
}

export interface ModelInfo {
  algorithm: string;
  n_classes: number;
  n_features: number;
  features: FeatureKey[];
  n_estimators?: number;
  training_samples?: number;
  accuracy?: number;
  trained_at?: string;
}

export interface PredictionResponse {
  crop: string;
  confidence: number;
  ranked: RankedCrop[];
  model: ModelInfo;
}

export class ApiError extends Error {}

const OFFLINE_MESSAGE = "Unable to connect to the AI model.";

/** Ask the backend whether the model loaded. Used by the status indicator. */
export async function fetchHealth(): Promise<ModelInfo | null> {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) return null;
    const data = await response.json();
    return (data.model as ModelInfo) ?? null;
  } catch {
    return null;
  }
}

/** Send the seven values and return the model's prediction. */
export async function predictCrop(
  values: FormValues,
): Promise<PredictionResponse> {
  const payload = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, Number(value)]),
  );

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Network-level failure: the server is not running or unreachable.
    throw new ApiError(OFFLINE_MESSAGE);
  }

  if (!response.ok) {
    // The API sends a plain message; it never sends a stack trace.
    const data = await response.json().catch(() => null);
    throw new ApiError(data?.error ?? OFFLINE_MESSAGE);
  }

  return (await response.json()) as PredictionResponse;
}
