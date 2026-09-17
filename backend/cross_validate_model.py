import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score

print("Loading dataset...")

df = pd.read_csv("crop_data.csv")

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

X = df[FEATURES]
y = df["label"]

print(f"Dataset: {len(df)} rows")
print(f"Crop classes: {y.nunique()}")

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1
)

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

print("\nRunning 5-fold cross-validation...")
print("This may take a little while...\n")

scores = cross_val_score(
    model,
    X,
    y,
    cv=cv,
    scoring="accuracy",
    n_jobs=-1
)

print("==============================")
print("5-FOLD CROSS-VALIDATION")
print("==============================")

for i, score in enumerate(scores, start=1):
    print(f"Fold {i}: {score * 100:.2f}%")

print("\nMean Accuracy:", f"{scores.mean() * 100:.2f}%")
print("Std Deviation:", f"{scores.std() * 100:.2f}%")
print(
    "Range:",
    f"{scores.min() * 100:.2f}% - {scores.max() * 100:.2f}%"
)
