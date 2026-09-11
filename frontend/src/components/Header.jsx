import React from 'react';
import { Mountain, ShieldAlert, Compass, Sliders, Table, RefreshCw, ChevronDown } from 'lucide-react';

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
    <header className="sticky top-3 sm:top-5 z-[100] w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Floating Island Container */}
      <div className="bg-earth-900/90 backdrop-blur-xl border border-earth-800/90 shadow-2xl shadow-earth-950/25 rounded-2xl lg:rounded-full px-4 sm:px-6 py-2.5 sm:py-3 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-6">
          
          {/* Left: Brand & Live Sensor Telemetry Badge */}
          <div className="flex items-center justify-between sm:justify-start space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-clay-600 flex items-center justify-center shadow-md shadow-terracotta-900/40 text-white flex-shrink-0">
                <Mountain className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-earth-50 leading-none">
                    Terra Watch
                  </h1>
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-earth-800/90 text-terracotta-300 border border-earth-700/80">
                    Himalayas
                  </span>
                </div>
                <p className="text-[11px] text-earth-400 font-medium hidden sm:block mt-0.5">
                  Early Warning & Avalanche Intelligence
                </p>
              </div>
            </div>

            {/* Live Telemetry Ping */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-moss-500/15 text-moss-300 border border-moss-500/30 text-[10px] sm:text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-moss-400 animate-pulse"></span>
              <span className="tracking-wide">Live Telemetry</span>
            </div>
          </div>

          {/* Center: Navigation Tabs Capsule */}
          <nav className="flex items-center justify-center bg-earth-950/70 p-1 rounded-xl sm:rounded-full border border-earth-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-900/30 font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Risk Map</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-900/30 font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Multi-Village</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg sm:rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-900/30 font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Sandbox</span>
            </button>
          </nav>

          {/* Right: Village Sector Selector & Satellite Sync Action */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
            
            {/* Styled Sector Dropdown with Chevron */}
            <div className="relative">
              <label htmlFor="village-select" className="sr-only">Select Village</label>
              <select
                id="village-select"
                value={selectedVillageId}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="appearance-none bg-earth-950/70 text-earth-100 text-xs sm:text-sm rounded-xl sm:rounded-full pl-3.5 pr-8 py-2 border border-earth-800/90 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-inner font-medium cursor-pointer hover:border-earth-700 transition"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id} className="bg-earth-900 text-earth-100 py-1">
                    {v.name} ({v.region}) · {v.avalancheRisk?.level || 'Active'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-earth-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Live Satellite Sync Action Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl sm:rounded-full bg-earth-800/90 hover:bg-earth-700 text-terracotta-300 hover:text-terracotta-200 border border-earth-700/80 hover:border-earth-600 text-xs font-semibold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-60 cursor-pointer flex-shrink-0"
                title="Force immediate live Open-Meteo satellite feed sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-terracotta-400' : 'text-moss-400'}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Live Satellite Sync'}</span>
                <span className="sm:hidden">{isRefreshing ? '...' : 'Sync'}</span>
              </button>
            )}

            {/* High Risk Alert Badge (only shown when alerts active) */}
            {highRiskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl sm:rounded-full bg-clay-500/20 text-clay-200 border border-clay-500/40 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-clay-300" />
                <span>{highRiskCount} Alert{highRiskCount > 1 ? 's' : ''}</span>
              </span>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
