# HimVigil — ML Service (FastAPI + XGBoost)

This folder contains the **FastAPI ML Microservice** for Teammates A & B (Your brother).

---

## 🚀 How to Run the ML Service

1. **Install dependencies**:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```

2. **Start the FastAPI Server**:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   Interactive Swagger API docs will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧠 Integrated Avalanche Model

The service loads `xgb_avalanche_final.json` automatically. It expects these
features in this order: `temperature_C`, `dewpoint_C`, `precip_mm`,
`snowfall_mm`, `snow_depth_mm`, `pressure_hPa`, `wind_speed`,
`relative_humidity`, and `month`.

The existing five-field sandbox request remains supported. Missing weather
fields use documented defaults until live telemetry supplies them.

## 🧠 Adding a Different Model

1. **Train your model** on the 9 features in this exact order:
   - `snow_depth` (cm)
   - `slope_angle` (degrees)
   - `wind_speed` (km/h)
   - `temperature` (°C)
   - `rainfall` (mm)

2. **Export your trained model** using `joblib`:
   ```python
   import joblib

   # After training your model:
   joblib.dump(xgb_model, "model.joblib")
   ```

3. **Place `model.joblib` inside this `ml-service/` folder**:
   Once placed here, `main.py` will automatically load it on startup and predict using your real weights!
