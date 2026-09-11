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
  ShieldAlert,
  Sparkles,
  Cpu
} from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';

export default function WeatherTerrainCards({ village, modelStatus }) {
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

  // Animated numbers from 0 to target
  const animatedTemp = useCountUp(temp, 850, 1, village.id);
  const animatedWind = useCountUp(wind, 850, 1, village.id);
  const animatedSnow = useCountUp(snowFall24h, 850, 0, village.id);
  const animatedRain = useCountUp(rain24h, 850, 1, village.id);
  const animatedSnowPack = useCountUp(snowPack, 850, 0, village.id);

  // Physical classification helpers
  const isCriticalSlope = slope >= 30 && slope <= 45;
  const isHighWind = wind >= 20;
  const isSnowLoading = snowFall24h >= 10 || snowPack >= 30;

  return (
    <div className="bg-earth-50 rounded-2xl p-5 border border-earth-200 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-earth-200 gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700">
            Real-Time Telemetry & Terrain
          </span>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-earth-900 mt-0.5">
            Meteorological & DEM Parameters
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-earth-700 bg-white px-2 py-0.5 rounded border border-earth-200/90 shadow-xs inline-flex items-center gap-1">
              <Cpu className="w-3 h-3 text-terracotta-600" />
              <span>XGBoost Input Vector (9 Atmospheric & DEM Features)</span>
            </span>
            {village.isCustom && (
              <span className="text-[11px] font-mono font-bold text-moss-800 bg-moss-100/90 px-2 py-0.5 rounded border border-moss-300 shadow-xs inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-moss-600" />
                <span>Custom Point Telemetry</span>
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-earth-700 font-medium text-left sm:text-right">
          Source: Open-Meteo live
          {obsTime ? <span className="block text-[11px] font-mono text-earth-600 font-semibold">Obs: {obsTime}</span> : null}
        </span>
      </div>

      {/* Grid of Telemetry Cards — all values aligned at the exact same level */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-stretch">
        
        {/* 1. Temperature Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {Number(animatedTemp) > 0 ? `+${animatedTemp}` : animatedTemp}°C
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-7 flex items-center leading-snug">
              {temp <= 0 ? 'Sub-zero freeze' : 'Above freezing; thaw risk'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            raw {tempRaw}°C{humidity != null ? ` · RH ${humidity}%` : ''}
          </div>
        </div>

        {/* 2. Wind Speed Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Wind Speed</span>
            <Wind className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedWind} <span className="text-xs font-normal text-earth-600 font-sans">km/h</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-7 flex items-center leading-snug">
              {isHighWind ? 'Active wind-slab drift' : 'Light to moderate breeze'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            ridge telemetry · live
          </div>
        </div>

        {/* 3. 24h Snowfall Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">24h Snowfall</span>
            <CloudSnow className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedSnow} <span className="text-xs font-normal text-earth-600 font-sans">cm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-7 flex items-center leading-snug">
              {isSnowLoading ? 'Heavy slab loading' : 'Moderate or no fresh snow'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            daily sum · live
          </div>
        </div>

        {/* 4. 24h Rainfall Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">24h Rainfall</span>
            <CloudRain className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedRain} <span className="text-xs font-normal text-earth-600 font-sans">mm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-7 flex items-center leading-snug">
              {rain24h > 10 ? 'Heavy runoff / flood' : 'Dry precipitation profile'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            daily sum · live
          </div>
        </div>

        {/* 5. Snowpack Depth Card */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[140px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Snowpack Depth</span>
            <Layers className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedSnowPack} <span className="text-xs font-normal text-earth-600 font-sans">cm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-7 flex items-center leading-snug">
              {snowPack <= 0 ? 'Bare ground at grid' : snowPack < 30 ? 'Patchy snow cover' : 'Deep avalanche fuel'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            hourly snow_depth · live
          </div>
        </div>

      </div>

      {/* Terrain DEM Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Slope Angle Card with Criticality indicator */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isCriticalSlope 
            ? 'bg-clay-50/80 border-clay-300 text-clay-950' 
            : 'bg-white border-earth-200 text-earth-900'
        }`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCriticalSlope ? 'bg-clay-500 text-white' : 'bg-earth-100 text-earth-800'
          }`}>
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider opacity-85">
              Incline Gradient
            </div>
            <div className="text-lg font-heading font-extrabold">
              {slope}° Slope
            </div>
            <div className="text-[11px] font-medium opacity-90">
              {isCriticalSlope ? 'Within peak avalanche zone (30°-45°)' : 'Outside prime release zone'}
            </div>
          </div>
        </div>

        {/* Elevation & Aspect */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-earth-600">
              Elevation & Aspect
            </div>
            <div className="text-lg font-heading font-extrabold text-earth-950">
              {elevation}m · {aspect}
            </div>
            <div className="text-[11px] font-medium text-earth-700">
              {village.vegetation || 'Alpine Valley'}
            </div>
          </div>
        </div>

        {/* Avalanche Release History / DEM Grid Source */}
        <div className="bg-white p-3.5 rounded-xl border border-earth-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-earth-600">
              {village.isCustom ? 'DEM Grid Source' : 'Historical Threat Activity'}
            </div>
            <div className="text-lg font-heading font-extrabold text-earth-950">
              {village.isCustom ? (village.slopeSource || 'Open-Meteo DEM') : `${hiAval} Recorded Events`}
            </div>
            <div className="text-[11px] font-medium text-earth-700">
              {village.isCustom ? 'Dynamic satellite elevation grid' : 'Historical avalanche path validation'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
