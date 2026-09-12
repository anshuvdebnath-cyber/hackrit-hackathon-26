# 🏔️ Terraform: Real-Time Geophysical Avalanche & Flash Flood Intelligence Platform

> **Next-Generation Planetary Threat Intelligence for the High-Altitude Himalayas**  
> *Built for HackRIT Hackathon 2026*

---

## 1. 📖 Definition

**Terraform** is an AI-powered geophysical intelligence and early-warning web platform engineered to predict, monitor, and explain real-time **Avalanche Release Probability** and **Flash Flood / Glacial Lake Outburst Flood (GLOF) Hazards** across mountainous terrains, with a primary focus on the Indian Himalayan Region (Himachal Pradesh, Jammu & Kashmir, Ladakh, and Uttarakhand).

By fusing live satellite meteorological telemetry, high-resolution Digital Elevation Models (DEM), and a trained **XGBoost machine learning model**, Terraform transforms complex physical weather and terrain data into intuitive, actionable risk indices ($0 - 100$) and Explainable AI (XAI) diagnostics for any monitored village or arbitrary point clicked on the globe.

---

## 2. 🎯 Core Purpose and Vision

### **The Problem**
High-relief alpine ecosystems are among the most volatile environments on Earth. In the Himalayas:
* Sudden temperature spikes can trigger **rain-on-snow** events, destabilizing weak snowpack layers within hours.
* High ridge-crest winds create dense **wind slabs** on leeward mountain faces that release without warning.
* Traditional monitoring relies on sparsely distributed manual observation huts, delayed radio bulletins, and broad regional alerts that lack hyper-local precision.

### **Our Vision**
The vision of Terraform is to **democratize high-altitude planetary safety**. We replace delayed, generalized weather advisories with:
1. **Hyper-Local Point Telemetry**: Allowing disaster teams and local residents to click **any geographic coordinate** on the map to evaluate localized terrain steepness, elevation, and atmospheric threat levels.
2. **Transparent Explainability (XAI)**: Moving beyond "black-box" predictions by presenting exact percentage contributions for every hazard trigger (e.g., whether a risk score of 78 is driven by 24h fresh snowfall, wind slab drift, or critical shear incline).
3. **Proactive Simulation**: Enabling emergency planners to run "What-If" scenarios before storms hit to stress-test evacuation routes and village safety zones.

---

## 3. 👥 Target Users

| User Group | How Terraform Serves Them |
| :--- | :--- |
| **Disaster Management Authorities (NDMA / SDMA)** | Monitors multiple vulnerable villages simultaneously via the **Multi-Village Comparative Matrix** to allocate rescue personnel and issue advance evacuation alerts. |
| **Border & Mountain Infrastructure Agencies (BRO / Military Outposts)** | Evaluates slope stability along strategic high-altitude highways (e.g., Manali-Leh, Zojila Pass) to preempt road closures and prevent transit disasters. |
| **Himalayan Village Councils & Local Residents** | Provides clear, non-technical risk levels (`Low`, `Moderate`, `High`) with physical narrative advisories in simple language. |
| **Expedition Operators & Alpine Trekking Agencies** | Assesses route safety for custom coordinates and mountain passes outside established weather station zones. |
| **Geophysical & Environmental Researchers** | Uses the interactive **What-If Scenario Sandbox** to simulate climate anomalies (such as sudden winter thaws or extreme 48-hour blizzards). |

---

## 4. 🛰️ What Stuffs Does Our API Provide Us? (Open-Meteo API Integration)

Terraform leverages **Open-Meteo's Open-Access Satellite & Forecast APIs** without requiring proprietary API keys, enabling high availability and zero rate-limit friction. Our backend queries two major API endpoints:

### **A. Open-Meteo Weather Forecast & Atmospheric API**
For any requested latitude and longitude, the API delivers live hourly and 24-hour accumulated atmospheric observations:
* **`temperature_2m`**: Ambient air temperature at ground level ($^\circ\text{C}$), critical for detecting thaw cycles and isotherm shifts.
* **`dew_point_2m`**: Water vapor saturation temperature, used to calculate relative humidity and atmospheric moisture condensation.
* **`wind_speed_10m`**: Wind velocity measured at 10 meters above the surface ($\text{km/h}$), the primary driver of leeward wind-slab accumulation.
* **`snowfall` / `snowfall_24h`**: Fresh, uncompacted snow accumulation ($\text{cm}$ and $\text{mm}$), representing the immediate mechanical load placed on pre-existing weak layers.
* **`precipitation` / `rain`**: Liquid rainfall ($\text{mm}$); liquid water acts as a lubricant on snowpack shear planes and drives rapid glacial runoff.
* **`surface_pressure`**: Atmospheric barometric pressure ($\text{hPa}$), correlating with incoming cyclonic Western Disturbances in the Himalayas.
* **`relative_humidity_2m`**: Moisture content percentage ($0 - 100\%$).
* **`snow_depth`**: Estimated total snowpack thickness on the ground ($\text{cm}$).

### **B. Open-Meteo Elevation & DEM Grid API**
Rather than simply looking up a static elevation number, Terraform uses the Elevation API in a unique **3-point spatial triangle** ($c, n, e$):
* Queries the center point $(lat, lng)$, a point 500m north $(lat + 0.0045^\circ, lng)$, and a point 500m east $(lat, lng + 0.0045^\circ)$.
* Provides real-time elevation based on the **Copernicus DEM GLO-30 / GLO-90** and **NASA SRTM** grids.
* Enables dynamic calculation of **local slope incline angle**, **directional gradients**, and **vertical cell relief ($\Delta z$)**.

---

## 5. 🧠 Information About Our Machine Learning Model

### **What Model We Are Using**
We use an **XGBoost (Extreme Gradient Boosting)** Decision Tree Ensemble model serialized in native JSON format: [`xgb_avalanche_final.json`](ml-service/xgb_avalanche_final.json).

### **Why We Are Using XGBoost**
1. **Superior Performance on Tabular Geospatial Data**: Unlike deep neural networks which require massive parameter tuning and can overfit on tabular meteorological vectors, gradient-boosted trees excel at learning complex physical boundaries on tabular datasets.
2. **Non-Linear Physical Interactions**:
   - In avalanche physics, **slope angle only matters if there is snow on the ground**. A 40° bare rock face has 0 avalanche risk.
   - **Wind speed only creates slabs if temperatures are cold and fresh powder is available**. 
   - Tree structures naturally capture these non-linear "AND / IF" physical conditions across branches.
3. **Native TreeSHAP Explainability**: XGBoost supports tree-based Shapley Additive Explanations (`pred_contribs=True`), enabling instantaneous calculation of exact feature attribution weights for every single prediction without expensive surrogate model computation.
4. **Lightweight & High-Speed Execution**: Inferences execute in sub-10 milliseconds inside our Python FastAPI microservice.

### **The Input Feature Vector (10 Dimensions)**
Every coordinate is mapped into the following vector:
```
[
  temperature_C,      // Air Temperature (°C)
  dewpoint_C,         // Dew Point (°C)
  precip_mm,          // Liquid Rain (mm)
  snowfall_mm,        // 24h Fresh Snowfall (mm)
  snow_depth_mm,      // Snowpack Thickness (mm)
  pressure_hPa,       // Barometric Pressure (hPa)
  wind_speed,         // Ridge Wind Speed (km/h)
  relative_humidity,  // Moisture (%)
  month,              // Seasonal Month Index (1 - 12)
  slope_angle         // Computed Incline Gradient (°)
]
```

### **The Outputs Generated**
* **Avalanche Hazard Score**: A calibrated continuous score from $0.0$ to $100.0$.
* **Risk Categorization**: `Low` ($\le 40$), `Moderate` ($41 - 69$), or `High` ($\ge 70$).
* **Dynamic Factor Decomposition**: Percentage impact of each variable powering the Chart.js horizontal bar chart.
* **Physical Diagnostic Narrative**: Plain-English explanation of the active hazard mechanism.

---

## 6. 🏗️ Complete Website Process Architecture in Detail

## 6. 🏗️ Website Process Architecture (Simplified & Intuitive)

Understanding how Terraform works is simple. Every time you click a point on the map or select a village, data flows through **4 straightforward steps**:

```
 [User Clicks Map]
        │
        ▼
 1. FRONTEND (React 18)
    Captures your GPS pin (lat, lng) and asks the backend for an evaluation.
        │
        ▼
 2. BACKEND ORCHESTRATOR (Node.js / Express)
    ├── 🛰️ Calls Open-Meteo Satellite API for live weather (snow, wind, temperature, rain).
    ├── 🏔️ Queries Copernicus Elevation Model to calculate terrain incline (slope in degrees).
    └── 🌊 Runs hydrological calculation to estimate flash flood / GLOF risk.
        │
        ▼
 3. AI MICROSERVICE (Python FastAPI + XGBoost)
    ├── 🧠 Feeds the live weather and terrain slope into our trained XGBoost model.
    └── 📊 Calculates the Avalanche Risk Score (0-100) and finds which factors contributed most.
        │
        ▼
 4. LIVE DASHBOARD UPDATE (React + Leaflet + Chart.js)
    The circular gauges animate, factor breakdown charts slide into place, and terrain cards update instantly!
```

---

### **How the 4 Steps Work in Plain English:**

#### **Step 1: Point Selection (Frontend)**
* **What happens**: You click anywhere in the Himalayas on our interactive Leaflet map, or pick a village from the dropdown, or tweak weather sliders in the What-If sandbox.
* **What is sent**: The exact GPS coordinates `(latitude, longitude)`.

#### **Step 2: Real-Time Data Fetching (Node.js Backend)**
* **What happens**: The Node.js backend acts as the central coordinator:
  1. It asks Open-Meteo for **live atmospheric conditions** (temperature, wind speed, fresh snowfall, total snowpack depth, rainfall, air pressure).
  2. It samples altitude at the point and 500 meters away to **measure the real slope angle** of the mountain face.
  3. It checks if the location is flat water or ocean (if yes, it safely locks avalanche risk to 0).
  4. It computes **Flash Flood & GLOF risk** based on how much rain is falling and how fast snow is melting.

#### **Step 3: Machine Learning Risk Scoring (Python FastAPI Service)**
* **What happens**: The backend hands the weather numbers and slope angle over to our Python microservice.
  1. The **XGBoost machine learning model** runs the numbers through its trained decision trees.
  2. It generates an **Avalanche Hazard Score** between 0 and 100.
  3. It uses **TreeSHAP explainability** to rank which triggers are most dangerous (e.g., *“32% from Fresh Snowfall, 26% from Steep Slope”*).
  4. It writes a simple English diagnostic sentence explaining the danger.

#### **Step 4: Live Visual Rendering (Frontend)**
* **What you see**: The frontend receives the results and updates instantly:
  * **Circular Gauges**: The needle smoothly animates to show both Avalanche and Flood scores.
  * **Explainability Chart**: Horizontal bars smoothly morph using Chart.js to display the top hazard drivers.
  * **Telemetry Cards**: Cards display the live temperature, wind speed, snow depth, and the exact DEM satellite grid tile (e.g., `Copernicus 30m GLO · Tile N32E077`).

---

## 7. 🛠️ Tech Stack Breakdown (Strictly Based on Codebase Files)

### **Frontend** (`frontend/`)
* **React 18 (`react`, `react-dom`)**: Core UI rendering engine utilizing state hooks (`useState`, `useEffect`, `useMemo`).
* **Vite (`vite`, `@vitejs/plugin-react`)**: Ultra-fast module bundler and local development environment.
* **Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`)**: Utility-first CSS styling implementing an organic Himalayan color palette (`terracotta`, `clay`, `moss`, `earth`).
* **Leaflet & React-Leaflet (`leaflet`, `react-leaflet`)**: Interactive map visualization displaying topographic contours from OpenTopoMap and custom marker layers.
* **Chart.js & React-Chartjs-2 (`chart.js`, `react-chartjs-2`)**: HTML5 canvas charting library rendering feature weights with custom tooltips, bar rounding, and stabilized scale ceilings.
* **Lucide React (`lucide-react`)**: Modern, minimalist vector iconography.

### **Backend Orchestrator** (`backend/`)
* **Node.js**: Asynchronous JavaScript runtime environment.
* **Express (`express`)**: HTTP web server framework routing REST endpoints (`/api/villages`, `/api/risk/:villageId`, `/api/predict-coordinate`, `/api/simulate`).
* **Axios (`axios`)**: Promise-based HTTP client for calling Open-Meteo satellite services and the local FastAPI microservice.
* **CORS (`cors`)**: Cross-Origin Resource Sharing middleware enabling seamless frontend-to-backend communication.
* **Dotenv (`dotenv`)**: Environment variable configuration.

### **Machine Learning Microservice** (`ml-service/`)
* **Python 3.10+**: Core programming language for data science and inference.
* **FastAPI (`fastapi`)**: Modern, high-performance web framework for building Python REST APIs.
* **Uvicorn (`uvicorn`)**: Lightning-fast ASGI web server running the FastAPI application on port 8000.
* **XGBoost (`xgboost`)**: Scalable, distributed gradient-boosted decision tree library loading `xgb_avalanche_final.json`.
* **NumPy (`numpy`)**: Fast vector mathematics for tensor clipping, trigonometric slope calculations, and array normalization.
* **Pydantic (`pydantic`)**: Strict runtime data validation and serialization for incoming JSON prediction payloads.
* **Joblib (`joblib`)**: Model persistence loader supporting fallback `.pkl` and `.joblib` estimators.

---

## 8. 📊 Which Datasets We Used and Why for the ML Model

### **1. HiAVALDB (High-Mountain Asia Avalanche Database)**
* **What It Is**: A curated historical catalog of **746+ avalanche occurrences** across High-Mountain Asia (Western Himalayas, Karakoram, and Hindu Kush) covering winter seasons.
* **Why We Used It**: Avalanches cannot be ethically or safely simulated in real life; empirical training data must come from real-world documented events. HiAVALDB provides verified ground-truth historical releases with precise dates and coordinates.

### **2. ECMWF ERA5 Atmospheric Reanalysis**
* **What It Is**: The European Centre for Medium-Range Weather Forecasts' flagship climate reanalysis, providing global hourly atmospheric variables at high vertical resolution.
* **Why We Used It**: Because weather stations in the Himalayas are sparse, historical avalanche events in HiAVALDB were joined with ERA5 reanalysis data at the exact date and coordinate of each release. This gave our model access to the exact historical air temperature, snowpack depth, fresh snowfall, surface pressure, and ridge winds present during every historical avalanche.

### **3. Global Digital Elevation Grids (Copernicus 30m / ALOS PALSAR / SRTM)**
* **What It Is**: Satellite radar and optical elevation models providing surface topography at 12.5m, 30m, and 90m horizontal resolution.
* **Why We Used It**: Slope incline is the single greatest physical prerequisite for avalanche release. These grids allow Terraform to derive the true gravitational shear stress on any slope on Earth.

---

## 9. 🧗 Honest Challenges We Faced

1. **The "Water Body vs. Mountain Valley" Physical Gating Dilemma**:
   - *Challenge*: Initially, clicking open oceans or sea surfaces produced non-zero avalanche predictions because satellite weather APIs reported cold maritime temperatures and precipitation over water. However, when we introduced an initial naive water filter, it inadvertently suppressed legitimate hazard scores in high-altitude Himalayan valleys and hillsides—dropping scores that were once in the 30s–50s down to single digits (<10), destroying the model's credibility.
   - *Resolution*: We engineered strict physical boundary guards in `backend/routes/api.js` and `ml-service/main.py`: only genuine horizontal marine surfaces ($z \le 0\text{m}$ or $\text{slope} \le 0^\circ$) are clamped to 0.0 avalanche risk. Any terrain with a measurable incline ($> 0^\circ$) retains full, authentic physical calculations.

2. **Severe Class Imbalance in Historical Avalanche Ground Truth (HiAVALDB)**:
   - *Challenge*: Avalanche releases are extreme, temporally sparse events. In the historical catalog, positive avalanche days are heavily outnumbered by thousands of non-event winter days ($>98\%$ negative class). Standard ML loss functions biased the model toward predicting near-zero hazard on almost every day, missing life-threatening release windows.
   - *Resolution*: During XGBoost training, we applied positive class weighting (`scale_pos_weight`), excluded non-snowpack anomalies (such as bedrock glacier detachments), and introduced physical boundary loss penalties. This ensured the model remains sensitive to critical trigger combinations (fresh snowfall load + $38^\circ$ slope incline) while controlling false positives during stable conditions.

3. **Scale Mismatch & High-Altitude Lapse Rate Downscaling**:
   - *Challenge*: Global meteorological reanalysis models (such as ERA5 and Open-Meteo) operate on horizontal grid resolutions of $\sim 9\text{km}$ to $\sim 25\text{km}$. In the rugged Himalayas, a single grid box can encompass both a $2,000\text{m}$ warm valley basin and a $5,500\text{m}$ freezing ridgeline with a $20^\circ\text{C}$ vertical temperature discrepancy. Relying on raw satellite grid temperatures would falsely indicate thawing at high altitudes or freezing in valleys.
   - *Resolution*: Implemented dynamic elevation correction using local adiabatic lapse rates ($\approx 6.5^\circ\text{C} / 1,000\text{m}$). The backend compares the satellite model's surface elevation against the fine-scale Copernicus DEM elevation to compute realistic ambient temperatures for the clicked coordinate.

4. **Instantaneous Real-Time Slope Derivation Without Heavy GeoTIFF Rasters**:
   - *Challenge*: In traditional GIS workflows, calculating slope angle requires downloading and processing multi-gigabyte raster files (GeoTIFFs) using heavy GIS servers (GDAL / GeoServer). This was impossible for an instant, responsive web application evaluating arbitrary points on Earth in sub-second time.
   - *Resolution*: We formulated an on-the-fly 3-point orthogonal spatial sampling algorithm over a $500\text{m}$ baseline ($d = 0.0045^\circ$). By correcting for latitude-dependent longitudinal convergence ($m_{\text{lng}} = 111,320 \times \cos(lat)$), the system calculates true directional gradients ($\text{grad}_N, \text{grad}_E$), terrain slope angle, and cell relief ($\Delta z$) in a single lightweight API call taking under 150ms.

5. **Coupling Discrete ML Avalanche Mechanics with Continuous Hydrological Flood Physics**:
   - *Challenge*: Avalanches and Glacial Lake Outburst Floods (GLOFs) are triggered by the same storms, but follow fundamentally different physics. An avalanche is a sudden structural shear failure of a cohesive snow slab (modeled via machine learning probabilities), while a flash flood is continuous fluid mass transport governed by rainfall intensity and thermal snowpack thawing.
   - *Resolution*: Built a dual-engine architecture: a Python XGBoost microservice handling non-linear slab failure probabilities, running concurrently alongside a calibrated hydrological runoff engine in Node.js that models liquid precipitation pooling and positive-degree snowmelt ($T > 0^\circ\text{C}$) to produce separate, synchronized threat gauges.

---

## 10. 🔭 Honest Future Scope of This Project

While Terraform is currently a fully functional, live-telemetry platform, there are significant real-world extensions planned:

1. **Synthetic Aperture Radar (SAR) Satellite Ingestion (Sentinel-1)**:
   - Integrate European Space Agency (ESA) Sentinel-1 C-band SAR radar imagery to detect physical **snow slab creep, ground deformation, and internal shear cracks** through cloud cover and darkness before slab release occurs.
2. **LoRa & Satellite Mesh Offline Broadcasting**:
   - Himalayan disaster zones frequently suffer power and cellular tower blackouts during major blizzards. Future work includes transmitting automated SMS and low-frequency LoRa radio alert packets directly to battery-powered sirens in isolated villages without requiring internet access.
3. **Automated Runout Path & Inundation Mapping**:
   - Expand from point-based release prediction to full 2D hydraulic and mechanical runout simulations (e.g., using Shallow Water Equations and Voellmy-Salm friction models) to display the exact downhill swath of destruction and affected buildings on the 3D map.
4. **Multilingual Regional Voice Alerts**:
   - Support localized regional languages and spoken audio warnings (Hindi, Ladakhi, Pahari, Tibetan) to ensure life-saving alerts reach elder residents and non-literate high-altitude pastoralists.
5. **Community Ground-Truth Validation**:
   - Allow verified mountain guides, ski patrols, and local residents to submit geotagged photos of fresh avalanche crowns or rising glacial stream levels to continuously fine-tune the XGBoost model weights via active learning.

---

## 🚀 Getting Started Locally

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: v3.10 or higher with `pip`

### 1. Clone the Repository
```bash
git clone https://github.com/anshuvdebnath-cyber/hackrit-hackathon-26.git
cd hackrit-hackathon-26
```

### 2. Start the FastAPI Machine Learning Service
```bash
# In a new terminal
cd ml-service
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

### 3. Start the Node.js Express Backend
```bash
# In a new terminal
npm install
node backend/server.js
```

### 4. Start the React Frontend Application
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 👥 Contributors & Acknowledgements
* **Terraform Development Team**: Developed for **HackRIT Hackathon 2026**.
* **Data Acknowledgements**: Open-Meteo Weather API, Copernicus Digital Elevation Model, ECMWF ERA5 Reanalysis, and the HiAVAL Avalanche Database.
