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

# 1. Request schema supports the existing five-field sandbox and the trained
#    model's nine weather features.
class PredictRequest(BaseModel):
    snow_depth: float = Field(default=40.0, description="Snowpack depth in centimeters (legacy input)", ge=0, le=5000)
    slope_angle: float = Field(default=38.0, description="Terrain slope inclination in degrees", ge=0, le=90)
    wind_speed: float = Field(default=20.0, description="Wind speed in km/h", ge=0, le=500)
    temperature: float = Field(default=-3.0, description="Surface temperature in Celsius", ge=-100, le=80)
    rainfall: float = Field(default=0.0, description="24h liquid rainfall in mm", ge=0, le=2000)
    temperature_C: Optional[float] = Field(default=None, ge=-120, le=100)
    dewpoint_C: Optional[float] = Field(default=None, ge=-120, le=100)
    precip_mm: Optional[float] = Field(default=None, ge=0, le=2000)
    snowfall_mm: Optional[float] = Field(default=None, ge=0, le=2000)
    snow_depth_mm: Optional[float] = Field(default=None, ge=0, le=100000)
    pressure_hPa: Optional[float] = Field(default=None, ge=200, le=1200)
    relative_humidity: Optional[float] = Field(default=None, ge=0, le=100)
    month: Optional[int] = Field(default=None, ge=1, le=12)

FEATURE_NAMES = [
    "temperature_C",
    "dewpoint_C",
    "precip_mm",
    "snowfall_mm",
    "snow_depth_mm",
    "pressure_hPa",
    "wind_speed",
    "relative_humidity",
    "month"
]

FEATURE_DESCRIPTIONS = {
    "temperature_C": "Air Temperature",
    "dewpoint_C": "Dew Point",
    "precip_mm": "Precipitation Rate",
    "snowfall_mm": "Fresh Snowfall",
    "snow_depth_mm": "Snowpack Depth",
    "pressure_hPa": "Atmospheric Pressure",
    "wind_speed": "Ridge Wind Speed",
    "relative_humidity": "Relative Humidity",
    "month": "Seasonal Vulnerability"
}

# 2. Dynamic Model Loader supporting joblib, pkl, pickle, and native XGBoost json/ubj
MODEL_CANDIDATE_NAMES = [
    "xgb_avalanche_final.json",
    "training-data/training/json/xgb_avalanche_final.json",
    "training-data/xgb_avalanche_final.json",
    "training-data/training/pickle file/xgb_avalanche_final.pkl",
    "model.joblib",
    "model.pkl",
    "model.pickle",
    "model.json",
    "model.ubj",
    "model.bin"
]

MODEL_FEATURE_DEFAULTS = {
    "temperature_C": -3.0,
    "dewpoint_C": -5.0,
    "precip_mm": 0.0,
    "snowfall_mm": 0.0,
    "snow_depth_mm": 400.0,
    "pressure_hPa": 700.0,
    "wind_speed": 20.0,
    "relative_humidity": 70.0,
    "month": 1
}

model: Optional[Any] = None
model_type: str = "none"
model_file_loaded: Optional[str] = None

def load_ml_model() -> bool:
    global model, model_type, model_file_loaded
    dir_path = os.path.dirname(os.path.abspath(__file__))
    cwd_path = os.getcwd()
    
    search_dirs = [dir_path, cwd_path, os.path.join(cwd_path, "ml-service")]
    
    for base in search_dirs:
        for fname in MODEL_CANDIDATE_NAMES:
            candidate_path = os.path.normpath(os.path.join(base, fname))
            if os.path.exists(candidate_path):
                try:
                    if candidate_path.endswith((".json", ".ubj", ".bin")):
                        import xgboost as xgb
                        booster = xgb.Booster()
                        booster.load_model(candidate_path)
                        model = booster
                        model_type = "xgb_booster"
                    else:
                        model = joblib.load(candidate_path)
                        model_type = "scikit_or_xgb_sklearn"
                    
                    model_file_loaded = fname
                    print(f"[OK] Successfully loaded trained ML model from {candidate_path} (type: {model_type})")
                    return True
                except Exception as e:
                    print(f"[WARN] Failed to load {candidate_path}: {e}")
    
    model = None
    model_type = "none"
    model_file_loaded = None
    return False

# Initial load attempt on startup
load_ml_model()

@app.get("/health")
def health():
    if model is None:
        load_ml_model()
        
    return {
        "status": "online",
        "service": "FastAPI XGBoost ML Service",
        "model_loaded": model is not None,
        "model_file": model_file_loaded,
        "model_type": model_type,
        "features_expected": FEATURE_NAMES
    }

@app.post("/reload")
def reload_model():
    success = load_ml_model()
    return {
        "reloaded": success,
        "model_loaded": model is not None,
        "model_file": model_file_loaded
    }

def build_model_features(data: PredictRequest) -> list[float]:
    """Build the exact feature order used during avalanche model training with physical clipping."""
    temp = data.temperature_C if data.temperature_C is not None else data.temperature
    dew = data.dewpoint_C if data.dewpoint_C is not None else (temp - 2.0)
    precip = data.precip_mm if data.precip_mm is not None else data.rainfall
    snowfall = data.snowfall_mm if data.snowfall_mm is not None else 0.0
    snow_depth_mm = data.snow_depth_mm if data.snow_depth_mm is not None else (data.snow_depth * 10.0)
    pressure = data.pressure_hPa if data.pressure_hPa is not None else MODEL_FEATURE_DEFAULTS["pressure_hPa"]
    wind = data.wind_speed if data.wind_speed is not None else MODEL_FEATURE_DEFAULTS["wind_speed"]
    rh = data.relative_humidity if data.relative_humidity is not None else MODEL_FEATURE_DEFAULTS["relative_humidity"]
    month = data.month if data.month is not None else MODEL_FEATURE_DEFAULTS["month"]

    values = {
        "temperature_C": float(np.clip(temp, -90.0, 60.0)),
        "dewpoint_C": float(np.clip(dew, -95.0, 55.0)),
        "precip_mm": float(np.clip(precip, 0.0, 2000.0)),
        "snowfall_mm": float(np.clip(snowfall, 0.0, 2000.0)),
        "snow_depth_mm": float(np.clip(snow_depth_mm, 0.0, 50000.0)),
        "pressure_hPa": float(np.clip(pressure, 250.0, 1150.0)),
        "wind_speed": float(np.clip(wind, 0.0, 400.0)),
        "relative_humidity": float(np.clip(rh, 0.0, 100.0)),
        "month": int(np.clip(month, 1, 12))
    }
    return [float(values[name]) for name in FEATURE_NAMES]

@app.post("/predict")
def predict(data: PredictRequest):
    global model
    if model is None:
        load_ml_model()

    feature_values = build_model_features(data)
    features = np.array([feature_values], dtype=np.float32)

    if model is not None:
        try:
            raw_prediction = 0.05
            
            # Check if native xgb.Booster
            if model_type == "xgb_booster":
                import xgboost as xgb
                dmatrix = xgb.DMatrix(features, feature_names=FEATURE_NAMES)
                raw_pred = model.predict(dmatrix)
                raw_prediction = float(raw_pred[0])
                
                # Extract per-sample TreeSHAP attribution (magnitude of Shapley impact)
                try:
                    contribs = model.predict(dmatrix, pred_contribs=True)[0][:len(FEATURE_NAMES)]
                    abs_c = np.abs(contribs)
                    if abs_c.sum() > 0:
                        local_w = abs_c / abs_c.sum()
                    else:
                        local_w = np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES)
                except Exception:
                    local_w = np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES)
                
                # Global gain importances
                try:
                    gain_scores = model.get_score(importance_type='gain')
                    total_gain = sum(gain_scores.values()) or 1.0
                    global_w = np.array([gain_scores.get(k, 0.0) / total_gain for k in FEATURE_NAMES])
                except Exception:
                    global_w = np.ones(len(FEATURE_NAMES)) / len(FEATURE_NAMES)
                
                # Blend local TreeSHAP with global gain
                blended = 0.70 * local_w + 0.30 * global_w
                importances = [float(x) for x in (blended / (blended.sum() or 1.0))]

            elif hasattr(model, "predict_proba"):
                proba = model.predict_proba(features)
                raw_prediction = float(proba[0][1] if proba.shape[1] > 1 else proba[0][0])
                if hasattr(model, "feature_importances_"):
                    importances = [float(x) for x in getattr(model, "feature_importances_")]
                else:
                    importances = [1.0 / len(FEATURE_NAMES)] * len(FEATURE_NAMES)
            else:
                raw_prediction = float(model.predict(features)[0])
                importances = [1.0 / len(FEATURE_NAMES)] * len(FEATURE_NAMES)

            # Terrain & Physics Synthesis:
            # 1. If slope angle is flat / horizontal (<= 0 deg) e.g. ocean or water surface:
            if data.slope_angle <= 0.0:
                score = 0.0
            else:
                # Terrain baseline calculation (produces original predicted 30s-60s in steep mountain terrain)
                slope_score = max(20.0, 95.0 - abs(data.slope_angle - 38.0) * 4.5) if (25 <= data.slope_angle <= 45) else 25.0
                snow_score = min(100.0, (data.snow_depth / 60.0) * 85.0)
                wind_score = min(100.0, (data.wind_speed / 40.0) * 85.0)
                temp_score = min(100.0, 50.0 + data.temperature * 6.5) if data.temperature > 0 else min(85.0, 45.0 + abs(data.temperature + 8.0) * 3.0)
                rain_score = min(100.0, 35.0 + data.rainfall * 2.5) if data.rainfall > 0 else 0.0
                raw_terrain = (slope_score * 0.28) + (snow_score * 0.32) + (wind_score * 0.22) + (temp_score * 0.10) + (rain_score * 0.08)

                if data.snow_depth >= 5.0:
                    base_score = 10.0 + (raw_prediction ** 0.5) * 110.0
                    slope_mult = 1.15 if (32.0 <= data.slope_angle <= 45.0) else (1.0 if (26.0 <= data.slope_angle <= 50.0) else 0.82)
                    wind_slab_bonus = min(18.0, max(0.0, (data.wind_speed - 40.0) * 0.12)) if (data.snow_depth >= 15.0 and data.slope_angle >= 20.0) else 0.0
                    score = round(float(np.clip((base_score * slope_mult) + wind_slab_bonus, 8.0, 99.0)), 1)
                else:
                    # Ground snowpack is negligible or bare ground (< 5cm):
                    # An avalanche physically cannot release without snowpack fuel.
                    slope_f = 4.0 if 30 <= data.slope_angle <= 45 else (2.0 if data.slope_angle > 45 else 1.0)
                    wind_f = min(3.0, max(0.0, (data.wind_speed - 5) * 0.15))
                    temp_f = 1.5 if data.temperature > 2 else (1.0 if data.temperature < -12 else 0.5)
                    rain_f = min(2.5, data.rainfall * 0.2) if data.rainfall > 0 else 0.0
                    snow_f = max(0.0, data.snow_depth * 0.4)
                    score = round(min(14.0, max(3.0, 3.0 + slope_f + wind_f + temp_f + rain_f + snow_f)), 1)

        except Exception as err:
            raise HTTPException(status_code=500, detail=f"Model inference failed: {str(err)}")
    else:
        # Calibrated fallback if model file is missing
        if data.snow_depth < 5.0:
            slope_f = 4.0 if 30 <= data.slope_angle <= 45 else (2.0 if data.slope_angle > 45 else 1.0)
            wind_f = min(3.0, max(0.0, (data.wind_speed - 5) * 0.15))
            temp_f = 1.5 if data.temperature > 2 else (1.0 if data.temperature < -12 else 0.5)
            rain_f = min(2.5, data.rainfall * 0.2) if data.rainfall > 0 else 0.0
            snow_f = max(0.0, data.snow_depth * 0.4)
            score = round(min(14.0, max(3.0, 3 + slope_f + wind_f + temp_f + rain_f + snow_f)), 1)
            importances = [0.0] * len(FEATURE_NAMES)
            importances[4] = 0.40
            importances[6] = 0.20
            importances[0] = 0.20
            importances[2] = 0.20
        else:
            slope_score = max(20.0, 95.0 - abs(data.slope_angle - 38.0) * 4.5) if (25 <= data.slope_angle <= 45) else 25.0
            snow_score = min(100.0, (data.snow_depth / 60.0) * 85.0)
            wind_score = min(100.0, (data.wind_speed / 40.0) * 85.0)
            temp_score = min(100.0, 50.0 + data.temperature * 6.5) if data.temperature > 0 else min(85.0, 45.0 + abs(data.temperature + 8.0) * 3.0)
            rain_score = min(100.0, 35.0 + data.rainfall * 2.5) if data.rainfall > 0 else 0.0

            raw = (slope_score * 0.28) + (snow_score * 0.32) + (wind_score * 0.22) + (temp_score * 0.10) + (rain_score * 0.08)
            score = round(min(99.0, max(10.0, raw)), 1)
            importances = [0.12, 0.10, 0.08, 0.16, 0.22, 0.08, 0.14, 0.07, 0.03]

    # Assign risk level
    level = "High" if score >= 70.0 else ("Moderate" if score >= 40.0 else "Low")

    # Build dynamically responsive feature importance ranking reflecting the point's terrain and weather
    temp_val = data.temperature_C if data.temperature_C is not None else data.temperature
    precip_val = data.precip_mm if data.precip_mm is not None else data.rainfall
    snowfall_val = data.snowfall_mm if data.snowfall_mm is not None else 0.0
    snow_depth_val = data.snow_depth_mm if data.snow_depth_mm is not None else (data.snow_depth * 10.0)
    wind_val = data.wind_speed
    rh_val = data.relative_humidity if data.relative_humidity is not None else 65.0
    pres_val = data.pressure_hPa if data.pressure_hPa is not None else 1013.25

    if data.slope_angle <= 0.0:
        ranked_factors = [
            {"name": "Horizontal / Water Surface", "feature": "water_body", "importance": 0.95},
            {"name": "Zero Shear Inclination", "feature": "slope_angle", "importance": 0.05}
        ]
    else:
        # Dynamic sensitivities for the current point's parameters
        sens = {
            'temperature_C': min(32.0, max(3.0, abs(temp_val) * 1.1 + (10.0 if temp_val > 15 else 4.0))),
            'dewpoint_C': 4.0,
            'precip_mm': min(35.0, max(2.0, precip_val * 2.5 + (10.0 if precip_val > 1 else 2.0))),
            'snowfall_mm': min(35.0, max(2.0, snowfall_val * 3.0 + 3.0)),
            'snow_depth_mm': min(38.0, max(3.0, (snow_depth_val / 30.0) + (15.0 if snow_depth_val > 50 else 3.0))),
            'pressure_hPa': min(18.0, max(2.0, abs(pres_val - 1013.25) * 0.15 + 3.0)),
            'wind_speed': min(35.0, max(3.0, wind_val * 0.9 + (10.0 if wind_val > 15 else 3.0))),
            'relative_humidity': min(16.0, max(2.0, (rh_val / 100.0) * 12.0 + 2.0)),
            'month': 3.0,
            'slope_angle': min(38.0, max(2.0, (1.0 - abs(data.slope_angle - 38.0) / 25.0) * 35.0))
        }

        # Blend with model baseline weights
        base_dict = {FEATURE_NAMES[i]: importances[i] for i in range(len(FEATURE_NAMES))}
        base_dict['slope_angle'] = 0.25
        combined_scores = {k: sens[k] * (0.4 + base_dict.get(k, 0.1)) for k in sens}
        tot_score = sum(combined_scores.values()) or 1.0

        all_desc = {
            **FEATURE_DESCRIPTIONS,
            'slope_angle': 'Slope Angle Criticality'
        }

        ranked_factors = [
            {"name": all_desc.get(k, k), "feature": k, "importance": round(v / tot_score, 3)}
            for k, v in combined_scores.items()
        ]
        ranked_factors.sort(key=lambda x: x["importance"], reverse=True)

    # Physical explanation
    if data.slope_angle <= 0.0:
        explanation = "Non-applicable hazard: Horizontal ground / water surface (slope: 0°). Avalanche release cannot occur."
    elif data.slope_angle < 5.0:
        explanation = f"Minimal hazard: Flat terrain (slope: {data.slope_angle}°). Insufficient gravitational shear stress for slab release."
    elif level == "High":
        explanation = f"Critical hazard alert: {ranked_factors[0]['name']} is primary driver. Slope at {data.slope_angle}° falls in acute shear zone."
    elif level == "Moderate":
        explanation = f"Moderate instability: {ranked_factors[0]['name']} elevated under current weather. Caution advised along steep gullies."
    elif data.snow_depth < 5.0:
        explanation = f"Stable terrain conditions: Ground snowpack is light ({data.snow_depth}cm). Normal precautions advised."
    else:
        explanation = "Stable snowpack conditions under current atmospheric and terrain telemetry."

    return {
        "score": score,
        "level": level,
        "topFactors": ranked_factors,
        "explanation": explanation
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
