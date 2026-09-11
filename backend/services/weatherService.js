const axios = require('axios');

// In-memory weather cache: key = `${lat.toFixed(2)},${lng.toFixed(2)}`
const weatherCache = new Map();
const WEATHER_CACHE_TTL = 3 * 60 * 1000; // 3 minutes for fresh real-time tracking

/**
 * Deterministic mountain baseline weather generator
 * Used ONLY as a fail-safe when Open-Meteo is unreachable.
 */
function getBaselineWeather(lat, _lng) {
  const isHighAltitude = lat > 32.0;
  const temp = isHighAltitude ? 8.5 : 19.0;
  return {
    temperature: temp,
    wind_speed: 12.0,
    windSpeed: 12.0,
    snow_depth: 0.0,
    snowDepth: 0.0,
    snowfall_24h: 0.0,
    snowfall24h: 0.0,
    rainfall: 0.0,
    rainfall24h: 0.0,
    source: 'calibrated-baseline',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Normalizes an Open-Meteo response into a standard weather object
 */
function normalizeWeatherData(current, hourly) {
  const temperature = current.temperature_2m !== undefined ? current.temperature_2m : 15.0;
  const wind_speed = current.wind_speed_10m !== undefined ? current.wind_speed_10m : 8.0;
  const rainfall = current.rain !== undefined ? current.rain : 0.0;
  const snowfall_24h = current.snowfall !== undefined ? current.snowfall : 0.0;

  // Real-time snowpack depth from satellite (convert meters to cm)
  let snow_depth = 0.0;
  if (hourly && Array.isArray(hourly.snow_depth) && hourly.snow_depth.length > 0) {
    const rawDepth = hourly.snow_depth[0];
    snow_depth = (rawDepth !== null && rawDepth !== undefined && rawDepth > 0)
      ? Math.round(rawDepth * 100)
      : 0.0;
  }

  return {
    temperature,
    wind_speed,
    windSpeed: wind_speed,
    snow_depth: Math.max(0, snow_depth),
    snowDepth: Math.max(0, snow_depth),
    snowfall_24h,
    snowfall24h: snowfall_24h,
    rainfall,
    rainfall24h: rainfall,
    source: 'live-open-meteo',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetches real-time meteorological conditions for given Himalayan GPS coordinates.
 */
async function getLiveWeather(lat, lng, forceRefresh = false) {
  const cacheKey = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
  const now = Date.now();

  const cached = weatherCache.get(cacheKey);
  if (!forceRefresh && cached && (now - cached.timestamp < WEATHER_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,snowfall,rain&hourly=snow_depth&timezone=auto`;
    const response = await axios.get(url, { timeout: 4000 });
    const current = response.data.current || {};
    const hourly = response.data.hourly || {};

    const weatherData = normalizeWeatherData(current, hourly);
    weatherCache.set(cacheKey, { timestamp: now, data: weatherData });
    return weatherData;
  } catch (err) {
    console.warn(`Open-Meteo single fetch notice (${lat}, ${lng}):`, err.message);
    if (cached) {
      return cached.data;
    }
    const baseline = getBaselineWeather(lat, lng);
    weatherCache.set(cacheKey, { timestamp: now, data: baseline });
    return baseline;
  }
}

/**
 * Blazing-fast batch weather fetcher for all monitored Himalayan villages.
 * Queries all coordinates simultaneously in a single Open-Meteo HTTP request (~800ms total).
 */
async function fetchBatchWeather(villages, forceRefresh = false) {
  if (!villages || villages.length === 0) return new Map();

  const now = Date.now();
  const weatherMap = new Map();
  const missingVillages = [];

  // Check cache first if not forced
  if (!forceRefresh) {
    for (const v of villages) {
      const cacheKey = `${Number(v.lat).toFixed(2)},${Number(v.lng).toFixed(2)}`;
      const cached = weatherCache.get(cacheKey);
      if (cached && (now - cached.timestamp < WEATHER_CACHE_TTL)) {
        weatherMap.set(v.id, cached.data);
      } else {
        missingVillages.push(v);
      }
    }
  } else {
    missingVillages.push(...villages);
  }

  // If all are already cached, return immediately
  if (missingVillages.length === 0) {
    return weatherMap;
  }

  try {
    const lats = missingVillages.map(v => v.lat).join(',');
    const lngs = missingVillages.map(v => v.lng).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,snowfall,rain&hourly=snow_depth&timezone=auto`;

    const response = await axios.get(url, { timeout: 6000 });
    const results = Array.isArray(response.data) ? response.data : [response.data];

    for (let i = 0; i < missingVillages.length; i++) {
      const v = missingVillages[i];
      const item = results[i] || {};
      const current = item.current || {};
      const hourly = item.hourly || {};
      const weatherData = normalizeWeatherData(current, hourly);

      const cacheKey = `${Number(v.lat).toFixed(2)},${Number(v.lng).toFixed(2)}`;
      weatherCache.set(cacheKey, { timestamp: now, data: weatherData });
      weatherMap.set(v.id, weatherData);
    }
  } catch (err) {
    console.error('Batch weather fetch failed, falling back to individual cache/baseline:', err.message);
    for (const v of missingVillages) {
      const cacheKey = `${Number(v.lat).toFixed(2)},${Number(v.lng).toFixed(2)}`;
      const cached = weatherCache.get(cacheKey);
      if (cached) {
        weatherMap.set(v.id, cached.data);
      } else {
        const baseline = getBaselineWeather(v.lat, v.lng);
        weatherCache.set(cacheKey, { timestamp: now, data: baseline });
        weatherMap.set(v.id, baseline);
      }
    }
  }

  return weatherMap;
}

module.exports = {
  getLiveWeather,
  fetchBatchWeather
};
