"""
NaturaAI - Crop Recommendation API
==================================

A small Flask API that wraps the trained Random Forest model (crop_model.pkl)
and exposes it to the React frontend.

Endpoints
---------
GET  /api/health   -> tells the frontend whether the model loaded correctly
POST /api/predict  -> takes 7 soil/climate values, returns the recommended crop

The model is the source of truth. This file does no prediction logic of its
own: it only validates input, orders the features correctly, and formats the
model's output as JSON.
"""

import os
import logging

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")

# The model was trained with the columns in this exact order.
# Changing this order would silently produce wrong predictions.
FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# Accepted input ranges. These are sanity checks for the API, not agronomy.
FEATURE_RANGES = {
    "N": (0.0, 180.0),
    "P": (0.0, 145.0),
    "K": (0.0, 205.0),
    "temperature": (-10.0, 60.0),
    "humidity": (0.0, 100.0),
    "ph": (0.0, 14.0),
    "rainfall": (0.0, 3322.06),
}

TOP_K = 3  # how many ranked crops to return

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("naturaai")

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (localhost:5173) to call this API


# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------

def load_model(path):
    """
    Load crop_model.pkl.

    Two file layouts are supported so an existing model keeps working:
      1. a bare scikit-learn estimator  -> joblib.dump(model, path)
      2. a dict bundle written by train_model.py, e.g.
         {"model": model, "features": [...], "accuracy": 0.99}

    Returns (estimator, metadata_dict) or (None, {}) if the file is missing
    or unreadable.
    """
    if not os.path.exists(path):
        log.error("crop_model.pkl not found at %s - run train_model.py first.", path)
        return None, {}

    try:
        loaded = joblib.load(path)
    except Exception:
        log.exception("crop_model.pkl could not be read.")
        return None, {}

    if isinstance(loaded, dict) and "model" in loaded:
        estimator = loaded["model"]
        metadata = {k: v for k, v in loaded.items() if k != "model"}
    else:
        estimator = loaded
        metadata = {}

    if not hasattr(estimator, "predict_proba"):
        log.error("Loaded object has no predict_proba(); expected a classifier.")
        return None, {}

    log.info("Model loaded: %s", type(estimator).__name__)
    return estimator, metadata


MODEL, MODEL_META = load_model(MODEL_PATH)


def model_summary():
    """Facts about the loaded model, read from the model itself where possible."""
    if MODEL is None:
        return {}

    summary = {
        "algorithm": type(MODEL).__name__,
        "n_classes": int(len(MODEL.classes_)),
        "n_features": int(getattr(MODEL, "n_features_in_", len(FEATURE_ORDER))),
        "features": FEATURE_ORDER,
    }
    if hasattr(MODEL, "n_estimators"):
        summary["n_estimators"] = int(MODEL.n_estimators)

    # Anything train_model.py recorded (training sample count, test accuracy...)
    for key in ("training_samples", "accuracy", "trained_at"):
        if key in MODEL_META:
            summary[key] = MODEL_META[key]

    return summary


# ---------------------------------------------------------------------------
# Input validation
# ---------------------------------------------------------------------------

def parse_features(payload):
    """
    Turn the JSON body into a validated list of floats in FEATURE_ORDER.

    Returns (values, error_message). Exactly one of the two is meaningful.
    """
    if not isinstance(payload, dict):
        return None, "Request body must be a JSON object."

    values = []
    for name in FEATURE_ORDER:
        if name not in payload or payload[name] in ("", None):
            return None, f"Missing value for '{name}'."

        try:
            value = float(payload[name])
        except (TypeError, ValueError):
            return None, f"'{name}' must be a number."

        if not np.isfinite(value):
            return None, f"'{name}' must be a finite number."

        low, high = FEATURE_RANGES[name]
        if not (low <= value <= high):
            return None, f"'{name}' must be between {low:g} and {high:g}."

        values.append(value)

    return values, None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    """The frontend calls this on load to show the 'AI system online' status."""
    if MODEL is None:
        return jsonify({"status": "unavailable", "model": None}), 503
    return jsonify({"status": "online", "model": model_summary()})


@app.post("/api/predict")
def predict():
    """
    Run one prediction.

    Response shape:
      {
        "crop": "rice",
        "confidence": 0.942,
        "ranked": [{"crop": "rice", "probability": 0.942}, ...],
        "model": {...}
      }
    """
    if MODEL is None:
        return jsonify({"error": "Unable to connect to the AI model."}), 503

    values, error = parse_features(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    try:
        # A DataFrame with named columns keeps the feature order explicit and
        # matches how the model was trained, so scikit-learn stays quiet.
        frame = pd.DataFrame([values], columns=FEATURE_ORDER)

        probabilities = MODEL.predict_proba(frame)[0]
        classes = MODEL.classes_

        # Rank the classes by probability, highest first.
        order = np.argsort(probabilities)[::-1]
        ranked = [
            {"crop": str(classes[i]), "probability": float(probabilities[i])}
            for i in order[:TOP_K]
        ]

        best = str(classes[order[0]])
        confidence = float(probabilities[order[0]])
    except Exception:
        # Log the real traceback for us; send the user a plain message.
        log.exception("Prediction failed.")
        return jsonify({"error": "The AI model could not process these values."}), 500

    return jsonify(
        {
            "crop": best,
            "confidence": confidence,
            "ranked": ranked,
            "model": model_summary(),
        }
    )


@app.errorhandler(404)
def not_found(_):
    return jsonify({"error": "Endpoint not found."}), 404


@app.errorhandler(500)
def server_error(_):
    # Never leak a stack trace to the browser.
    return jsonify({"error": "Something went wrong on the server."}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
