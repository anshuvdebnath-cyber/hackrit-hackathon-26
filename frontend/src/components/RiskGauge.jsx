import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Droplets, Mountain, Compass, MapPin } from 'lucide-react';
import { getRiskColor } from '../services/riskService';
import { useCountUp } from '../hooks/useCountUp';

export default function RiskGauge({ village }) {
  if (!village) return null;

  const avalScore = village.avalancheRisk?.score ?? 0;
  const avalLevel = village.avalancheRisk?.level ?? 'Low';
  const floodScore = village.floodRisk?.score ?? 0;
  const floodLevel = village.floodRisk?.level ?? 'Low';

  const animatedAvalScore = useCountUp(avalScore, 900, avalScore % 1 !== 0 ? 1 : 0, village.id);
  const animatedFloodScore = useCountUp(floodScore, 900, 0, village.id);

  const avalColor = getRiskColor(avalLevel);
  const floodColor = getRiskColor(floodLevel);

  // SVG Gauge calculations (circumference for radius 44 is 2 * PI * 44 ≈ 276.46)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const avalDashoffset = circumference - (avalScore / 100) * circumference;
  const floodDashoffset = circumference - (floodScore / 100) * circumference;

  // Advisory message based on level
  const getActionAdvisory = (level) => {
    if (level === 'High') {
      return {
        title: 'Emergency Advisory: High Risk Zone',
        instruction: 'All backcountry trekking, high-altitude passes, and exposed ridge crossings must be halted. Village disaster cells to monitor gully runout zones.',
        badgeBg: 'bg-clay-100/90 text-clay-900 border-clay-300 shadow-sm'
      };
    }
    if (level === 'Moderate') {
      return {
        title: 'Caution Advised: Moderate Instability',
        instruction: 'Guide escort and avalanche beacon/probe mandatory. Stay on designated windward aspects. Avoid slopes between 32° and 45° during peak sunlight.',
        badgeBg: 'bg-terracotta-100/90 text-terracotta-900 border-terracotta-300 shadow-sm'
      };
    }
    return {
      title: 'Normal Operational Level',
      instruction: 'Snowpack within historical stability threshold. Standard weather tracking and backcountry registration remain active.',
      badgeBg: 'bg-moss-100/90 text-moss-900 border-moss-300 shadow-sm'
    };
  };

  const advisory = getActionAdvisory(avalLevel);

  return (
    <div className="bg-earth-50 rounded-2xl p-6 border border-earth-200 shadow-sm space-y-5">
       {/* Header Info for Selected Village */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-earth-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-terracotta-600" />
            <span className="text-xs sm:text-sm font-bold text-terracotta-700 tracking-wider uppercase font-heading">
              {village.region} · {village.district} District
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-earth-950 tracking-tight mt-1">
            {village.fullName || village.name}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold border shadow-sm font-heading" style={{
            backgroundColor: `${avalColor}15`,
            color: avalColor,
            borderColor: `${avalColor}40`
          }}>
            Status: {avalLevel} Threat
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm bg-earth-200/90 text-earth-900 font-bold border border-earth-300/80 font-mono shadow-sm">
            Alt: {village.elevation}m
          </span>
        </div>
      </div>

      {/* Gauges Row: Avalanche Risk & Flood Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Avalanche Risk Radial Gauge Card */}
        <div className="bg-white rounded-2xl p-5 border border-earth-200/90 shadow-sm flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e8e2d8"
                strokeWidth="9"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={avalColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={avalDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>

            {/* Score in Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className="text-3xl font-extrabold font-heading text-earth-950 leading-none tabular-nums">
                {animatedAvalScore}
              </span>
              <span className="text-xs uppercase font-bold text-earth-600 mt-0.5 font-mono">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-700 font-heading mb-1">
              <Mountain className="w-4 h-4 text-terracotta-600" />
              <span>AVALANCHE RISK</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xl font-heading font-extrabold" style={{ color: avalColor }}>
                {avalLevel}
              </span>
              <span className="text-xs text-earth-600 font-medium">
                {avalScore >= 70 ? 'Urgent warning' : avalScore >= 40 ? 'Heightened vigilance' : 'Baseline stability'}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-earth-700 leading-relaxed font-normal">
              {village.statusSummary || 'Evaluation based on fresh snow accumulation, slope shear angle, and crest wind loading.'}
            </p>
          </div>
        </div>

        {/* Flood Risk Radial Gauge Card */}
        <div className="bg-white rounded-2xl p-5 border border-earth-200/90 shadow-sm flex items-center gap-5">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e8e2d8"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={floodColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={floodDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span className="text-3xl font-extrabold font-heading text-earth-950 leading-none tabular-nums">
                {animatedFloodScore}
              </span>
              <span className="text-xs uppercase font-bold text-earth-600 mt-0.5 font-mono">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-earth-700 font-heading mb-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>FLASH FLOOD / GLOF RISK</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xl font-heading font-extrabold" style={{ color: floodColor }}>
                {floodLevel}
              </span>
              <span className="text-xs text-earth-600 font-medium">
                Runoff saturation factor
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-earth-700 leading-relaxed font-normal">
              Monitored via 24h rainfall ({village.weather?.rainfall24h ?? 0}mm) and rain-on-snow hydraulic saturation.
            </p>
          </div>
        </div>

      </div>

      {/* Official Advisory Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${advisory.badgeBg}`}>
        {avalLevel === 'High' ? (
          <ShieldAlert className="w-6 h-6 flex-shrink-0 text-clay-700 mt-0.5" />
        ) : avalLevel === 'Moderate' ? (
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-terracotta-700 mt-0.5" />
        ) : (
          <CheckCircle className="w-6 h-6 flex-shrink-0 text-moss-700 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider mb-1">
            {advisory.title}
          </h4>
          <p className="text-xs sm:text-sm font-medium opacity-95 leading-relaxed">
            {advisory.instruction}
          </p>
        </div>
      </div>

    </div>
  );
}
