# NaturaAI — Smart Farming Intelligence

Version 1: **crop recommendation only**.

A React frontend over the existing Random Forest crop classifier. The model
stays the source of truth — the frontend never predicts anything itself.

```
naturaai/
├── backend/
│   ├── app.py              Flask API around crop_model.pkl
│   ├── train_model.py      retrains and saves crop_model.pkl
│   ├── requirements.txt
│   ├── crop_model.pkl      ← copy yours here
│   └── crop_data.csv       ← copy yours here
├── frontend/
│   ├── src/
│   │   ├── App.tsx             state, validation, API calls
│   │   ├── sections/           Navbar, Hero, FarmConditions, Recommendation,
│   │   │                       ConditionAnalysis, Insights, ModelTransparency
│   │   ├── components/ui/      shadcn-style primitives
│   │   └── lib/
│   │       ├── api.ts          the only place predictions come from
│   │       ├── parameters.ts   the seven inputs and their ranges
│   │       └── analysis.ts     rule-based reading of the inputs
│   └── ...
└── README.md
```

## Running it

Two terminals. Backend first.

**Backend** (port 8000)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Drop your existing `crop_model.pkl` and `crop_data.csv` into `backend/` before
starting. To retrain instead: `python train_model.py`.

**Frontend** (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The status pill in the navbar turns green once
`/api/health` confirms the model loaded.

If the backend runs somewhere other than `127.0.0.1:8000`, copy `.env.example`
to `.env` and set `VITE_API_URL`.

## API

`GET /api/health`

```json
{ "status": "online",
  "model": { "algorithm": "RandomForestClassifier", "n_classes": 22,
             "n_features": 7, "training_samples": 6596, "accuracy": 0.99 } }
```

`POST /api/predict`

```json
{ "N": 90, "P": 42, "K": 43, "temperature": 20.9,
  "humidity": 82, "ph": 6.5, "rainfall": 202.9 }
```

```json
{ "crop": "rice",
  "confidence": 0.942,
  "ranked": [ { "crop": "rice", "probability": 0.942 },
              { "crop": "maize", "probability": 0.031 },
              { "crop": "jute",  "probability": 0.014 } ],
  "model": { "...": "..." } }
```

`confidence` and `ranked` both come from `model.predict_proba()`. Nothing is
hardcoded.

## Feature order

`app.py` and `train_model.py` share one constant:

```python
FEATURE_ORDER = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
```

The API builds a `pandas.DataFrame` with these column names before calling the
model, so training and prediction cannot drift apart. Do not reorder it.

## What is model output and what is not

Two different things appear in the interface, and they are labelled differently
on purpose:

- **AI recommendation** and **Top recommendations** — Random Forest output via
  `predict_proba()`.
- **Farm condition analysis** and **Smart farming insights** — plain if/else
  rules in `lib/analysis.ts` applied to the numbers you typed. Thresholds like
  "near neutral" or "rainfall is low" are readable in that one file. They are
  not a second model, and the UI does not claim they are.

## Error handling

- All seven fields are validated in the browser before any request goes out
  (required, numeric, within range).
- The API validates them again server-side.
- Python tracebacks are logged to the server console only. The browser sees
  "Unable to connect to the AI model." and the status pill flips to offline.

## Deliberately not in version 1

Plant disease detection, yield prediction, weather APIs, authentication,
accounts, payments, chatbot. The crop recommendation flow comes first.

## Presentation notes

- "Use sample values" fills a known-good row so you don't type seven numbers on
  stage.
- The numbers in **Inside the AI** are read off the loaded model
  (`classes_`, `n_features_in_`) rather than typed into the interface, so if
  someone asks "is that real?", the answer is yes — retrain with different data
  and the page changes.
- `train_model.py` prints test accuracy, a per-crop classification report, and
  feature importances. Worth running once before the demo.
