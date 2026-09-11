import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Droplets, Mountain, Compass, MapPin } from 'lucide-react';
import { getRiskColor } from './VillageMap';

export default function RiskGauge({ village }) {
  if (!village) return null;

  const avalScore = village.avalancheRisk?.score ?? 0;
  const avalLevel = village.avalancheRisk?.level ?? 'Low';
  const floodScore = village.floodRisk?.score ?? 0;
  const floodLevel = village.floodRisk?.level ?? 'Low';

  const avalColor = getRiskColor(avalLevel);
  const floodColor = getRiskColor(floodLevel);

  // SVG Gauge calculations (circumference for radius 45 is 2 * PI * 45 � 282.7)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const avalDashoffset = circumference - (avalScore / 100) * circumference;
  const floodDashoffset = circumference - (floodScore / 100) * circumference;

  // Advisory message based on level
  const getActionAdvisory = (level) => {
    if (level === 'High') {
      return {
        title: 'Emergency Advisory: High Risk Zone',
        instruction: 'All backcountry trekking, high-altitude passes, and exposed ridge crossings must be halted. Village disaster cells to monitor gully runout zones.',
        badgeBg: 'bg-clay-100 text-clay-800 border-clay-300'
      };
    }
    if (level === 'Moderate') {
      return {
        title: 'Caution Advised: Moderate Instability',
        instruction: 'Guide escort and avalanche beacon/probe mandatory. Stay on designated windward aspects. Avoid slopes between 32� and 45� during peak sunlight.',
        badgeBg: 'bg-terracotta-100 text-terracotta-800 border-terracotta-300'
      };
    }
    return {
      title: 'Normal Operational Level',
      instruction: 'Snowpack within historical stability threshold. Standard weather tracking and backcountry registration remain active.',
      badgeBg: 'bg-moss-100 text-moss-800 border-moss-300'
    };
  };

  const advisory = getActionAdvisory(avalLevel);

  return (
    <div className="bg-earth-50 rounded-2xl p-6 border border-earth-200 shadow-sm space-y-6">
      
      {/* Header Info for Selected Village */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-earth-200 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-terracotta-600" />
            <span className="text-xs font-semibold text-terracotta-700 tracking-wide uppercase">
              {village.region} � {village.district} District
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-earth-900 mt-0.5">
            {village.fullName || village.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{
            backgroundColor: `${avalColor}15`,
            color: avalColor,
            borderColor: `${avalColor}40`
          }}>
            Status: {avalLevel} Threat
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs bg-earth-200/70 text-earth-800 font-medium">
            Alt: {village.elevation}m
          </span>
        </div>
      </div>

      {/* Gauges Row: Avalanche Risk & Flood Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Avalanche Risk Radial Gauge Card */}
        <div className="bg-white rounded-xl p-4 border border-earth-200/80 shadow-sm flex items-center gap-4">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e5dfd3"
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
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold font-serif text-earth-900 leading-none">
                {avalScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-earth-500 mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-earth-600 mb-1">
              <Mountain className="w-3.5 h-3.5 text-terracotta-600" />
              <span>AVALANCHE RISK</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold" style={{ color: avalColor }}>
                {avalLevel}
              </span>
              <span className="text-xs text-earth-500">
                {avalScore >= 70 ? 'Urgent warning' : avalScore >= 40 ? ' heightened vigilance' : 'baseline safety'}
              </span>
            </div>
            <p className="text-xs text-earth-600 mt-1 leading-relaxed line-clamp-2">
              {village.statusSummary || 'Evaluation based on fresh snow accumulation, slope shear angle, and crest wind loading.'}
            </p>
          </div>
        </div>

        {/* Flood Risk Radial Gauge Card */}
        <div className="bg-white rounded-xl p-4 border border-earth-200/80 shadow-sm flex items-center gap-4">
          <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#e5dfd3"
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

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold font-serif text-earth-900 leading-none">
                {floodScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-earth-500 mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-earth-600 mb-1">
              <Droplets className="w-3.5 h-3.5 text-blue-600" />
              <span>FLASH FLOOD / GLOF RISK</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold" style={{ color: floodColor }}>
                {floodLevel}
              </span>
              <span className="text-xs text-earth-500">
                Runoff factor
              </span>
            </div>
            <p className="text-xs text-earth-600 mt-1 leading-relaxed line-clamp-2">
              Monitored via 24h rainfall ({village.weather?.rainfall24h ?? 0}mm) and rain-on-snow hydraulic saturation.
            </p>
          </div>
        </div>

      </div>

      {/* Official Advisory Banner */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${advisory.badgeBg}`}>
        {avalLevel === 'High' ? (
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-clay-600 mt-0.5" />
        ) : avalLevel === 'Moderate' ? (
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-terracotta-600 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 flex-shrink-0 text-moss-600 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
            {advisory.title}
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            {advisory.instruction}
          </p>
        </div>
      </div>

    </div>
  );
}
