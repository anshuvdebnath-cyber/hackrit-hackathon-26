import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VillageMap from './components/VillageMap';
import RiskGauge from './components/RiskGauge';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import WeatherTerrainCards from './components/WeatherTerrainCards';
import ComparativeMatrix from './components/ComparativeMatrix';
import ScenarioSimulator from './components/ScenarioSimulator';
import { fetchVillages, fetchVillageRisk, fetchModelStatus } from './services/riskService';
import { Mountain, AlertTriangle, ShieldCheck, HeartPulse, RefreshCw, Loader2, Sparkles, Cpu } from 'lucide-react';

export default function App() {
  const [villages, setVillages] = useState([]);
  const [selectedVillageId, setSelectedVillageId] = useState('manali-01');
  const [selectedVillageData, setSelectedVillageData] = useState(null);
  const [customLocation, setCustomLocation] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [isEvaluatingCoordinate, setIsEvaluatingCoordinate] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load of villages and model status
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [villagesResult, statusResult] = await Promise.all([
        fetchVillages(),
        fetchModelStatus()
      ]);
      setVillages(villagesResult.data);
      setDataSource(villagesResult.source);
      setModelStatus(statusResult);
      if (villagesResult.data.length > 0) {
        setSelectedVillageId(villagesResult.data[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Manual or automatic refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const [villagesResult, statusResult] = await Promise.all([
      fetchVillages(true),
      fetchModelStatus()
    ]);
    setVillages(villagesResult.data);
    setDataSource(villagesResult.source);
    setModelStatus(statusResult);
    if (selectedVillageId && !customLocation) {
      const riskData = await fetchVillageRisk(selectedVillageId, true);
      setSelectedVillageData(riskData);
    }
    setIsRefreshing(false);
  };

  // Periodic background telemetry refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVillages(true).then(({ data, source }) => {
        setVillages(data);
        setDataSource(source);
      });
      fetchModelStatus().then(status => setModelStatus(status));
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // When selected predefined village changes, fetch its risk detail and clear custom pin
  useEffect(() => {
    if (!selectedVillageId || customLocation) return;
    async function loadRisk() {
      const riskData = await fetchVillageRisk(selectedVillageId);
      setSelectedVillageData(riskData);
    }
    loadRisk();
  }, [selectedVillageId, customLocation]);

  const handleSelectVillage = (id) => {
    setCustomLocation(null);
    setSelectedVillageId(id);
  };

  const handleSelectCustomCoordinate = (customSector) => {
    setCustomLocation(customSector);
    setIsEvaluatingCoordinate(false);
  };

  const handleClearCustom = () => {
    setCustomLocation(null);
    setIsEvaluatingCoordinate(false);
  };

  const highRiskCount = villages.filter(v => v.avalancheRisk?.level === 'High').length;
  const selectedVillage = customLocation || selectedVillageData || villages.find(v => v.id === selectedVillageId) || villages[0];

  return (
    <div className="min-h-screen bg-[#f6f5f0] text-earth-900 flex flex-col font-sans selection:bg-terracotta-200">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        villages={villages}
        selectedVillageId={customLocation ? customLocation.id : selectedVillageId}
        customLocation={customLocation}
        onClearCustom={handleClearCustom}
        onSelectVillage={handleSelectVillage}
        highRiskCount={highRiskCount}
        dataSource={dataSource}
        modelStatus={modelStatus}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-3 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-serif text-base text-earth-700">Connecting to XGBoost Model & Himalayan Telemetry...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: Live Risk Map & Village Overview */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                
                {/* Evaluating Coordinate Notice Banner */}
                {isEvaluatingCoordinate && (
                  <div className="bg-earth-900 text-earth-100 p-3 rounded-xl border border-earth-700 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm animate-pulse">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-terracotta-400 flex-shrink-0" />
                      <span className="font-medium">
                        Fetching satellite weather & running <span className="font-mono font-bold text-terracotta-300">xgb_avalanche_final.json</span> for clicked coordinate...
                      </span>
                    </div>
                    <span className="text-earth-400 text-xs font-mono hidden sm:inline">
                      FastAPI microservice inference (:8000)
                    </span>
                  </div>
                )}

                {/* 1. Leaflet Interactive Map */}
                <section className="pt-1 sm:pt-2">
                  <VillageMap
                    villages={villages}
                    selectedVillageId={selectedVillageId}
                    customLocation={customLocation}
                    onSelect={handleSelectVillage}
                    onSelectCustom={handleSelectCustomCoordinate}
                    onClearCustom={handleClearCustom}
                    onEvaluatingCustom={(st) => setIsEvaluatingCoordinate(!!st)}
                  />
                </section>

                {/* 2. Detailed Sector Telemetry & Explainability */}
                {selectedVillage && (
                  <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* Left Column: Risk Gauge & Environmental Telemetry (7 cols) */}
                    <div className="lg:col-span-7 space-y-4 flex flex-col">
                      <RiskGauge village={selectedVillage} modelStatus={modelStatus} />
                      <WeatherTerrainCards village={selectedVillage} modelStatus={modelStatus} />
                    </div>

                    {/* Right Column: Model Explainability Chart.js (5 cols) */}
                    <div className="lg:col-span-5">
                      <FeatureImportanceChart
                        factors={selectedVillage.topFactors || []}
                        villageName={selectedVillage.name}
                        riskLevel={selectedVillage.avalancheRisk?.level || 'Moderate'}
                        modelStatus={modelStatus}
                      />
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

<footer className="bg-earth-900 text-earth-400 text-xs py-6 border-t border-earth-800 mt-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 rounded-lg bg-terracotta-500/20 text-terracotta-400 flex items-center justify-center">
        <Mountain className="w-3.5 h-3.5" />
      </div>
      <span className="font-heading font-bold text-earth-100 text-base tracking-wide">HimVigil</span>
    </div>
    <p className="text-xs text-earth-400 font-medium text-center md:text-right">HackRIT Hackathon 2026</p>
  </div>
</footer>

    </div>
  );
}
