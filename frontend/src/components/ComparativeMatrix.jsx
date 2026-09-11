import React, { useState } from 'react';
import { ShieldAlert, ArrowUpDown, Filter, Search, ExternalLink, Mountain, Wind, Thermometer, Droplets } from 'lucide-react';
import { getRiskColor, getRiskBgClass } from '../services/riskService';

export default function ComparativeMatrix({ villages, onSelectVillage, onSwitchToMap }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('avalancheScore');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter
  const filteredVillages = villages.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.district?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterLevel === 'ALL') return matchesSearch;
    return matchesSearch && v.avalancheRisk?.level?.toUpperCase() === filterLevel;
  });

  // Sort
  const sortedVillages = [...filteredVillages].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortBy === 'avalancheScore') {
      valA = a.avalancheRisk?.score ?? 0;
      valB = b.avalancheRisk?.score ?? 0;
    } else if (sortBy === 'floodScore') {
      valA = a.floodRisk?.score ?? 0;
      valB = b.floodRisk?.score ?? 0;
    } else if (sortBy === 'elevation') {
      valA = a.elevation ?? 0;
      valB = b.elevation ?? 0;
    } else if (sortBy === 'slopeAngle') {
      valA = a.slopeAngle ?? 0;
      valB = b.slopeAngle ?? 0;
    } else if (sortBy === 'snowfall') {
      valA = a.weather?.snowfall24h ?? 0;
      valB = b.weather?.snowfall24h ?? 0;
    }

    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-earth-50 rounded-2xl p-6 border border-earth-200 shadow-sm space-y-6">
      
      {/* Top Header & Search/Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-earth-200 pb-5">
        <div>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-terracotta-700 font-heading">
            Disaster Management Multi-Sector View
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-earth-900 mt-0.5">
            Himalayan Regional Risk Matrix
          </h2>
          <p className="text-xs sm:text-sm text-earth-700 font-medium">
            Consolidated overview across monitored high-altitude Himalayan sectors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter village or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs sm:text-sm bg-white rounded-lg border border-earth-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 text-earth-800 w-52 shadow-sm font-medium"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex rounded-lg bg-earth-200/80 p-1 text-xs sm:text-sm font-semibold font-heading">
            {['ALL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterLevel === lvl
                    ? 'bg-white text-earth-900 shadow-sm font-bold'
                    : 'text-earth-600 hover:text-earth-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-earth-200 shadow-sm bg-white">
        <table className="w-full text-left text-xs sm:text-sm text-earth-800">
          <thead className="bg-earth-100/90 text-xs uppercase font-bold text-earth-800 font-heading tracking-wider border-b border-earth-200">
            <tr>
              <th className="py-3 px-4">Village & Sector</th>
              <th className="py-3 px-3 cursor-pointer hover:bg-earth-200/60" onClick={() => handleSort('elevation')}>
                <div className="flex items-center gap-1">
                  <span>Elevation</span>
                  <ArrowUpDown className="w-3 h-3 text-earth-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:bg-earth-200/60" onClick={() => handleSort('slopeAngle')}>
                <div className="flex items-center gap-1">
                  <span>Slope Angle</span>
                  <ArrowUpDown className="w-3 h-3 text-earth-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:bg-earth-200/60" onClick={() => handleSort('avalancheScore')}>
                <div className="flex items-center gap-1">
                  <span>Avalanche Risk</span>
                  <ArrowUpDown className="w-3 h-3 text-terracotta-600" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:bg-earth-200/60" onClick={() => handleSort('floodScore')}>
                <div className="flex items-center gap-1">
                  <span>Flood Risk</span>
                  <ArrowUpDown className="w-3 h-3 text-earth-400" />
                </div>
              </th>
              <th className="py-3 px-3 cursor-pointer hover:bg-earth-200/60" onClick={() => handleSort('snowfall')}>
                <div className="flex items-center gap-1">
                  <span>Weather 24h</span>
                  <ArrowUpDown className="w-3 h-3 text-earth-400" />
                </div>
              </th>
              <th className="py-3 px-3">Top Hazard Factor</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {sortedVillages.map((village) => {
              const avalScore = village.avalancheRisk?.score ?? 0;
              const avalLevel = village.avalancheRisk?.level ?? 'Low';
              const floodScore = village.floodRisk?.score ?? 0;
              const floodLevel = village.floodRisk?.level ?? 'Low';
              const topFactor = village.topFactors?.[0]?.name || 'Slope Incline';

              return (
                <tr key={village.id} className="hover:bg-earth-50/80 transition-colors">
                  
                  {/* Village Info */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-earth-900 text-sm sm:text-base font-heading">
                      {village.name}
                    </div>
                    <div className="text-xs text-earth-600 font-medium">
                      {village.region} · {village.district}
                    </div>
                  </td>

                  {/* Elevation */}
                  <td className="py-3.5 px-3 font-mono font-semibold text-earth-800 text-xs sm:text-sm">
                    {village.elevation}m
                  </td>

                  {/* Slope Angle */}
                  <td className="py-3.5 px-3">
                    <span className={`font-mono font-bold text-xs sm:text-sm px-2 py-0.5 rounded ${
                      village.slopeAngle >= 30 && village.slopeAngle <= 45
                        ? 'bg-clay-100 text-clay-800'
                        : 'bg-earth-100 text-earth-700'
                    }`}>
                      {village.slopeAngle}°
                    </span>
                  </td>

                  {/* Avalanche Risk */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getRiskColor(avalLevel) }}
                      ></span>
                      <span className="font-mono font-extrabold text-sm sm:text-base" style={{ color: getRiskColor(avalLevel) }}>
                        {avalScore}
                      </span>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
                        style={{
                          backgroundColor: `${getRiskColor(avalLevel)}15`,
                          color: getRiskColor(avalLevel)
                        }}
                      >
                        {avalLevel}
                      </span>
                    </div>
                  </td>

                  {/* Flood Risk */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-earth-800 text-xs sm:text-sm">
                        {floodScore}
                      </span>
                      <span className="text-xs text-earth-600 font-medium">
                        ({floodLevel})
                      </span>
                    </div>
                  </td>

                  {/* Weather — live Open-Meteo telemetry per village */}
                  <td className="py-3.5 px-3">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-earth-900">{village.weather?.temperature}°C</span> ·{' '}
                      <span className="font-semibold text-blue-700">{village.weather?.snowfall24h ?? village.weather?.snowfall_24h ?? 0}cm snow/24h</span>
                    </div>
                    <div className="text-xs text-earth-600 mt-0.5">
                      pack {village.weather?.snowDepth ?? village.weather?.snow_depth ?? 0}cm · rain {village.weather?.rainfall24h ?? village.weather?.rainfall ?? 0}mm · {village.weather?.windSpeed ?? village.weather?.wind_speed ?? 0} km/h wind
                    </div>
                    <div className="text-xs font-mono text-earth-600 font-semibold mt-0.5">
                      {village.weather?.observationTime ?? ''} · {village.weather?.source ?? ''}
                    </div>
                  </td>

                  {/* Primary Trigger */}
                  <td className="py-3.5 px-3">
                    <span className="inline-block px-2.5 py-1 rounded bg-earth-100 text-earth-800 font-semibold text-xs">
                      {topFactor}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectVillage(village.id);
                        onSwitchToMap();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-700 border border-terracotta-300 rounded-lg text-xs sm:text-sm font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      <span>Focus</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
