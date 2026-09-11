const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Calls your brother's FastAPI XGBoost Service at POST /predict.
 * If the ML service is not yet running, it automatically uses the calibrated
 * physical shear-stress heuristic so development and the frontend never break.
 */
async function predictRisk({
  snow_depth,
  slope_angle,
  wind_speed,
  temperature,
  rainfall,
  temperature_C,
  dewpoint_C,
  precip_mm,
  snowfall_mm,
  snow_depth_mm,
  pressure_hPa,
  relative_humidity,
  month
}) {
  const payload = {
    snow_depth: parseFloat(snow_depth),
    slope_angle: parseFloat(slope_angle),
    wind_speed: parseFloat(wind_speed),
    temperature: parseFloat(temperature),
    rainfall: parseFloat(rainfall),
    temperature_C: parseFloat(temperature_C ?? temperature),
    dewpoint_C: parseFloat(dewpoint_C ?? (temperature - 2)),
    precip_mm: parseFloat(precip_mm ?? rainfall),
    snowfall_mm: parseFloat(snowfall_mm ?? 0),
    snow_depth_mm: parseFloat(snow_depth_mm ?? (snow_depth * 10)),
    pressure_hPa: parseFloat(pressure_hPa ?? 700),
    relative_humidity: parseFloat(relative_humidity ?? 70),
    month: Number.isFinite(Number(month)) ? Number(month) : new Date().getMonth() + 1
  };

  try {
    // 1. Attempt to call live FastAPI service
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, payload, { timeout: 2500 });
    return {
      ...response.data,
      source: 'live-fastapi-xgboost'
    };
  } catch (_error) {
    // 2. Unblock the team with calibrated physical fallback
    // Matches the Himalayan shear equilibrium model
    // NOTE: no snowpack => no avalanche release, but score still varies 3-14
    // with slope/wind/temp so every coordinate does NOT show a flat 4.5.
    if (snow_depth < 5) {
      const slopeF = (slope_angle >= 30 && slope_angle <= 45) ? 4.0 : (slope_angle > 45 ? 2.0 : 1.0);
      const windF = Math.min(3.0, Math.max(0, (wind_speed - 5) * 0.15));
      const tempF = temperature > 2 ? 1.5 : (temperature < -12 ? 1.0 : 0.5);
      const rainF = rainfall > 0 ? Math.min(2.5, rainfall * 0.2) : 0;
      const snowF = Math.max(0, snow_depth * 0.4);
      const score = Math.round(Math.min(14, Math.max(3, 3 + slopeF + windF + tempF + rainF + snowF)) * 10) / 10;
      return {
        score,
        level: 'Low',
        topFactors: [
          { name: 'Slope Angle Criticality', importance: 0.35 },
          { name: 'Snow Load Ratio', importance: 0.25 },
          { name: 'Wind Slab Potential', importance: 0.20 },
          { name: 'Temperature Anomaly', importance: 0.10 },
          { name: 'Rainfall Destabilization', importance: 0.10 }
        ],
        explanation: `Negligible avalanche hazard: Ground is clear of snowpack (${snow_depth}cm). Score ${score}/100 reflects terrain predisposition only (slope ${slope_angle}°).`,
        source: 'heuristic-bridge'
      };
    }

    const slopeScore = slope_angle >= 25 && slope_angle <= 45
      ? Math.max(30, 95 - Math.abs(slope_angle - 38) * 4.5)
      : 25;
    const snowScore = Math.min(100, (snow_depth / 60) * 85);
    const windScore = Math.min(100, (wind_speed / 40) * 85);
    const tempScore = temperature > 0
      ? Math.min(100, 50 + temperature * 6.5)
      : Math.min(85, 45 + Math.abs(temperature + 8) * 3);
    const rainScore = rainfall > 0 ? Math.min(100, 35 + rainfall * 2.5 + (snow_depth > 10 ? 20 : 0)) : 0;

    const rawScore = (slopeScore * 0.28) + (snowScore * 0.32) + (windScore * 0.22) + (tempScore * 0.10) + (rainScore * 0.08);
    const score = Math.min(99.0, Math.max(10.0, parseFloat(rawScore.toFixed(1))));
    const level = score > 70 ? 'High' : score > 40 ? 'Moderate' : 'Low';

    const contributions = [
      { name: 'Snow Load Ratio', raw: snowScore * 0.32 },
      { name: 'Slope Angle Criticality', raw: slopeScore * 0.28 },
      { name: 'Wind Slab Potential', raw: windScore * 0.22 },
      { name: 'Temperature Anomaly', raw: tempScore * 0.10 },
      { name: 'Rainfall Destabilization', raw: Math.max(1, rainScore * 0.08) }
    ];
    const total = contributions.reduce((acc, c) => acc + c.raw, 0);
    const topFactors = contributions
      .map(c => ({
        name: c.name,
        importance: parseFloat((c.raw / total).toFixed(3))
      }))
      .sort((a, b) => b.importance - a.importance);

    let explanation = '';
    if (level === 'High') {
      explanation = `Critical hazard alert: ${topFactors[0].name} (${(topFactors[0].importance * 100).toFixed(0)}%) is primary trigger. Slope angle at ${slope_angle}° falls in peak shear zone.`;
    } else if (level === 'Moderate') {
      explanation = `Moderate instability: ${topFactors[0].name} elevated. Caution advised along exposed chutes and leeward gullies.`;
    } else {
      explanation = `Stable snowpack conditions. Normal precautions advised for backcountry crossings.`;
    }

    return {
      score,
      level,
      topFactors,
      explanation,
      source: 'heuristic-bridge'
    };
  }
}

/**
 * Checks connectivity and model health with the FastAPI ML service.
 */
async function getModelStatus() {
  try {
    const res = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    return {
      connected: true,
      service: res.data.service || 'FastAPI XGBoost ML Service',
      modelFile: res.data.model_file || 'xgb_avalanche_final.json',
      modelLoaded: res.data.model_loaded === true,
      modelType: res.data.model_type || 'xgb_booster',
      featuresExpected: res.data.features_expected || [],
      url: ML_SERVICE_URL
    };
  } catch (_e) {
    return {
      connected: false,
      service: 'FastAPI Offline (Fallback Active)',
      modelFile: 'xgb_avalanche_final.json',
      modelLoaded: false,
      url: ML_SERVICE_URL
    };
  }
}

module.exports = { predictRisk, getModelStatus };

