import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VillageMap from './components/VillageMap';
import RiskGauge from './components/RiskGauge';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import WeatherTerrainCards from './components/WeatherTerrainCards';
import ComparativeMatrix from './components/ComparativeMatrix';
import ScenarioSimulator from './components/ScenarioSimulator';
import { fetchVillages, fetchVillageRisk } from './services/riskService';
import { Mountain, AlertTriangle, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

export default function App() {
  const [villages, setVillages] = useState([]);
  const [selectedVillageId, setSelectedVillageId] = useState('manali-01');
  const [selectedVillageData, setSelectedVillageData] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual or automatic refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const { data, source } = await fetchVillages(true);
    setVillages(data);
    setDataSource(source);
    if (selectedVillageId) {
      const riskData = await fetchVillageRisk(selectedVillageId, true);
      setSelectedVillageData(riskData);
    }
    setIsRefreshing(false);
  };

  // Periodic background telemetry refresh every 2 minutes for real-time live satellite accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVillages(true).then(({ data, source }) => {
        setVillages(data);
        setDataSource(source);
      });
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Load initial villages
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data, source } = await fetchVillages();
      setVillages(data);
      setDataSource(source);
      if (data.length > 0) {
        setSelectedVillageId(data[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // When selected village changes, fetch its risk detail
  useEffect(() => {
    if (!selectedVillageId) return;
    async function loadRisk() {
      const riskData = await fetchVillageRisk(selectedVillageId);
      setSelectedVillageData(riskData);
    }
    loadRisk();
  }, [selectedVillageId]);

  const highRiskCount = villages.filter(v => v.avalancheRisk?.level === 'High').length;
  const selectedVillage = selectedVillageData || villages.find(v => v.id === selectedVillageId) || villages[0];

  return (
    <div className="min-h-screen bg-[#f6f5f0] text-earth-900 flex flex-col font-sans selection:bg-terracotta-200">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        villages={villages}
        selectedVillageId={selectedVillageId}
        onSelectVillage={(id) => setSelectedVillageId(id)}
        highRiskCount={highRiskCount}
        dataSource={dataSource}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-serif text-lg text-earth-700">Loading Himalayan telemetry & terrain data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: Live Risk Map & Village Overview */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                
                {/* 1. Leaflet Interactive Map */}
                <section>
                  <VillageMap
                    villages={villages}
                    selectedVillageId={selectedVillageId}
                    onSelect={(id) => setSelectedVillageId(id)}
                  />
                </section>

                {/* 2. Detailed Sector Telemetry & Explainability */}
                {selectedVillage && (
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Risk Gauge & Environmental Telemetry (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                      <RiskGauge village={selectedVillage} />
                      <WeatherTerrainCards village={selectedVillage} />
                    </div>

                    {/* Right Column: Model Explainability Chart.js (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                      <FeatureImportanceChart
                        factors={selectedVillage.topFactors || []}
                        villageName={selectedVillage.name}
                        riskLevel={selectedVillage.avalancheRisk?.level || 'Moderate'}
                      />

                      {/* Quick Info Box for Operators & Officials */}
                      <div className="bg-earth-100/90 rounded-2xl p-5 border border-earth-300/70 text-xs space-y-3">
                        <div className="flex items-center gap-2 font-bold text-earth-800">
                          <Mountain className="w-4 h-4 text-terracotta-600" />
                          <span>Panchayat & Expedition Dispatch Protocol</span>
                        </div>
                        <p className="text-earth-700 leading-relaxed">
                          For sector <strong>{selectedVillage.fullName || selectedVillage.name}</strong>, risk is evaluated through real-time physical shear equilibrium modeling. Top 3 factors represent primary triggers observed across historical HiAVAL avalanche catalogs.
                        </p>
                        <div className="pt-2 border-t border-earth-200/80 flex items-center justify-between text-[11px] text-earth-600">
                          <span>Data link: {dataSource === 'backend' ? 'Live Express API' : 'Cached Local Node'}</span>
                          <span className="font-semibold text-terracotta-700">Zone: Western Himalayas</span>
                        </div>
                      </div>
                    </div>

                  </section>
                )}

              </div>
            )}

            {/* TAB 2: Multi-Village Comparative Matrix */}
            {activeTab === 'matrix' && (
              <ComparativeMatrix
                villages={villages}
                onSelectVillage={(id) => setSelectedVillageId(id)}
                onSwitchToMap={() => setActiveTab('map')}
              />
            )}

            {/* TAB 3: Scenario Simulator Sandbox */}
            {activeTab === 'simulator' && (
              <ScenarioSimulator
                baseVillage={selectedVillage}
              />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-earth-900 text-earth-400 text-xs py-6 border-t border-earth-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center font-bold">
              ??
            </div>
            <span className="font-serif font-bold text-earth-200">
              Terra Watch � Himalayan Early Warning System
            </span>
          </div>

          <div className="flex items-center space-x-6 text-earth-400 text-[11px]">
            <span>HiAVAL Avalanche Inventory</span>
            <span>�</span>
            <span>ALOS PALSAR 12.5m DEM</span>
            <span>�</span>
            <span>OpenWeatherMap API</span>
          </div>

          <div className="text-[11px] text-earth-500">
            Organic Natural Design System � Hackathon 2026
          </div>
        </div>
      </footer>

    </div>
  );
}
