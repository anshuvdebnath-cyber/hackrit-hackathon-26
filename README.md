# Terra Watch ⛰️
### Real-Time Avalanche & Flood Risk Dashboard for the Himalayas

Terra Watch converts complex terrain and meteorological feeds into an explainable, real-time risk score for Himalayan villages. Built for village administrators, expedition operators, and disaster management authorities.

---

## 🛠️ Tech Stack (Strictly Frontend)
- **Framework:** React 19 (Vite)
- **Geospatial Mapping:** React-Leaflet & Leaflet with custom risk-coded SVG pins
- **Model Explainability & Charts:** Chart.js & `react-chartjs-2`
- **Styling & Design System:** Tailwind CSS
- **Typography & Aesthetics:** Organic/natural Himalayan palette (Moss Green, Terracotta, Clay) with Fraunces & Nunito Google fonts

---

## 🚀 How to Run

From the project root:
```bash
npm run dev
```
Or directly from `frontend/`:
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌟 Features
1. **Interactive Himalayan Geoscope:** Real-time map displaying monitored villages with color-coded risk markers (High `#A85448`, Moderate `#C18C5D`, Low `#5D7052`), animated pulse beacons, and elevation overlays.
2. **Radial Risk Gauges:** Separate circular metrics for **Avalanche Risk** and **Flash Flood / GLOF Risk** with official emergency advisories.
3. **Model Explainability (Chart.js):** Horizontal bar charts showing relative feature weights (Snow Load Ratio, Wind Slab Potential, Slope Angle Criticality, etc.) accompanied by plain-English physical explanations.
4. **Meteorological & DEM Telemetry:** Live temperature, wind speed, 24h snowfall, 24h rainfall, slope incline, elevation, and HiAVAL database event count.
5. **Multi-Village Comparative Matrix:** Consolidated table for disaster management authorities with sorting and filtering.
6. **What-If Scenario Sandbox:** Interactive sandbox with real-time sliders for snow depth, slope angle, wind speed, temperature, and rainfall—recomputing risk scores and Chart.js feature importance on the fly.
