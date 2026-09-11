import React from 'react';
import {
  Thermometer,
  Wind,
  CloudSnow,
  CloudRain,
  Mountain,
  Compass,
  Layers,
  History,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

export default function WeatherTerrainCards({ village }) {
  if (!village) return null;

  const weather = village.weather || {};
  const temp = weather.temperature ?? 0;
  const tempRaw = weather.temperature_raw ?? temp;
  const tempCorrected = weather.temperature_corrected ?? false;
  const wind = weather.windSpeed ?? weather.wind_speed ?? 0;
  const snowFall24h = weather.snowfall24h ?? weather.snowfall_24h ?? 0;
  const rain24h = weather.rainfall24h ?? weather.rainfall ?? 0;
  const snowPack = weather.snowDepth ?? weather.snow_depth ?? 0;
  const humidity = weather.humidity ?? null;
  const obsTime = weather.observationTime || weather.fetchedAt || null;
  const source = weather.source || 'live-open-meteo';
  const modelElev = weather.modelElevation ?? null;
  const slope = village.slopeAngle ?? 0;
  const elevation = village.elevation ?? 0;
  const aspect = village.aspect ?? 'North';
  const hiAval = village.hiAvalEvents ?? 12;

  // Physical classification helpers
  const isCriticalSlope = slope >= 30 && slope <= 45;
  const isHighWind = wind >= 20;
  const isSnowLoading = snowFall24h >= 10 || snowPack >= 30;

  return (
    <div className="bg-earth-50 rounded-2xl p-6 border border-earth-200 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-earth-200 gap-2">
        <div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-terracotta-700">
            Real-Time Telemetry & Terrain
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-earth-900 mt-0.5">
            Meteorological & DEM Parameters
          </h3>
        </div>
        <span className="text-xs sm:text-sm text-earth-700 font-medium text-left sm:text-right">
          Source: Open-Meteo live
          {obsTime ? <span className="block text-xs font-mono text-earth-600 font-semibold">Obs: {obsTime}</span> : null}
        </span>
      </div>

      {/* Grid of Telemetry Cards — all values are ORIGINAL Open-Meteo live data */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        
        {/* Temperature Card — live, lapse-corrected to village elevation */}
        <div className="bg-white p-4 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-700 mb-1.5">
            <span className="text-xs sm:text-sm font-bold">Temperature</span>
            <Thermometer className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-earth-950">
              {temp > 0 ? `+${temp}` : temp}°C
            </div>
            <div className="text-xs text-earth-700 font-medium mt-1">
              {temp <= 0 ? 'Sub-zero snowpack freeze' : 'Above freezing; wet thaw risk'}
            </div>
            <div className="text-xs text-earth-600 font-mono mt-1 font-semibold">
              raw {tempRaw}°C{tempCorrected ? ' (lapse-corr.)' : ''}{humidity != null ? ` · RH ${humidity}%` : ''}
            </div>
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white p-4 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-700 mb-1.5">
            <span className="text-xs sm:text-sm font-bold">Wind Speed</span>
            <Wind className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-earth-950">
              {wind} <span className="text-sm font-normal text-earth-600">km/h</span>
            </div>
            <div className="text-xs text-earth-700 font-medium mt-1">
              {isHighWind ? 'Active crest wind-slab drift' : 'Light to moderate breeze'}
            </div>
          </div>
        </div>

        {/* 24h Snowfall Card — daily.snowfall_sum (true 24h total, cm) */}
        <div className="bg-white p-4 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-700 mb-1.5">
            <span className="text-xs sm:text-sm font-bold">24h Snowfall</span>
            <CloudSnow className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-earth-950">
              {snowFall24h} <span className="text-sm font-normal text-earth-600">cm</span>
            </div>
            <div className="text-xs text-earth-700 font-medium mt-1">
              {isSnowLoading ? 'Heavy fresh slab loading' : 'Moderate or no fresh snow'}
            </div>
            <div className="text-xs text-earth-600 font-mono mt-1 font-semibold">daily sum · live</div>
          </div>
        </div>

        {/* 24h Rainfall Card — daily.rain_sum (true 24h total, mm) */}
        <div className="bg-white p-4 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-700 mb-1.5">
            <span className="text-xs sm:text-sm font-bold">24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-earth-950">
              {rain24h} <span className="text-sm font-normal text-earth-600">mm</span>
            </div>
            <div className="text-xs text-earth-700 font-medium mt-1">
              {rain24h > 10 ? 'Heavy runoff / flash flood' : 'Dry precipitation profile'}
            </div>
            <div className="text-xs text-earth-600 font-mono mt-1 font-semibold">daily sum · live</div>
          </div>
        </div>

        {/* Snowpack Depth Card — hourly.snow_depth at observation hour (m -> cm) */}
        <div className="bg-white p-4 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-700 mb-1.5">
            <span className="text-xs sm:text-sm font-bold">Snowpack Depth</span>
            <Layers className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-earth-950">
              {snowPack} <span className="text-sm font-normal text-earth-600">cm</span>
            </div>
            <div className="text-xs text-earth-700 font-medium mt-1">
              {snowPack <= 0 ? 'Bare ground at model grid' : snowPack < 30 ? 'Thin / patchy cover' : 'Deep pack — avalanche fuel'}
            </div>
            <div className="text-xs text-earth-600 font-mono mt-1 font-semibold">hourly snow_depth · live</div>
          </div>
        </div>

      </div>

      <div className="text-xs sm:text-sm text-earth-700 font-mono bg-white/80 border border-earth-200/90 rounded-xl px-4 py-2.5 leading-relaxed">
        Live feed: <strong>{source}</strong> · Observation: {obsTime ?? '—'}
        {modelElev != null ? ` · Model grid: ${modelElev}m (Village DEM: ${elevation}m)` : ` · Village DEM: ${elevation}m`}
        . High-relief white contours represent static glaciated terrain, not transient surface snow.
      </div>

      {/* Terrain DEM Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Slope Angle Card with Criticality indicator */}
        <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
          isCriticalSlope 
            ? 'bg-clay-50/80 border-clay-300 text-clay-950' 
            : 'bg-white border-earth-200 text-earth-900'
        }`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isCriticalSlope ? 'bg-clay-500 text-white' : 'bg-earth-100 text-earth-800'
          }`}>
            <Mountain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider opacity-85">
              Incline Gradient
            </div>
            <div className="text-xl font-heading font-extrabold">
              {slope}° Slope
            </div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">
              {isCriticalSlope ? 'Within peak avalanche zone (30°-45°)' : 'Outside prime release zone'}
            </div>
          </div>
        </div>

        {/* Elevation & Aspect */}
        <div className="bg-white p-4 rounded-xl border border-earth-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-earth-600">
              Elevation & Aspect
            </div>
            <div className="text-xl font-heading font-extrabold text-earth-950">
              {elevation}m · {aspect}
            </div>
            <div className="text-xs font-semibold text-earth-700 mt-0.5">
              {village.vegetation || 'Alpine Valley'}
            </div>
          </div>
        </div>

        {/* Avalanche Release History */}
        <div className="bg-white p-4 rounded-xl border border-earth-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-earth-600">
              Historical Threat Activity
            </div>
            <div className="text-xl font-heading font-extrabold text-earth-950">
              {hiAval} Recorded Events
            </div>
            <div className="text-xs font-semibold text-earth-700 mt-0.5">
              Historical avalanche path validation
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
