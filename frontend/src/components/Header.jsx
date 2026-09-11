import React from 'react';
import { Mountain, ShieldAlert, Compass, Sliders, Table, RefreshCw, ChevronDown, Satellite } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  villages, 
  selectedVillageId, 
  onSelectVillage,
  highRiskCount,
  dataSource = 'backend',
  isRefreshing = false,
  onRefresh
}) {
  return (
    <header className="sticky top-4 sm:top-6 z-[100] w-full px-4 sm:px-8 max-w-[1440px] mx-auto">
      {/* Floating Island Container - Roomy, Expansive & Premium */}
      <div className="bg-earth-900/95 backdrop-blur-2xl border border-earth-800 shadow-2xl shadow-earth-950/35 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-5 transition-all duration-300">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 xl:gap-8">
          
          {/* 1. Left: Brand & Telemetry Status Chip */}
          <div className="flex items-center justify-between sm:justify-start gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-terracotta-500 via-clay-600 to-terracotta-700 flex items-center justify-center shadow-lg shadow-terracotta-900/40 text-white flex-shrink-0">
                <Mountain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-earth-50 leading-none">
                    Terra Watch
                  </h1>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md bg-earth-800/90 text-terracotta-300 border border-earth-700/80">
                    Himalayas
                  </span>
                </div>
                <p className="text-xs text-earth-400 font-medium mt-1 hidden sm:block">
                  Real-Time Avalanche & Flash Flood Early Warning System
                </p>
              </div>
            </div>

            {/* Live Telemetry Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-moss-500/15 text-moss-300 border border-moss-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-moss-400 animate-pulse"></span>
              <span className="tracking-wide">Live Feed</span>
            </div>
          </div>

          {/* 2. Center: Large Navigation Tabs Pill */}
          <nav className="flex items-center justify-center bg-earth-950/80 p-1.5 rounded-full border border-earth-800 shadow-inner gap-1.5 self-center xl:self-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-lg shadow-terracotta-900/40 font-bold scale-[1.02]'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Risk Map</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-lg shadow-terracotta-900/40 font-bold scale-[1.02]'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Multi-Village</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2.5 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-lg shadow-terracotta-900/40 font-bold scale-[1.02]'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>What-If Sandbox</span>
            </button>
          </nav>

          {/* 3. Right: Village Sector Selector & Prominent Satellite Sync Button */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3.5 sm:gap-4">
            
            {/* Styled Sector Dropdown with Chevron */}
            <div className="relative">
              <label htmlFor="village-select" className="sr-only">Select Village</label>
              <select
                id="village-select"
                value={selectedVillageId}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="appearance-none bg-earth-950/80 text-earth-100 text-sm rounded-full pl-5 pr-10 py-2.5 border border-earth-800 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-inner font-medium cursor-pointer hover:border-earth-700 transition"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id} className="bg-earth-900 text-earth-100 py-1.5">
                    {v.name} ({v.region}) · {v.avalancheRisk?.level || 'Active'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-earth-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Live Satellite Sync Action Button - Prominent & Comfortable */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-earth-800 to-earth-850 hover:from-earth-750 hover:to-earth-800 text-terracotta-300 hover:text-terracotta-200 border border-earth-700 hover:border-earth-600 text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer flex-shrink-0"
                title="Force immediate live Open-Meteo satellite feed sync"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-terracotta-400' : 'text-moss-400'}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Live Satellite Sync'}</span>
              </button>
            )}

            {/* High Risk Alert Badge (only shown when alerts active) */}
            {highRiskCount > 0 && (
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-clay-500/20 text-clay-200 border border-clay-500/40 text-sm font-bold animate-pulse">
                <ShieldAlert className="w-4 h-4 text-clay-300" />
                <span>{highRiskCount} Alert{highRiskCount > 1 ? 's' : ''}</span>
              </span>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
