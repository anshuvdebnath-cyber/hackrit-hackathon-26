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
    <header className="sticky top-4 sm:top-5 z-[100] w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Floating Island Container - Slim Horizontal Capsule */}
      <div className="bg-earth-900/95 backdrop-blur-xl border border-earth-800/90 shadow-xl shadow-earth-950/25 rounded-full px-4 sm:px-6 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-4 w-full">
          
          {/* 1. Left: Brand & Live Indicator (Single Line) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-terracotta-500 to-clay-600 flex items-center justify-center shadow-md text-white flex-shrink-0">
              <Mountain className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-earth-50">
                Terra Watch
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-earth-800 text-terracotta-300 border border-earth-700 hidden sm:inline-block">
                Himalayas
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full bg-moss-500/15 text-moss-300 text-[10px] font-medium border border-moss-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-moss-400 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>

          {/* 2. Center: Slim Segmented Navigation Tabs */}
          <nav className="flex items-center bg-earth-950/70 p-1 rounded-full border border-earth-800/80 shadow-inner flex-shrink-0">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-terracotta-500 text-white shadow-md font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Risk Map</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-terracotta-500 text-white shadow-md font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Multi-Village</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-terracotta-500 text-white shadow-md font-bold'
                  : 'text-earth-300 hover:text-white hover:bg-earth-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If</span>
            </button>
          </nav>

          {/* 3. Right: Village Sector Selector & Satellite Sync (Side-by-Side) */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            
            {/* Styled Sector Dropdown with Chevron */}
            <div className="relative hidden sm:block">
              <label htmlFor="village-select" className="sr-only">Select Village</label>
              <select
                id="village-select"
                value={selectedVillageId}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="appearance-none bg-earth-950/70 text-earth-100 text-xs rounded-full pl-3.5 pr-7 py-1.5 border border-earth-800 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-inner font-medium cursor-pointer hover:border-earth-700 transition"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id} className="bg-earth-900 text-earth-100 py-1">
                    {v.name} · {v.avalancheRisk?.level || 'Active'}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-earth-400">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Live Satellite Sync Action Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-earth-800 hover:bg-earth-700 text-terracotta-300 hover:text-terracotta-200 border border-earth-700 hover:border-earth-600 text-xs font-semibold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-60 cursor-pointer whitespace-nowrap flex-shrink-0"
                title="Force immediate live Open-Meteo satellite feed sync"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-terracotta-400' : 'text-moss-400'}`} />
                <span className="hidden md:inline">{isRefreshing ? 'Syncing...' : 'Live Satellite Sync'}</span>
                <span className="md:hidden">{isRefreshing ? '...' : 'Sync'}</span>
              </button>
            )}

            {/* High Risk Alert Badge (only shown when alerts active) */}
            {highRiskCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-clay-500/20 text-clay-200 border border-clay-500/40 text-xs font-bold animate-pulse">
                <ShieldAlert className="w-3 h-3 text-clay-300" />
                <span>{highRiskCount}</span>
              </span>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
