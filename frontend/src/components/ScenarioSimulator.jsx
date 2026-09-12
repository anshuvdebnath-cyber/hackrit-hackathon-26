import React, { useState, useMemo, useEffect } from 'react';
import { Sliders, RotateCcw, AlertTriangle, Sparkles, Mountain, Wind, Thermometer, CloudSnow, CloudRain, Cpu } from 'lucide-react';
import { calculateSimulatedRisk, simulateScenarioApi, getRiskColor } from '../services/riskService';
import FeatureImportanceChart from './FeatureImportanceChart';

export default function ScenarioSimulator({ baseVillage }) {
  // Initialize sliders with base village or defaults
  const [snowDepth, setSnowDepth] = useState(baseVillage?.weather?.snowfall24h ?? 35);
  const [slopeAngle, setSlopeAngle] = useState(baseVillage?.slopeAngle ?? 38);
  const [windSpeed, setWindSpeed] = useState(baseVillage?.weather?.windSpeed ?? 22);
  const [temperature, setTemperature] = useState(baseVillage?.weather?.temperature ?? -3);
  const [rainfall, setRainfall] = useState(baseVillage?.weather?.rainfall24h ?? 0);
  const [backendResult, setBackendResult] = useState(null);
  const [isBackendSyncing, setIsBackendSyncing] = useState(false);

  // Debounced backend ML inference call
  useEffect(() => {
    let isMounted = true;
    setIsBackendSyncing(true);
    const timer = setTimeout(async () => {
      const result = await simulateScenarioApi({
        snow_depth: Number(snowDepth),
        slope_angle: Number(slopeAngle),
        wind_speed: Number(windSpeed),
        temperature: Number(temperature),
        rainfall: Number(rainfall)
      });
      if (isMounted) {
        setBackendResult(result);
        setIsBackendSyncing(false);
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [snowDepth, slopeAngle, windSpeed, temperature, rainfall]);

  // Instant zero-lag physical fallback
  const localResult = useMemo(() => {
    return calculateSimulatedRisk({
      snow_depth: Number(snowDepth),
      slope_angle: Number(slopeAngle),
      wind_speed: Number(windSpeed),
      temperature: Number(temperature),
      rainfall: Number(rainfall)
    });
  }, [snowDepth, slopeAngle, windSpeed, temperature, rainfall]);

  const activeResult = backendResult || localResult;
  const { avalancheRisk, floodRisk, topFactors, explanation } = activeResult;
  const avalColor = getRiskColor(avalancheRisk.level);

  const [activePreset, setActivePreset] = useState(null);

  // Preset Scenarios
  const applyPreset = (preset) => {
    setActivePreset(preset);
    if (preset === 'blizzard') {
      setSnowDepth(45);
      setSlopeAngle(41);
      setWindSpeed(35);
      setTemperature(-7);
      setRainfall(0);
    } else if (preset === 'rainOnSnow') {
      setSnowDepth(25);
      setSlopeAngle(38);
      setWindSpeed(12);
      setTemperature(3);
      setRainfall(32);
    } else if (preset === 'deepFreeze') {
      setSnowDepth(15);
      setSlopeAngle(35);
      setWindSpeed(24);
      setTemperature(-18);
      setRainfall(0);
    } else if (preset === 'stable') {
      setSnowDepth(5);
      setSlopeAngle(24);
      setWindSpeed(8);
      setTemperature(-4);
      setRainfall(0);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    setSnowDepth(baseVillage?.weather?.snowfall24h ?? 20);
    setSlopeAngle(baseVillage?.slopeAngle ?? 36);
    setWindSpeed(baseVillage?.weather?.windSpeed ?? 15);
    setTemperature(baseVillage?.weather?.temperature ?? -2);
    setRainfall(baseVillage?.weather?.rainfall24h ?? 0);
  };

  return (
    <div className="bg-earth-50 rounded-2xl p-6 border border-earth-200 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-earth-200/90 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-terracotta-600" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-terracotta-700 font-heading">
                Interactive Explainability Sandbox
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-earth-200/90 border border-earth-300/80 text-xs font-semibold text-earth-800 shadow-sm">
              <Cpu className={`w-3.5 h-3.5 ${isBackendSyncing ? 'animate-spin text-terracotta-600' : 'text-moss-600'}`} />
              <span>{isBackendSyncing ? 'Evaluating ML inference...' : (activeResult?.source === 'backend-ml' || activeResult?.source === 'live-fastapi-xgboost') ? 'FastAPI XGBoost Service' : 'Calibrated Physics Model'}</span>
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-earth-900 mt-1">
            What-If Scenario Simulator
          </h2>
          <p className="text-xs sm:text-sm text-earth-700 font-medium">
            Manipulate snowpack and meteorological triggers to see real-time model re-computation and factor shifts
          </p>
        </div>

        {/* Presets and Reset - Unified, Perfectly Aligned Toolbar */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start lg:self-center">
          <div className="inline-flex items-center bg-white p-1 rounded-xl border border-earth-300/80 shadow-sm">
            <span className="text-sm sm:text-base font-black text-earth-950 font-heading tracking-tight px-3 select-none">
              Presets:
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => applyPreset('blizzard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePreset === 'blizzard'
                    ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                    : 'text-earth-700 hover:bg-earth-100 hover:text-earth-900'
                }`}
              >
                Blizzard
              </button>
              <button
                onClick={() => applyPreset('rainOnSnow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePreset === 'rainOnSnow'
                    ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                    : 'text-earth-700 hover:bg-earth-100 hover:text-earth-900'
                }`}
              >
                Rain-on-Snow
              </button>
              <button
                onClick={() => applyPreset('deepFreeze')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePreset === 'deepFreeze'
                    ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                    : 'text-earth-700 hover:bg-earth-100 hover:text-earth-900'
                }`}
              >
                Deep Freeze
              </button>
              <button
                onClick={() => applyPreset('stable')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePreset === 'stable'
                    ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                    : 'text-earth-700 hover:bg-earth-100 hover:text-earth-900'
                }`}
              >
                Stable
              </button>
            </div>

            <div className="w-px h-5 bg-earth-200 mx-1.5" />

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-earth-600 hover:text-earth-900 hover:bg-earth-100 transition-all cursor-pointer"
              title="Reset parameters to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-earth-500" />
              <span className="font-heading hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Body: Sliders on left, Live Output & Chart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-earth-200/90 shadow-sm space-y-4">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-800 border-b border-earth-100 pb-2 font-heading">
            Terrain & Weather Parameters
          </h3>

          {/* 1. Snow Depth */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-earth-800 flex items-center gap-1.5 font-heading">
                <CloudSnow className="w-4 h-4 text-blue-500" />
                Fresh Snowfall (24h)
              </span>
              <span className="font-mono font-bold text-terracotta-700 bg-earth-100 px-2.5 py-0.5 rounded text-xs sm:text-sm">
                {snowDepth} cm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={snowDepth}
              onChange={(e) => {
                setSnowDepth(Number(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-earth-600 font-medium">
              <span>0 cm (Bare)</span>
              <span className="font-semibold text-earth-800">30 cm (Heavy Slab)</span>
              <span>100 cm (Extreme)</span>
            </div>
          </div>

          {/* 2. Slope Angle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-earth-800 flex items-center gap-1.5 font-heading">
                <Mountain className="w-4 h-4 text-earth-700" />
                Slope Incline Angle
              </span>
              <span className="font-mono font-bold text-terracotta-700 bg-earth-100 px-2.5 py-0.5 rounded text-xs sm:text-sm">
                {slopeAngle}°
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="55"
              step="1"
              value={slopeAngle}
              onChange={(e) => {
                setSlopeAngle(Number(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-earth-600 font-medium">
              <span>15° (Low)</span>
              <span className="text-clay-700 font-bold">38° (Peak Avalanche Hazard)</span>
              <span>55° (Sluff)</span>
            </div>
          </div>

          {/* 3. Wind Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-earth-800 flex items-center gap-1.5 font-heading">
                <Wind className="w-4 h-4 text-earth-700" />
                Crest Wind Speed
              </span>
              <span className="font-mono font-bold text-terracotta-700 bg-earth-100 px-2.5 py-0.5 rounded text-xs sm:text-sm">
                {windSpeed} km/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="1"
              value={windSpeed}
              onChange={(e) => {
                setWindSpeed(Number(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-earth-600 font-medium">
              <span>0 km/h (Calm)</span>
              <span>25 km/h (Drifting)</span>
              <span>70 km/h (Gale)</span>
            </div>
          </div>

          {/* 4. Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-earth-800 flex items-center gap-1.5 font-heading">
                <Thermometer className="w-4 h-4 text-terracotta-500" />
                Air Temperature
              </span>
              <span className="font-mono font-bold text-terracotta-700 bg-earth-100 px-2.5 py-0.5 rounded text-xs sm:text-sm">
                {temperature > 0 ? `+${temperature}` : temperature}°C
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="15"
              step="1"
              value={temperature}
              onChange={(e) => {
                setTemperature(Number(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-earth-600 font-medium">
              <span>-25°C (Facet)</span>
              <span>0°C (Isothermal)</span>
              <span>+15°C (Wet Slide)</span>
            </div>
          </div>

          {/* 5. Rainfall */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-earth-800 flex items-center gap-1.5 font-heading">
                <CloudRain className="w-4 h-4 text-blue-600" />
                Liquid Rainfall (24h)
              </span>
              <span className="font-mono font-bold text-terracotta-700 bg-earth-100 px-2.5 py-0.5 rounded text-xs sm:text-sm">
                {rainfall} mm
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={rainfall}
              onChange={(e) => {
                setRainfall(Number(e.target.value));
                setActivePreset(null);
              }}
              className="w-full accent-terracotta-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-earth-600 font-medium">
              <span>0 mm (Dry)</span>
              <span>20 mm (Saturation)</span>
              <span>50 mm (Torrents)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Live Output & Chart.js (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Live Score Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Avalanche Live Score */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-earth-200/90 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-600 font-heading">
                  Simulated Avalanche Risk
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-heading font-black" style={{ color: avalColor }}>
                    {avalancheRisk.score}
                  </span>
                  <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full uppercase" style={{
                    backgroundColor: `${avalColor}15`,
                    color: avalColor
                  }}>
                    {avalancheRisk.level}
                  </span>
                </div>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: avalColor }}
              >
                <Mountain className="w-6 h-6" />
              </div>
            </div>

            {/* Flood Live Score */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-earth-200/90 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-600 font-heading">
                  Simulated Flood Risk
                </span>
                <div className="flex items-baseline gap-2.5 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-heading font-black text-earth-900">
                    {floodRisk.score}
                  </span>
                  <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                    {floodRisk.level}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow">
                <CloudRain className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Dynamic Physical Explanation Banner */}
          <div className="bg-earth-100/90 p-4 rounded-xl border border-earth-300/80 text-xs sm:text-sm text-earth-800 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-terracotta-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-earth-900 block mb-0.5 font-heading text-sm sm:text-base">Physical Model Analysis:</span>
              <p className="leading-relaxed text-earth-800 font-medium">{explanation}</p>
            </div>
          </div>

          {/* Real-time Feature Importance Chart powered by Chart.js */}
          <FeatureImportanceChart
            factors={topFactors}
            villageName="Simulated Scenario"
            riskLevel={avalancheRisk.level}
          />

        </div>

      </div>

    </div>
  );
}
