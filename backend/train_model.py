"""
NaturaAI - Model training
=========================

Trains the Random Forest crop classifier on crop_data.csv and saves it to
crop_model.pkl.

Run it from the backend folder:

    python train_model.py

You only need to run this if crop_model.pkl is missing or you want to retrain.
An existing crop_model.pkl already works with app.py as-is.
"""

import os
from datetime import datetime

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "crop_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "crop_model.pkl")

# Same order used by app.py. Train and predict must agree on this.
FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
TARGET_COLUMN = "label"

RANDOM_STATE = 42


def load_data(path):
    """Read the CSV and check that every column we need is present."""
    frame = pd.read_csv(path)

    missing = [c for c in FEATURE_ORDER + [TARGET_COLUMN] if c not in frame.columns]
    if missing:
        raise ValueError(
            f"crop_data.csv is missing these columns: {', '.join(missing)}"
        )

    frame = frame.dropna(subset=FEATURE_ORDER + [TARGET_COLUMN])
    return frame


def train():
    print("Loading data...")
    data = load_data(DATA_PATH)

    X = data[FEATURE_ORDER]          # features, in the fixed order
    y = data[TARGET_COLUMN]          # crop name

    print(f"  samples: {len(data)}")
    print(f"  features: {len(FEATURE_ORDER)}")
    print(f"  crop classes: {y.nunique()}")

    # Stratify so every crop appears in both splits.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    print("\nTraining Random Forest...")
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # --- Evaluation ---------------------------------------------------------
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    print(f"\nTest accuracy: {accuracy:.4f}")
    print("\nClassification report:")
    print(classification_report(y_test, predictions))

    print("Feature importance:")
    for name, score in sorted(
        zip(FEATURE_ORDER, model.feature_importances_),
        key=lambda pair: pair[1],
        reverse=True,
    ):
        print(f"  {name:<12} {score:.4f}")

    # --- Save ---------------------------------------------------------------
    # Saved as a dict so the API can report real training facts instead of
    # numbers typed into the interface by hand. app.py also accepts a bare
    # estimator, so an older crop_model.pkl still loads.
    bundle = {
        "model": model,
        "features": FEATURE_ORDER,
        "training_samples": int(len(data)),
        "accuracy": float(accuracy),
        "trained_at": datetime.now().strftime("%Y-%m-%d"),
    }
    joblib.dump(bundle, MODEL_PATH)
    print(f"\nSaved model to {MODEL_PATH}")


if __name__ == "__main__":
    train()
