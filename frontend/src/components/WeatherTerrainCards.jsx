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
  Sparkles
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

  // Dynamic DEM Grid Source resolving per-point coordinates & topography
  const getDemSourceInfo = () => {
    const elev = Number(elevation) || 0;
    const isOcean = !!village.isOcean || elev <= 0;
    const latNum = village.lat != null ? Number(village.lat) : 32.5;
    const lngNum = village.lng != null ? Number(village.lng) : 77.0;
    const coordStr = `${latNum.toFixed(2)}°, ${lngNum.toFixed(2)}°`;

    const tileLat = Math.floor(Math.abs(latNum));
    const tileLng = Math.floor(Math.abs(lngNum));
    const tileStr = village.demTile || `N${tileLat < 10 ? '0' + tileLat : tileLat}E${tileLng < 100 ? '0' + tileLng : tileLng}`;

    if (isOcean) {
      return {
        title: 'DEM Grid Source',
        value: `GEBCO Marine · ${tileStr}`,
        desc: `0m Sea level datum · ${coordStr}`
      };
    }

    // Dynamic resolution based on elevation & slope gradients
    let gridName = village.demGridSource;
    if (!gridName) {
      if (elev >= 4200 || slope >= 38) {
        gridName = 'ALOS PALSAR 12.5m';
      } else if (elev >= 2200) {
        gridName = 'Copernicus 30m GLO';
      } else if (elev >= 800) {
        gridName = 'Copernicus 90m DEM';
      } else {
        gridName = 'SRTM 90m Elevation';
      }
    } else {
      gridName = gridName.replace(' DEM', '').replace(' Grid', '');
    }

    // Dynamic relief delta across 500m sampling cell
    const relief = village.reliefDelta != null 
      ? village.reliefDelta 
      : Math.max(8, Math.round(Math.tan((slope * Math.PI) / 180) * 500));

    return {
      title: 'DEM Grid Source',
      value: `${gridName} · ${tileStr}`,
      desc: `Cell Relief: Δ${relief}m / 500m · ${coordStr}`
    };
  };

  const demInfo = getDemSourceInfo();

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
            {village.isCustom ? (
              <span className="text-[11px] font-mono font-bold text-moss-800 bg-moss-100/90 px-2 py-0.5 rounded border border-moss-300 shadow-xs inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-moss-600" />
                <span>Custom Point Telemetry</span>
              </span>
            ) : (
              <>
                <span className="text-xs font-semibold text-earth-700">{village.fullName || village.name}</span>
                {village.dgReClassification && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${
                    village.dgReClassification.includes('Red')
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {village.dgReClassification} · {village.hazardTier}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <span className="text-xs text-earth-700 font-medium text-left sm:text-right">
          Source: Open-Meteo live
          {obsTime ? <span className="block text-[11px] font-mono text-earth-600 font-semibold">Obs: {obsTime}</span> : null}
        </span>
      </div>

      {/* Grid of Telemetry Cards — all values aligned at the exact same level */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-stretch">
        
        {/* 1. Temperature Card */}
        <div className="bg-white p-3 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {Number(animatedTemp) > 0 ? `+${animatedTemp}` : animatedTemp}°C
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-6 flex items-center leading-snug">
              {temp <= 0 ? 'Sub-zero freeze' : 'Above freeze; thaw risk'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            raw {tempRaw}°C{humidity != null ? ` · RH ${humidity}%` : ''}
          </div>
        </div>

        {/* 2. Wind Speed Card */}
        <div className="bg-white p-3 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Wind Speed</span>
            <Wind className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedWind} <span className="text-xs font-normal text-earth-600 font-sans">km/h</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-6 flex items-center leading-snug">
              {isHighWind ? 'Active wind-slab drift' : 'Light breeze'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            ridge telemetry · live
          </div>
        </div>

        {/* 3. 24h Snowfall Card */}
        <div className="bg-white p-3 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">24h Snowfall</span>
            <CloudSnow className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedSnow} <span className="text-xs font-normal text-earth-600 font-sans">cm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-6 flex items-center leading-snug">
              {snowFall24h >= 10 ? 'Heavy fresh load' : snowFall24h > 0 ? 'Light dusting' : 'No new snowfall'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            daily sum · 24h
          </div>
        </div>

        {/* 4. 24h Liquid Rain Card */}
        <div className="bg-white p-3 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">24h Rain</span>
            <CloudRain className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedRain} <span className="text-xs font-normal text-earth-600 font-sans">mm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-6 flex items-center leading-snug">
              {rain24h > 5 ? 'Rain-on-snow destabilizer' : rain24h > 0 ? 'Minimal liquid precip' : 'Dry conditions'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            daily sum · 24h
          </div>
        </div>

        {/* 5. Total Snowpack Depth Card */}
        <div className="bg-white p-3 rounded-xl border border-earth-200/90 shadow-sm flex flex-col justify-between h-full min-h-[120px]">
          <div className="flex items-center justify-between text-earth-700 h-5 gap-1">
            <span className="text-xs font-bold font-heading truncate">Snowpack</span>
            <Layers className="w-3.5 h-3.5 text-terracotta-600 flex-shrink-0" />
          </div>
          <div className="my-0.5">
            <div className="text-xl sm:text-2xl font-heading font-extrabold text-earth-950 tabular-nums">
              {animatedSnowPack} <span className="text-xs font-normal text-earth-600 font-sans">cm</span>
            </div>
            <div className="text-[11px] text-earth-700 font-medium h-6 flex items-center leading-snug">
              {snowPack >= 50 ? 'Substantial slab base' : snowPack >= 15 ? 'Moderate snowpack' : 'Minimal / bare ground'}
            </div>
          </div>
          <div className="text-[10px] text-earth-600 font-mono font-semibold pt-1 border-t border-earth-100/90 truncate">
            hourly match · live
          </div>
        </div>

      </div>

      {/* Terrain DEM Parameters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-stretch">
        
        {/* Slope Angle Card with Criticality indicator */}
        <div className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-2.5 h-full ${
          isCriticalSlope 
            ? 'bg-clay-50/80 border-clay-300 text-clay-950' 
            : 'bg-white border-earth-200 text-earth-900'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isCriticalSlope ? 'bg-clay-500 text-white' : 'bg-earth-100 text-earth-800'
          }`}>
            <Mountain className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-85 leading-normal">
              Incline Gradient
            </div>
            <div className="text-sm sm:text-base font-heading font-extrabold leading-snug mt-0.5">
              {slope}° Slope
            </div>
            <div className="text-[11px] font-medium opacity-90 leading-tight mt-0.5">
              {isCriticalSlope ? 'Within peak shear zone (30°-45°)' : 'Outside prime release zone'}
            </div>
          </div>
        </div>

        {/* Elevation & Aspect */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-earth-200 flex items-start gap-2.5 h-full">
          <div className="w-8 h-8 rounded-lg bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-earth-600 leading-normal">
              Elevation & Aspect
            </div>
            <div className="text-sm sm:text-base font-heading font-extrabold text-earth-950 leading-snug mt-0.5">
              {elevation}m · {aspect}
            </div>
            <div className="text-[11px] font-medium text-earth-700 leading-tight mt-0.5">
              {village.vegetation || ((elevation <= 0 || village.isOcean) ? 'Sea Surface' : elevation > 3500 ? 'Alpine Glacial / Permafrost' : elevation > 2500 ? 'Subalpine Conifer' : 'Valley Floor')}
            </div>
          </div>
        </div>

        {/* Avalanche Release History / DEM Grid Source */}
        <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-earth-200 flex items-start gap-2.5 h-full">
          <div className="w-8 h-8 rounded-lg bg-earth-100 text-earth-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-earth-600 leading-normal">
              {demInfo.title}
            </div>
            <div className="text-sm sm:text-base font-heading font-extrabold text-earth-950 leading-snug mt-0.5">
              {demInfo.value}
            </div>
            <div className="text-[11px] font-medium text-earth-700 leading-tight mt-0.5">
              {demInfo.desc}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
