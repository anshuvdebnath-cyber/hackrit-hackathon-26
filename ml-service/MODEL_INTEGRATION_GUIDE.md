# Terra Watch - ML Model Handoff & Integration Guide

This guide is for the team member / brother training the XGBoost avalanche risk model.
The backend orchestrator and FastAPI microservice are **already 100% wired up and waiting** for your model file.

---

## 1. Where to Save the Model

Export your trained model using `joblib` and save it directly as:
```text
ml-service/model.joblib
```

---

## 2. Expected Features & Ordering

Your model must accept a feature vector (or DataFrame / 2D numpy array) with **5 numeric features** in this exact order:

| Index | Feature Name | Description | Typical Range | Unit |
| :---: | :--- | :--- | :--- | :--- |
| `0` | `snow_depth` | Total snowpack depth | `0` to `300` | centimeters (cm) |
| `1` | `slope_angle` | Terrain incline | `10` to `65` | degrees (°) |
| `2` | `wind_speed` | 10m sustained wind speed | `0` to `120` | km/h |
| `3` | `temperature` | Air / surface temperature | `-40` to `35` | Celsius (°C) |
| `4` | `rainfall` | 24-hour liquid precipitation | `0` to `150` | millimeters (mm) |

---

## 3. Expected Model Output

Your model can return:
- **Continuous score (0 to 100)**: e.g. `model.predict(X)` returning values like `78.4`.
- **OR Probability (0.0 to 1.0)**: e.g. `model.predict_proba(X)[:, 1]` returning `0.784`. `main.py` automatically scales `0-1` values up to `0-100`.

If your model has `feature_importances_` (standard in `xgboost.XGBRegressor` or `XGBClassifier`), `main.py` automatically extracts them to populate the interactive Chart.js graphs on the frontend!

---

## 4. How to Export in Python

```python
import joblib
from xgboost import XGBRegressor # or XGBClassifier

# 1. Train your model
model = XGBRegressor(n_estimators=150, max_depth=4, learning_rate=0.08)
model.fit(X_train, y_train)

# 2. Save directly to ml-service/
joblib.dump(model, "ml-service/model.joblib")
print("Model exported successfully!")
```

---

## 5. How to Test Your Model in 5 Seconds

Once you have saved `ml-service/model.joblib`:

1. Restart the FastAPI service (or run `python ml-service/main.py`).
2. Run this test command in your terminal:
   ```bash
   curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d "{\"snow_depth\": 65, \"slope_angle\": 38, \"wind_speed\": 28, \"temperature\": -4, \"rainfall\": 0}"
   ```
3. You will immediately receive the prediction response with your model's exact score and feature importance rankings:
   ```json
   {
     "score": 84.2,
     "level": "High",
     "topFactors": [
       {"name": "Slope Angle Criticality", "importance": 0.38},
       {"name": "Snow Load Ratio", "importance": 0.31},
       ...
     ],
     "explanation": "Critical hazard alert: Slope Angle Criticality is primary driver..."
   }
   ```

---

## 6. What Happens While Waiting for the Model?

The system already runs a **calibrated Himalayan physics heuristic** (`heuristic-baseline`). 
The frontend, backend, live Open-Meteo telemetry, and Leaflet map will **never crash or halt**. 
As soon as `model.joblib` is placed into `ml-service/`, the system automatically switches to your trained machine learning model seamlessly!
