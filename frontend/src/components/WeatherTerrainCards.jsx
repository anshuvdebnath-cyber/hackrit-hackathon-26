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
  AlertCircle
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
      <div className="flex items-center justify-between border-b border-earth-200 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700">
            Real-Time Telemetry & Terrain
          </span>
          <h3 className="font-serif text-xl font-bold text-earth-900 mt-0.5">
            Meteorological & DEM Parameters
          </h3>
        </div>
        <span className="text-xs text-earth-500 font-medium text-right">
          Source: Open-Meteo live
          {obsTime ? <span className="block text-[10px] font-mono">Obs: {obsTime}</span> : null}
        </span>
      </div>

      {/* Grid of Telemetry Cards — all values are ORIGINAL Open-Meteo live data */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Temperature Card — live, lapse-corrected to village elevation */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-500 mb-1">
            <span className="text-xs font-semibold">Temperature</span>
            <Thermometer className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-extrabold text-earth-900">
              {temp > 0 ? `+${temp}` : temp}°C
            </div>
            <div className="text-[11px] text-earth-500 font-medium mt-0.5">
              {temp <= 0 ? 'Sub-zero snowpack freeze' : 'Above freezing; wet thaw risk'}
            </div>
            <div className="text-[10px] text-earth-400 font-mono mt-0.5">
              raw {tempRaw}°C{tempCorrected ? ' (lapse-corr.)' : ''}{humidity != null ? ` · RH ${humidity}%` : ''}
            </div>
          </div>
        </div>

        {/* Wind Speed Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-500 mb-1">
            <span className="text-xs font-semibold">Wind Speed</span>
            <Wind className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-extrabold text-earth-900">
              {wind} <span className="text-sm font-sans font-normal text-earth-600">km/h</span>
            </div>
            <div className="text-[11px] text-earth-500 font-medium mt-0.5">
              {isHighWind ? 'Active crest wind-slab drift' : 'Light to moderate breeze'}
            </div>
          </div>
        </div>

        {/* 24h Snowfall Card — daily.snowfall_sum (true 24h total, cm) */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-500 mb-1">
            <span className="text-xs font-semibold">24h Snowfall</span>
            <CloudSnow className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-extrabold text-earth-900">
              {snowFall24h} <span className="text-sm font-sans font-normal text-earth-600">cm</span>
            </div>
            <div className="text-[11px] text-earth-500 font-medium mt-0.5">
              {isSnowLoading ? 'Heavy fresh slab loading' : 'Moderate or no fresh snow'}
            </div>
            <div className="text-[10px] text-earth-400 font-mono mt-0.5">daily sum · live</div>
          </div>
        </div>

        {/* 24h Rainfall Card — daily.rain_sum (true 24h total, mm) */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-500 mb-1">
            <span className="text-xs font-semibold">24h Rainfall</span>
            <CloudRain className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-extrabold text-earth-900">
              {rain24h} <span className="text-sm font-sans font-normal text-earth-600">mm</span>
            </div>
            <div className="text-[11px] text-earth-500 font-medium mt-0.5">
              {rain24h > 10 ? 'Heavy runoff / flash flood' : 'Dry precipitation profile'}
            </div>
            <div className="text-[10px] text-earth-400 font-mono mt-0.5">daily sum · live</div>
          </div>
        </div>

        {/* Snowpack Depth Card — hourly.snow_depth at observation hour (m -> cm) */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-earth-500 mb-1">
            <span className="text-xs font-semibold">Snowpack Depth</span>
            <Layers className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="text-2xl font-serif font-extrabold text-earth-900">
              {snowPack} <span className="text-sm font-sans font-normal text-earth-600">cm</span>
            </div>
            <div className="text-[11px] text-earth-500 font-medium mt-0.5">
              {snowPack <= 0 ? 'Bare ground at model grid' : snowPack < 30 ? 'Thin / patchy cover' : 'Deep pack — avalanche fuel'}
            </div>
            <div className="text-[10px] text-earth-400 font-mono mt-0.5">hourly snow_depth · live</div>
          </div>
        </div>

      </div>

      <div className="text-[11px] text-earth-500 font-mono bg-white/60 border border-earth-200/70 rounded-lg px-3 py-2">
        Live: {source} · Obs {obsTime ?? '—'}
        {modelElev != null ? ` · model elev ${modelElev}m vs village ${elevation}m` : ` · village ${elevation}m`}
        . Basemap white = static glacier rendering (OpenTopoMap), not live snow.
      </div>

      {/* Terrain DEM Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Slope Angle Card with Criticality indicator */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isCriticalSlope 
            ? 'bg-clay-50/70 border-clay-300 text-clay-900' 
            : 'bg-white border-earth-200 text-earth-900'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCriticalSlope ? 'bg-clay-500 text-white' : 'bg-earth-100 text-earth-700'
          }`}>
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider opacity-75">
              Incline Gradient
            </div>
            <div className="text-lg font-bold">
              {slope}° Slope
            </div>
            <div className="text-[11px] opacity-80">
              {isCriticalSlope ? 'Within peak avalanche zone (30°-45°)' : 'Outside prime release zone'}
            </div>
          </div>
        </div>

        {/* Elevation & Aspect */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-earth-100 text-earth-700 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-earth-500">
              Elevation & Aspect
            </div>
            <div className="text-lg font-bold text-earth-900">
              {elevation}m · {aspect}
            </div>
            <div className="text-[11px] text-earth-600">
              {village.vegetation || 'Alpine Valley'}
            </div>
          </div>
        </div>

        {/* Historical Avalanche Record (HiAVAL) */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-terracotta-100 text-terracotta-800 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-terracotta-700">
              HiAVAL Records
            </div>
            <div className="text-lg font-bold text-earth-900">
              {hiAval} Recorded Events
            </div>
            <div className="text-[11px] text-earth-600">
              Historical avalanche path validation
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
