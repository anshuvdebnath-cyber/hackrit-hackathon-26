"""
Terra Watch - FastAPI ML Inference Service (Teammates A & B / Your Brother)
Loads the trained XGBoost model and provides real-time avalanche risk scoring.
"""

import os
from typing import Any, Optional
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import numpy as np

app = FastAPI(
    title="Terra Watch XGBoost Risk Service",
    description="Microservice serving real-time avalanche risk scores from trained XGBoost model",
    version="1.0.0"
)

# Enable CORS for local cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Pydantic Request Schema matching the 5 PRD model features
class PredictRequest(BaseModel):
    snow_depth: float = Field(default=40.0, description="Snowpack depth in centimeters", ge=0, le=500)
    slope_angle: float = Field(default=38.0, description="Terrain slope inclination in degrees", ge=0, le=90)
    wind_speed: float = Field(default=20.0, description="Wind speed in km/h", ge=0, le=200)
    temperature: float = Field(default=-3.0, description="Surface temperature in Celsius", ge=-50, le=40)
    rainfall: float = Field(default=0.0, description="24h liquid rainfall in mm", ge=0, le=300)

FEATURE_NAMES = [
    "Snow Load Ratio",
    "Slope Angle Criticality",
    "Wind Slab Potential",
    "Temperature Anomaly",
    "Rainfall Trigger"
]

# 2. Try loading the trained XGBoost model if exported by your brother
MODEL_FILE = os.path.join(os.path.dirname(__file__), "model.joblib")
model: Optional[Any] = None

if os.path.exists(MODEL_FILE):
    try:
        model = joblib.load(MODEL_FILE)
        print(f"[OK] Successfully loaded trained XGBoost model from {MODEL_FILE}")
    except Exception as e:
        print(f"[WARN] Error loading model file: {e}. Using fallback heuristic.")
else:
    print(f"[INFO] Model file '{MODEL_FILE}' not found yet. Ready for your brother to drop it in!")

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "FastAPI XGBoost ML Service",
        "model_loaded": model is not None,
        "features_expected": ["snow_depth", "slope_angle", "wind_speed", "temperature", "rainfall"]
    }

@app.post("/predict")
def predict(data: PredictRequest):
    # Prepare the feature vector for XGBoost
    # Feature ordering: [snow_depth, slope_angle, wind_speed, temperature, rainfall]
    features = np.array([[
        data.snow_depth,
        data.slope_angle,
        data.wind_speed,
        data.temperature,
        data.rainfall
    ]], dtype=np.float32)

    if model is not None:
        try:
            # Predict with XGBoost
            # Assumes model predicts continuous risk score (0-100) or probability (0-1)
            raw_prediction = float(model.predict(features)[0])
            score = raw_prediction * 100 if raw_prediction <= 1.0 else raw_prediction
            score = round(min(99.0, max(5.0, score)), 1)
            
            # Extract XGBoost feature importances if available
            if hasattr(model, "feature_importances_"):
                importances = [float(x) for x in getattr(model, "feature_importances_")]
            else:
                importances = [0.35, 0.30, 0.20, 0.10, 0.05]
        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Model inference failed: {str(err)}")
    else:
        # If there is no snow on the ground (< 5cm), avalanche release is physically impossible
        if data.snow_depth < 5.0:
            score = round(min(12.0, max(3.0, data.snow_depth * 1.2)), 1)
            importances = [0.10, 0.40, 0.20, 0.20, 0.10]
        else:
            # Calibrated baseline physics heuristic while training is in progress
            slope_score = max(20.0, 95.0 - abs(data.slope_angle - 38.0) * 4.5) if (25 <= data.slope_angle <= 45) else 25.0
            snow_score = min(100.0, (data.snow_depth / 60.0) * 85.0)
            wind_score = min(100.0, (data.wind_speed / 40.0) * 85.0)
            temp_score = min(100.0, 50.0 + data.temperature * 6.5) if data.temperature > 0 else min(85.0, 45.0 + abs(data.temperature + 8.0) * 3.0)
            rain_score = min(100.0, 35.0 + data.rainfall * 2.5) if data.rainfall > 0 else 0.0

            raw = (slope_score * 0.28) + (snow_score * 0.32) + (wind_score * 0.22) + (temp_score * 0.10) + (rain_score * 0.08)
            score = round(min(99.0, max(10.0, raw)), 1)
            importances = [0.32, 0.28, 0.22, 0.10, 0.08]

    # Assign risk level
    level = "High" if score > 70 else "Moderate" if score > 40 else "Low"

    # Build ranked feature importance list for Chart.js
    ranked_factors = [
        {"name": FEATURE_NAMES[i], "importance": round(importances[i], 3)}
        for i in range(len(FEATURE_NAMES))
    ]
    ranked_factors.sort(key=lambda x: x["importance"], reverse=True)

    # Physical explanation
    if data.snow_depth < 5.0:
        explanation = f"Negligible avalanche hazard: Ground is clear of snowpack ({data.snow_depth}cm). Slope is currently stable."
    elif level == "High":
        explanation = f"Critical hazard alert: {ranked_factors[0]['name']} is primary driver. Slope at {data.slope_angle}° in high shear failure zone."
    elif level == "Moderate":
        explanation = f"Moderate instability: {ranked_factors[0]['name']} elevated. Caution advised along exposed avalanche chutes."
    else:
        explanation = "Stable snowpack conditions under current telemetry."

    return {
        "score": score,
        "level": level,
        "topFactors": ranked_factors,
        "explanation": explanation
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
