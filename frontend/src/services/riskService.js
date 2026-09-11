import { VILLAGES } from '../data/villages';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Fetch list of all monitored villages with live Open-Meteo telemetry
 */
export async function fetchVillages(forceRefresh = false) {
  try {
    const url = forceRefresh ? `${BACKEND_URL}/api/villages?refresh=true` : `${BACKEND_URL}/api/villages`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      console.log('[TerraWatch] Live Open-Meteo telemetry loaded for villages:', data.map(v => `${v.name}: ${v.weather?.temperature}°C`));
      return { data, source: 'backend' };
    }
  } catch (err) {
    console.warn('[TerraWatch] Backend /api/villages not reachable or timed out, using fallback:', err.message);
  }
  return { data: VILLAGES, source: 'local' };
}

/**
 * Fetch single village risk data matching PRD contract
 */
export async function fetchVillageRisk(villageId, forceRefresh = false) {
  try {
    const url = forceRefresh ? `${BACKEND_URL}/api/risk/${villageId}?refresh=true` : `${BACKEND_URL}/api/risk/${villageId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      return { ...data, source: 'live-backend' };
    }
  } catch (err) {
    console.warn(`[TerraWatch] Live risk fetch failed for ${villageId}:`, err.message);
  }

  const village = VILLAGES.find(v => v.id === villageId) || VILLAGES[0];
  return {
    villageId: village.id,
    villageName: village.name,
    fullName: village.fullName,
    region: village.region,
    district: village.district,
    lat: village.lat,
    lng: village.lng,
    slopeAngle: village.slopeAngle,
    elevation: village.elevation,
    aspect: village.aspect,
    vegetation: village.vegetation,
    avalancheRisk: village.avalancheRisk,
    floodRisk: village.floodRisk,
    weather: village.weather,
    topFactors: village.topFactors,
    statusSummary: village.statusSummary,
    hiAvalEvents: village.hiAvalEvents,
    source: 'simulated-local'
  };
}

/**
 * Interactive What-If Scenario Risk Engine
 * Replicates the XGBoost multi-factor Himalayan model
 */
export function calculateSimulatedRisk({
  snow_depth = 45,
  slope_angle = 38,
  wind_speed = 18,
  temperature = -2.5,
  rainfall = 0
}) {
  // 1. Slope Angle Factor (30� - 45� is prime slab release zone, peaking at 38�)
  let slopeScore = 0;
  if (slope_angle < 25) {
    slopeScore = 15;
  } else if (slope_angle >= 25 && slope_angle <= 45) {
    // Peak at 38�
    const diff = Math.abs(slope_angle - 38);
    slopeScore = Math.max(30, 95 - diff * 4.5);
  } else if (slope_angle > 45 && slope_angle <= 60) {
    // Very steep slopes sluff off frequently, so large slab accumulation is moderate
    slopeScore = Math.max(25, 75 - (slope_angle - 45) * 3);
  } else {
    slopeScore = 20;
  }

  // 2. Snow Depth Factor (cm)
  // More than 30cm creates significant stress on basal layer
  let snowScore = Math.min(100, Math.max(0, (snow_depth / 60) * 85));

  // 3. Wind Speed Factor (km/h)
  // Winds > 15 km/h actively transport snow into dangerous lee pillows
  let windScore = Math.min(100, Math.max(0, (wind_speed / 40) * 85));

  // 4. Temperature Factor (�C)
  // Near 0�C or sudden warming creates weak layers; extreme cold (< -10�C) prevents bonding
  let tempScore = 30;
  if (temperature > 0) {
    tempScore = Math.min(100, 50 + temperature * 6.5); // Wet slide hazard
  } else if (temperature >= -8 && temperature <= 0) {
    tempScore = 45; // Standard cold slab
  } else {
    tempScore = Math.min(85, 45 + Math.abs(temperature + 8) * 3); // Persistent facet / depth hoar
  }

  // 5. Rainfall Factor (mm)
  // Rain on snow is catastrophic trigger
  let rainScore = 0;
  if (rainfall > 0) {
    rainScore = Math.min(100, 35 + rainfall * 2.5);
    if (snow_depth > 10) {
      rainScore += 20; // Compound wet slab trigger
    }
  }

  // Weighted Risk Score (0 - 100)
  const rawScore =
    slopeScore * 0.28 +
    snowScore * 0.32 +
    windScore * 0.22 +
    tempScore * 0.10 +
    rainScore * 0.08;

  const finalAvalancheScore = Math.min(99.4, Math.max(8.5, parseFloat(rawScore.toFixed(1))));

  // Risk Level
  const avalancheLevel =
    finalAvalancheScore > 70 ? 'High' : finalAvalancheScore > 40 ? 'Moderate' : 'Low';

  // Feature contributions
  const contributions = [
    { key: 'snow_depth', name: 'Snow Load Ratio', raw: snowScore * 0.32 },
    { key: 'slope_angle', name: 'Slope Angle Criticality', raw: slopeScore * 0.28 },
    { key: 'wind_speed', name: 'Wind Slab Potential', raw: windScore * 0.22 },
    { key: 'temperature', name: 'Temperature Anomaly', raw: tempScore * 0.10 },
    { key: 'rainfall', name: 'Rainfall Destabilization', raw: Math.max(1, rainScore * 0.08) }
  ];

  const totalContrib = contributions.reduce((acc, c) => acc + c.raw, 0);
  const topFactors = contributions
    .map(c => ({
      key: c.key,
      name: c.name,
      importance: parseFloat((c.raw / totalContrib).toFixed(3))
    }))
    .sort((a, b) => b.importance - a.importance);

  // Flood Risk estimation
  let floodRaw = rainfall * 1.8 + Math.max(0, temperature * 2.2);
  if (slope_angle > 35) floodRaw *= 1.2; // Steep runoff
  const floodScore = Math.min(98, Math.max(10, parseFloat(floodRaw.toFixed(1))));
  const floodLevel = floodScore > 70 ? 'High' : floodScore > 40 ? 'Moderate' : 'Low';

  // Explainability insight
  let explanation = '';
  if (avalancheLevel === 'High') {
    explanation = `Critical hazard alert: ${topFactors[0].name} (${(topFactors[0].importance * 100).toFixed(0)}%) is primary driver. Slope angle at ${slope_angle}� falls directly in peak shear zone.`;
  } else if (avalancheLevel === 'Moderate') {
    explanation = `Moderate instability: ${topFactors[0].name} elevated. Caution advised along exposed chutes and leeward gullies.`;
  } else {
    explanation = `Stable snowpack conditions. Normal precautions advised for backcountry crossings.`;
  }

  return {
    avalancheRisk: { score: finalAvalancheScore, level: avalancheLevel },
    floodRisk: { score: floodScore, level: floodLevel },
    topFactors,
    explanation
  };
}

/**
 * Run interactive scenario through the backend ML pipeline
 */
export async function simulateScenarioApi({
  snow_depth = 45,
  slope_angle = 38,
  wind_speed = 18,
  temperature = -2.5,
  rainfall = 0
}) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snow_depth,
        slope_angle,
        wind_speed,
        temperature,
        rainfall
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      return { ...data, source: data.source || 'backend-ml' };
    }
  } catch {
    // Fall back to local calculation
  }
  return {
    ...calculateSimulatedRisk({ snow_depth, slope_angle, wind_speed, temperature, rainfall }),
    source: 'client-heuristic'
  };
}

/**
 * Predict real-time risk for ANY clicked GPS coordinate on the map
 */
export async function predictCustomCoordinate(lat, lng, slopeAngle = 36) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/predict-coordinate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, slope_angle: slopeAngle }),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[TerraWatch] Real-time coordinate weather fetched from Open-Meteo:', data.weather);
      return data;
    }
  } catch (err) {
    console.warn('[TerraWatch] Live coordinate prediction failed, using fallback:', err.message);
  }

  const simulated = calculateSimulatedRisk({
    snow_depth: 0,
    slope_angle: slopeAngle,
    wind_speed: 12,
    temperature: 16.0,
    rainfall: 0
  });

  return {
    coordinates: { lat, lng },
    slopeAngle,
    ...simulated,
    weather: {
      temperature: 16.0,
      windSpeed: 12,
      snowfall24h: 0,
      rainfall24h: 0,
      snowDepth: 0,
      source: 'simulated-offline'
    },
    source: 'simulated-local',
    evaluatedAt: new Date().toISOString()
  };
}

/**
 * Fetch historical evaluation audit trail
 */
export async function fetchHistory(villageId = null) {
  try {
    const url = villageId ? `${BACKEND_URL}/api/history/${villageId}` : `${BACKEND_URL}/api/history`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    return [];
  }
  return [];
}
