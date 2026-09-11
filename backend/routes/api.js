const express = require('express');
const router = express.Router();
const VILLAGES = require('../data/villages');
const { getLiveWeather, fetchBatchWeather } = require('../services/weatherService');
const { predictRisk } = require('../services/mlClient');
const { recordEvaluation, getHistory } = require('../services/historyService');

// Cache to store recent predictions per village (3-minute cache for freshness)
const predictionCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

/**
 * Helper to compute full risk for a single village
 */
async function computeVillageTelemetry(village, weatherOverride = null, forceRefresh = false) {
  const cached = predictionCache.get(village.id);
  const now = Date.now();
  if (!forceRefresh && !weatherOverride && cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 1. Use batch weather override if provided, or fetch live
  const weather = weatherOverride || await getLiveWeather(village.lat, village.lng, forceRefresh);

  // 2. Call ML Model with the 5 model features
  const mlOutput = await predictRisk({
    snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
    slope_angle: village.slopeAngle,
    wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
    temperature: weather.temperature,
    rainfall: weather.rainfall ?? weather.rainfall24h ?? 0
  });

  // 3. Estimate Flash Flood / GLOF Risk
  let floodRaw = (weather.rainfall ?? 0) * 2.2 + Math.max(0, weather.temperature * 1.8);
  if (village.slopeAngle > 35) floodRaw *= 1.25;
  const floodScore = Math.min(95, Math.max(8, Math.round(floodRaw + 10)));
  const floodLevel = floodScore > 70 ? 'High' : floodScore > 40 ? 'Moderate' : 'Low';

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
      score: floodScore,
      level: floodLevel
    },
    weather: {
      temperature: weather.temperature,
      windSpeed: weather.windSpeed ?? weather.wind_speed ?? 10,
      wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
      snowfall24h: weather.snowfall24h ?? weather.snowfall_24h ?? 0,
      snowfall_24h: weather.snowfall_24h ?? weather.snowfall24h ?? 0,
      rainfall24h: weather.rainfall24h ?? weather.rainfall ?? 0,
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
      snowDepth: weather.snowDepth ?? weather.snow_depth ?? 0,
      snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
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
 * 3. POST /api/predict-coordinate
 * PREDICT ANY POINT ON EARTH / THE HIMALAYAS
 * Receives custom GPS coordinates + optional slope angle, pulls live weather from satellite, and runs ML
 */
router.post('/predict-coordinate', async (req, res) => {
  try {
    const { lat, lng, slope_angle = 36 } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Coordinates (lat, lng) are required.' });
    }

    // Always fetch fresh real-time satellite data for clicked points
    const weather = await getLiveWeather(parseFloat(lat), parseFloat(lng), true);

    const mlOutput = await predictRisk({
      snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
      slope_angle: parseFloat(slope_angle),
      wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
      temperature: weather.temperature,
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0
    });

    let floodRaw = (weather.rainfall ?? 0) * 2.2 + Math.max(0, weather.temperature * 1.8);
    if (parseFloat(slope_angle) > 35) floodRaw *= 1.25;
    const floodScore = Math.min(95, Math.max(8, Math.round(floodRaw + 10)));
    const floodLevel = floodScore > 70 ? 'High' : floodScore > 40 ? 'Moderate' : 'Low';

    const normalizedWeather = {
      temperature: weather.temperature,
      windSpeed: weather.windSpeed ?? weather.wind_speed ?? 10,
      wind_speed: weather.wind_speed ?? weather.windSpeed ?? 10,
      snowDepth: weather.snowDepth ?? weather.snow_depth ?? 0,
      snow_depth: weather.snow_depth ?? weather.snowDepth ?? 0,
      rainfall24h: weather.rainfall24h ?? weather.rainfall ?? 0,
      rainfall: weather.rainfall ?? weather.rainfall24h ?? 0,
      snowfall24h: weather.snowfall24h ?? weather.snowfall_24h ?? 0,
      source: weather.source,
      fetchedAt: weather.fetchedAt || new Date().toISOString()
    };

    const result = {
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      slopeAngle: parseFloat(slope_angle),
      elevation: Math.round(Math.max(1200, Math.min(5500, (parseFloat(lat) - 28) * 600 + (parseFloat(lng) - 74) * 350 + 1800))),
      avalancheRisk: {
        score: mlOutput.score,
        level: mlOutput.level
      },
      floodRisk: {
        score: floodScore,
        level: floodLevel
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

    let floodRaw = rainfall * 1.8 + Math.max(0, temperature * 2.2);
    if (slope_angle > 35) floodRaw *= 1.2;
    const floodScore = Math.min(98, Math.max(10, parseFloat(floodRaw.toFixed(1))));
    const floodLevel = floodScore > 70 ? 'High' : floodScore > 40 ? 'Moderate' : 'Low';

    res.json({
      avalancheRisk: {
        score: mlOutput.score,
        level: mlOutput.level
      },
      floodRisk: {
        score: floodScore,
        level: floodLevel
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

