/**
 * The seven model inputs.
 *
 * `key` matches the JSON keys the Python API expects.
 */

export type FeatureKey =
  | "N"
  | "P"
  | "K"
  | "temperature"
  | "humidity"
  | "ph"
  | "rainfall";

export interface ParameterSpec {
  key: FeatureKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  placeholder: string;
  hint: string;
  group: "soil" | "climate";
}

export const PARAMETERS: ParameterSpec[] = [
  {
    key: "N",
    label: "Nitrogen",
    unit: "N",
    min: 0,
    max: 180,
    step: 1,
    placeholder: "0–180",
    hint: "Nitrogen — an important nutrient affecting leaf and stem growth.",
    group: "soil",
  },
  {
    key: "P",
    label: "Phosphorus",
    unit: "P",
    min: 0,
    max: 145,
    step: 1,
    placeholder: "0–145",
    hint: "Phosphorus — supports root development and flowering.",
    group: "soil",
  },
  {
    key: "K",
    label: "Potassium",
    unit: "K",
    min: 0,
    max: 205,
    step: 1,
    placeholder: "0–205",
    hint: "Potassium — helps the plant regulate water and resist stress.",
    group: "soil",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: -10,
    max: 60,
    step: 0.1,
    placeholder: "-10–60",
    hint: "Average air temperature during the growing period.",
    group: "climate",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    min: 0,
    max: 100,
    step: 0.1,
    placeholder: "0–100",
    hint: "Relative humidity of the air around the crop.",
    group: "climate",
  },
  {
    key: "ph",
    label: "Soil pH",
    unit: "pH",
    min: 0,
    max: 14,
    step: 0.1,
    placeholder: "0–14",
    hint: "How acidic or alkaline the soil is. 7 is neutral.",
    group: "soil",
  },
  {
    key: "rainfall",
    label: "Rainfall",
    unit: "mm",
    min: 0,
    max: 3322.06,
    step: 0.1,
    placeholder: "0–3322.06",
    hint: "Rainfall received over the season, in millimetres.",
    group: "climate",
  },
];

export const SAMPLE_VALUES: Record<FeatureKey, string> = {
  N: "90",
  P: "42",
  K: "43",
  temperature: "20.9",
  humidity: "82",
  ph: "6.5",
  rainfall: "202.9",
};

export type FormValues = Record<FeatureKey, string>;

export const EMPTY_FORM: FormValues = {
  N: "",
  P: "",
  K: "",
  temperature: "",
  humidity: "",
  ph: "",
  rainfall: "",
};