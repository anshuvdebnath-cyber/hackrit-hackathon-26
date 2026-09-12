const express = require('express');
const router = express.Router();
const VILLAGES = require('../data/villages');
const { getLiveWeather, fetchBatchWeather, getTerrainSlope } = require('../services/weatherService');
const { predictRisk, getModelStatus } = require('../services/mlClient');
const { recordEvaluation, getHistory } = require('../services/historyService');

// Cache to store recent predictions per village (3-minute cache for freshness)
const predictionCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

/**
 * Flash Flood / GLOF Risk Engine
 * Produces original predicted flood risk across land and hilly sectors, with marine exclusion for ocean points.
 */
function calculateHydrologicalFloodRisk({
  rainfall = 0,
  temperature = 15,
  snowDepth = 0,
  slopeAngle = 20,
  elevation = 1500,
  isOcean = false
}) {
  // 1. Open ocean or sea level surface (elevation <= 0 or marine):
  // Terrestrial riverine and flash floods are physically non-applicable on the open sea.
  if (isOcean || elevation <= 0) {
    return {
      score: 0,
      level: 'Low',
      details: 'Open Ocean / Marine Surface: Terrestrial overland flash flood risk is non-applicable.'
    };
  }

  // 2. Original predicted Flash Flood / GLOF Risk formula
  const rain = Math.max(0, Number(rainfall) || 0);
  const temp = Number(temperature) || 0;
  let floodRaw = rain * 2.2 + Math.max(0, temp * 1.8);
  if (slopeAngle > 35) floodRaw *= 1.25;
  const finalScore = Math.min(95, Math.max(10, Math.round(floodRaw + 10)));
  const level = finalScore > 70 ? 'High' : (finalScore > 40 ? 'Moderate' : 'Low');

  return {
    score: finalScore,
    level,
    details: rain > 25
      ? `Heavy rainfall (${rain}mm) elevating mountain runoff risk.`
      : (temp > 20 ? `High ambient thermal runoff contributing to drainage channels.` : 'Normal mountain drainage conditions.')
  };
}

/**
 * Helper to compute full risk for a single village
 */
async function computeVillageTelemetry(village, weatherOverride = null, forceRefresh = false) {
  const cached = predictionCache.get(village.id);
  const now = Date.now();
  if (!forceRefresh && !weatherOverride && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 1. Use batch weather override if provided, or fetch live (with DEM elevation for correction)
  const weather = weatherOverride || await getLiveWeather(village.lat, village.lng, forceRefresh, village.elevation ?? null);

  // 2. Call ML Model with the 5 model features
  const mlOutput = await predictRisk({
    snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
    slope_angle: village.slopeAngle,
    wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
    temperature: weather.temperature,
    rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
    temperature_C: weather.temperature_C,
    dewpoint_C: weather.dewpoint_C,
    precip_mm: weather.precip_mm,
    snowfall_mm: weather.snowfall_mm,
    snow_depth_mm: (weather.snow_depth ?? weather.snowDepth ?? 0) * 10,
    pressure_hPa: weather.pressure_hPa,
    relative_humidity: weather.relative_humidity,
    month: weather.observationTime ? new Date(weather.observationTime).getMonth() + 1 : undefined
  });

  // 3. Hydrological Flash Flood / GLOF Risk (Physics-based water volume inflow)
  const floodCalc = calculateHydrologicalFloodRisk({
    rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
    temperature: weather.temperature,
    snowDepth: weather.snow_depth ?? weather.snowDepth ?? 0,
    slopeAngle: village.slopeAngle,
    elevation: village.elevation,
    isOcean: false,
    isWaterBody: false
  });

  const fullData = {
    id: village.id,
    villageId: village.id,
    name: village.name,
    fullName: village.fullName,
    region: village.region,
    district: village.district,
    lat: village.lat,
    lng: village.lng,
    slopeAngle: village.slopeAngle,
    elevation: village.elevation,
    aspect: village.aspect,
    vegetation: village.vegetation,
    hiAvalEvents: village.hiAvalEvents,
    statusSummary: village.statusSummary,
    avalancheRisk: {
      score: mlOutput.score,
      level: mlOutput.level
    },
    floodRisk: {
      score: floodCalc.score,
      level: floodCalc.level,
      details: floodCalc.details
    },
    weather: {
      temperature: weather.temperature,
      temperature_raw: weather.temperature_raw ?? weather.temperature,
      temperature_corrected: weather.temperature_corrected ?? false,
      modelElevation: weather.modelElevation ?? null,
      windSpeed: weather.windSpeed ?? weather.wind_speed ?? 10,
      wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
      humidity: weather.humidity ?? null,
      relative_humidity: weather.relative_humidity ?? weather.humidity ?? null,
      dewpoint_C: weather.dewpoint_C ?? null,
      pressure_hPa: weather.pressure_hPa ?? null,
      precip_mm: weather.precip_mm ?? weather.rainfall ?? 0,
      weather_code: weather.weather_code ?? null,
      snowfall24h: weather.snowfall24h ?? weather.snowfall_24h ?? 0,
      snowfall_24h: weather.snowfall_24h ?? weather.snowfall24h ?? 0,
      snowfall_now: weather.snowfall_now ?? 0,
      rainfall24h: weather.rainfall24h ?? weather.rainfall ?? 0,
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
      rain_now: weather.rain_now ?? 0,
      snowDepth: weather.snowDepth ?? weather.snow_depth ?? 0,
      snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
      observationTime: weather.observationTime || null,
      source: weather.source,
      fetchedAt: weather.fetchedAt || new Date().toISOString()
    },
    topFactors: mlOutput.topFactors,
    explanation: mlOutput.explanation,
    source: mlOutput.source,
    evaluatedAt: new Date().toISOString()
  };

  // Record into historical audit logger
  recordEvaluation({
    villageId: village.id,
    villageName: village.name,
    coordinates: { lat: village.lat, lng: village.lng },
    weather: fullData.weather,
    avalancheRisk: fullData.avalancheRisk,
    floodRisk: fullData.floodRisk,
    source: fullData.source
  });

  predictionCache.set(village.id, { timestamp: now, data: fullData });
  return fullData;
}

/**
 * 1. GET /api/villages
 * Fast batch query: pulls live Open-Meteo telemetry for all 8 Himalayan sectors in parallel (~800ms)
 */
router.get('/villages', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';

    // Batch fetch live weather for all monitored villages
    const weatherMap = await fetchBatchWeather(VILLAGES, forceRefresh);

    // Compute telemetry in parallel
    const telemetryPromises = VILLAGES.map(v =>
      computeVillageTelemetry(v, weatherMap.get(v.id), forceRefresh)
    );
    const results = await Promise.all(telemetryPromises);

    res.json(results);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Failed to retrieve village risk telemetry' });
  }
});

/**
 * 2. GET /api/risk/:villageId
 * Returns full orchestrated risk detail for a single selected village
 */
router.get('/risk/:villageId', async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const village = VILLAGES.find(v => v.id === req.params.villageId) || VILLAGES[0];
    const telemetry = await computeVillageTelemetry(village, null, forceRefresh);
    res.json(telemetry);
  } catch (error) {
    console.error(`Error fetching risk for ${req.params.villageId}:`, error);
    res.status(500).json({ error: 'Failed to evaluate sector risk' });
  }
});

/**
 * 2b. GET /api/model-status
 * Returns connectivity and model health with the FastAPI ML microservice (xgb_avalanche_final.json)
 */
router.get('/model-status', async (req, res) => {
  const status = await getModelStatus();
  res.json(status);
});

/**
 * 3. POST /api/predict-coordinate
 * PREDICT ANY POINT ON EARTH / THE HIMALAYAS
 * Receives custom GPS coordinates + optional slope angle, pulls live weather from satellite, and runs ML
 */
router.post('/predict-coordinate', async (req, res) => {
  try {
    const { lat, lng, slope_angle } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Coordinates (lat, lng) are required.' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Get real terrain elevation & slope from Open-Meteo DEM
    const terrain = await getTerrainSlope(latitude, longitude);

    // 2. Fetch fresh real-time satellite data for clicked points
    const weather = await getLiveWeather(latitude, longitude, true, terrain.elevation);

    // Real elevation from DEM / model grid (sea level is 0m, not 1200m)
    const rawElev = terrain.elevation ?? weather.modelElevation;
    const elevation = rawElev != null ? Math.max(0, Math.round(rawElev)) : (latitude < 24 && (longitude < 73 || longitude > 88) ? 0 : 1500);

    const isOcean = terrain.isOcean || elevation <= 0;
    const isWaterBody = terrain.isWaterBody || isOcean;

    // Real slope per coordinate
    let slopeAngle = parseFloat(slope_angle);
    let slopeSource = 'user-provided';
    if (slope_angle === undefined || slope_angle === null || slope_angle === '' || Number.isNaN(slopeAngle)) {
      slopeAngle = terrain.slopeAngle;
      slopeSource = terrain.source;
    }
    if (isOcean) {
      slopeAngle = 0.0;
    }

    // 3. Avalanche Risk Computation with Marine Physical Guard
    let mlOutput = null;
    if (isOcean) {
      mlOutput = {
        score: 0.0,
        level: 'Low',
        topFactors: [
          { name: 'Marine Surface', feature: 'water_body', importance: 1.0 }
        ],
        explanation: 'Open Ocean / Marine Surface: Avalanche hazard is physically non-applicable over water.',
        source: 'marine-physics-guard'
      };
    } else {
      mlOutput = await predictRisk({
        snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
        slope_angle: slopeAngle,
        wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
        temperature: weather.temperature,
        rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
        temperature_C: weather.temperature_C,
        dewpoint_C: weather.dewpoint_C,
        precip_mm: weather.precip_mm,
        snowfall_mm: weather.snowfall_mm,
        snow_depth_mm: (weather.snow_depth ?? weather.snowDepth ?? 0) * 10,
        pressure_hPa: weather.pressure_hPa,
        relative_humidity: weather.relative_humidity,
        month: weather.observationTime ? new Date(weather.observationTime).getMonth() + 1 : undefined
      });
    }

    // 4. Flash Flood Risk Engine
    const floodCalc = calculateHydrologicalFloodRisk({
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
      temperature: weather.temperature,
      snowDepth: weather.snow_depth ?? weather.snowDepth ?? 0,
      slopeAngle,
      elevation,
      isOcean
    });

    const normalizedWeather = {
      temperature: weather.temperature,
      temperature_raw: weather.temperature_raw ?? weather.temperature,
      temperature_corrected: weather.temperature_corrected ?? false,
      modelElevation: weather.modelElevation ?? null,
      windSpeed: weather.windSpeed ?? weather.wind_speed ?? 10,
      wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
      humidity: weather.humidity ?? null,
      relative_humidity: weather.relative_humidity ?? weather.humidity ?? null,
      dewpoint_C: weather.dewpoint_C ?? null,
      pressure_hPa: weather.pressure_hPa ?? null,
      precip_mm: weather.precip_mm ?? weather.rainfall ?? 0,
      weather_code: weather.weather_code ?? null,
      snowDepth: weather.snowDepth ?? weather.snow_depth ?? 0,
      snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
      rainfall24h: weather.rainfall24h ?? weather.rainfall ?? 0,
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
      rain_now: weather.rain_now ?? 0,
      snowfall24h: weather.snowfall24h ?? weather.snowfall_24h ?? 0,
      snowfall_now: weather.snowfall_now ?? 0,
      observationTime: weather.observationTime || null,
      source: weather.source,
      fetchedAt: weather.fetchedAt || new Date().toISOString()
    };

    const result = {
      coordinates: { lat: latitude, lng: longitude },
      slopeAngle,
      slopeSource,
      elevation,
      reliefDelta: terrain.reliefDelta ?? 0,
      demTile: terrain.demTile ?? '',
      demGridSource: terrain.demGridSource ?? 'Copernicus 30m GLO DEM',
      deltaN: terrain.deltaN ?? 0,
      deltaE: terrain.deltaE ?? 0,
      isOcean,
      isWaterBody,
      avalancheRisk: {
        score: mlOutput.score,
        level: mlOutput.level
      },
      floodRisk: {
        score: floodCalc.score,
        level: floodCalc.level,
        details: floodCalc.details
      },
      weather: normalizedWeather,
      topFactors: mlOutput.topFactors,
      explanation: mlOutput.explanation,
      source: mlOutput.source,
      evaluatedAt: new Date().toISOString()
    };

    recordEvaluation({
      coordinates: result.coordinates,
      weather: result.weather,
      avalancheRisk: result.avalancheRisk,
      floodRisk: result.floodRisk,
      source: result.source
    });

    res.json(result);
  } catch (error) {
    console.error('Predict coordinate error:', error);
    res.status(500).json({ error: 'Failed to predict risk for coordinates' });
  }
});

/**
 * 4. POST /api/simulate
 * Powers the Interactive What-If Scenario Sandbox
 */
router.post('/simulate', async (req, res) => {
  try {
    const {
      snow_depth = 45,
      slope_angle = 38,
      wind_speed = 18,
      temperature = -2.5,
      rainfall = 0
    } = req.body;

    const mlOutput = await predictRisk({
      snow_depth,
      slope_angle,
      wind_speed,
      temperature,
      rainfall
    });

    const floodCalc = calculateHydrologicalFloodRisk({
      rainfall,
      temperature,
      snowDepth: snow_depth,
      slopeAngle: slope_angle,
      elevation: 2000,
      isOcean: false,
      isWaterBody: false
    });

    res.json({
      avalancheRisk: {
        score: mlOutput.score,
        level: mlOutput.level
      },
      floodRisk: {
        score: floodCalc.score,
        level: floodCalc.level,
        details: floodCalc.details
      },
      topFactors: mlOutput.topFactors,
      explanation: mlOutput.explanation,
      source: mlOutput.source
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Simulation computation failed' });
  }
});

/**
 * 4b. POST /api/predict
 * Feature vector direct inference endpoint (Backend proxy to ML or calibrated heuristic)
 */
router.post('/predict', async (req, res) => {
  try {
    const {
      snow_depth = 40,
      slope_angle = 38,
      wind_speed = 20,
      temperature = -3,
      rainfall = 0
    } = req.body;

    const mlOutput = await predictRisk({
      snow_depth,
      slope_angle,
      wind_speed,
      temperature,
      rainfall
    });

    res.json(mlOutput);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Direct feature prediction failed' });
  }
});

/**
 * 5. GET /api/alerts
 * Filter for High-Risk sectors requiring immediate evacuation/dispatch advisories
 */
router.get('/alerts', async (req, res) => {
  try {
    const listPromises = VILLAGES.map(v => computeVillageTelemetry(v));
    const all = await Promise.all(listPromises);
    const alerts = all.filter(v => v.avalancheRisk.level === 'High' || v.floodRisk.level === 'High');
    res.json({
      count: alerts.length,
      timestamp: new Date().toISOString(),
      alerts
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to retrieve emergency alerts' });
  }
});

/**
 * 6. GET /api/history (Optional :villageId query or param)
 * Returns historical evaluation audit trail
 */
router.get('/history', (req, res) => {
  const { villageId, limit } = req.query;
  const history = getHistory(villageId, limit ? parseInt(limit, 10) : 25);
  res.json(history);
});

router.get('/history/:villageId', (req, res) => {
  const history = getHistory(req.params.villageId, 25);
  res.json(history);
});

/**
 * 7. GET /api/dispatch/:villageId
 * Generates an official SDRF / NDRF evacuation advisory text
 */
router.get('/dispatch/:villageId', async (req, res) => {
  try {
    const village = VILLAGES.find(v => v.id === req.params.villageId) || VILLAGES[0];
    const telemetry = await computeVillageTelemetry(village);

    const isHigh = telemetry.avalancheRisk.level === 'High';
    const isMod = telemetry.avalancheRisk.level === 'Moderate';

    const advisory = {
      dispatchId: `DISP-${Date.now()}`,
      issuedAt: new Date().toISOString(),
      targetSector: telemetry.fullName,
      district: telemetry.district,
      state: telemetry.region,
      threatLevel: telemetry.avalancheRisk.level.toUpperCase(),
      avalancheRiskScore: telemetry.avalancheRisk.score,
      primaryHazardDriver: telemetry.topFactors[0]?.name || 'Slope Instability',
      currentWeatherSummary: `${telemetry.weather.temperature}°C, ${telemetry.weather.windSpeed} km/h wind, ${telemetry.weather.snowDepth}cm snow`,
      recommendedAction: isHigh
        ? 'IMMEDIATE EVACUATION / SHELTER-IN-PLACE: Prohibit movement through leeward gullies and avalanche runout zones.'
        : isMod
          ? 'HEIGHTENED WATCH: Suspend high-altitude trekking; monitor snowpack bonding along steep chutes.'
          : 'ROUTINE MONITORING: Standard winter precautions; routes currently assessed as stable.'
    };

    res.json(advisory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate dispatch advisory' });
  }
});

/**
 * 8. GET /api/weather
 * Direct Open-Meteo live meteorological lookup for arbitrary coordinates
 */
router.get('/weather', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters required' });
    }
    const weather = await getLiveWeather(lat, lng);
    res.json({
      coordinates: { lat, lng },
      weather,
      queriedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve weather' });
  }
});

module.exports = router;

