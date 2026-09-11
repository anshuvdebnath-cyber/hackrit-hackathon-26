import React from 'react';
import { Mountain, ShieldAlert, Activity, Compass, Layers, Sliders, Table } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  villages, 
  selectedVillageId, 
  onSelectVillage,
  highRiskCount
}) {
  return (
    <header className="bg-earth-900 text-earth-50 border-b border-earth-800 sticky top-0 z-[100] shadow-md">
      {/* Top Banner with Himalayan Monitoring Status */}
      <div className="bg-earth-950 px-4 py-1.5 border-b border-earth-800/60 text-xs flex flex-wrap items-center justify-between gap-2 text-earth-300">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-moss-500/20 text-moss-300 font-medium border border-moss-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-moss-400 animate-pulse"></span>
            Telemetry Online
          </span>
          <span className="hidden sm:inline text-earth-400">|</span>
          <span className="hidden sm:inline">HiAVAL Historical Database Synced</span>
          <span className="hidden md:inline text-earth-400">|</span>
          <span className="hidden md:inline">ALOS PALSAR 12.5m DEM Terrain Active</span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {highRiskCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-clay-500/30 text-clay-200 border border-clay-500/50 font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-clay-300" />
              {highRiskCount} High Risk Alert{highRiskCount > 1 ? 's' : ''} Active
            </span>
          ) : (
            <span className="text-moss-400">All monitored sectors normal</span>
          )}
          <span className="text-earth-400 hidden sm:inline">Himalayan Standard Time</span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-clay-600 flex items-center justify-center shadow-lg shadow-terracotta-900/40 text-white">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-earth-50">
                  Terra Watch
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-earth-800 text-terracotta-300 border border-earth-700">
                  Himalayas
                </span>
              </div>
              <p className="text-xs text-earth-400">
                Real-Time Avalanche & Flood Early Warning Dashboard
              </p>
            </div>
          </div>

          {/* Controls: Village Quick Selector & Nav Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Quick Village Dropdown */}
            <div className="relative">
              <label htmlFor="village-select" className="sr-only">Select Village</label>
              <select
                id="village-select"
                value={selectedVillageId}
                onChange={(e) => onSelectVillage(e.target.value)}
                className="bg-earth-800 text-earth-100 text-sm rounded-lg px-3.5 py-2 border border-earth-700 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-inner font-medium cursor-pointer"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.region}) � {v.avalancheRisk?.level || 'Active'}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center rounded-lg bg-earth-800/80 p-1 border border-earth-700">
              <button
                onClick={() => setActiveTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'map'
                    ? 'bg-terracotta-500 text-white shadow'
                    : 'text-earth-300 hover:text-white hover:bg-earth-700/50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Risk Map</span>
              </button>

              <button
                onClick={() => setActiveTab('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'matrix'
                    ? 'bg-terracotta-500 text-white shadow'
                    : 'text-earth-300 hover:text-white hover:bg-earth-700/50'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Multi-Village View</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-terracotta-500 text-white shadow'
                    : 'text-earth-300 hover:text-white hover:bg-earth-700/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>What-If Sandbox</span>
              </button>
            </nav>

          </div>

        </div>
      </div>
    </header>
  );
}
