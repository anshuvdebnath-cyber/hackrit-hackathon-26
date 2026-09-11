import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Mountain, AlertTriangle, Wind, Thermometer, CloudSnow, ExternalLink, Navigation, Crosshair, Trash2, Loader2, Sparkles } from 'lucide-react';
import { predictCustomCoordinate, getRiskColor, getRiskBgClass } from '../services/riskService';

// Custom SVG Pin Generator for Monitored Villages
const createVillageIcon = (riskLevel, isSelected, name) => {
  const color = getRiskColor(riskLevel);
  const size = isSelected ? 42 : 34;
  const pulseHtml = (riskLevel === 'High' || isSelected)
    ? `<span style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
    : '';

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size + 10}px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${pulseHtml}
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 800;
        font-size: ${isSelected ? 14 : 11}px;
        transition: transform 0.2s ease;
        ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 0 3px rgba(193, 140, 93, 0.6);' : ''}
      ">
        ${riskLevel === 'High' ? '!' : riskLevel === 'Moderate' ? '?' : '✓'}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${color};
        margin-top: -1px;
      "></div>
      <div style="
        position: absolute;
        top: ${size + 8}px;
        background: rgba(26, 24, 22, 0.85);
        color: #f7f6f2;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      ">
        ${name}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-village-pin',
    html: html,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -size - 5],
  });
};

// Custom Pin Generator for Clicked Arbitrary Coordinates
const createCustomPinIcon = (isLoading, riskLevel) => {
  const color = isLoading ? '#D97706' : getRiskColor(riskLevel || 'Low');
  const pulseHtml = `<span style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`;

  const html = `
    <div style="position: relative; width: 38px; height: 48px; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${pulseHtml}
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: ${color};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 800;
        font-size: 14px;
      ">
        ${isLoading ? '⏳' : '📍'}
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 9px solid ${color};
        margin-top: -1px;
      "></div>
      <div style="
        position: absolute;
        top: 44px;
        background: rgba(15, 23, 42, 0.9);
        color: #38bdf8;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        Custom Point
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-clicked-pin',
    html: html,
    iconSize: [38, 48],
    iconAnchor: [19, 45],
    popupAnchor: [0, -42],
  });
};

// Map Click Listener
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Map Fly-To controller component
function MapCameraController({ selectedVillage }) {
  const map = useMap();
  useEffect(() => {
    if (selectedVillage) {
      map.flyTo([selectedVillage.lat, selectedVillage.lng], 10, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedVillage, map]);
  return null;
}

export default function VillageMap({ villages, selectedVillageId, onSelect }) {
  const selectedVillage = villages.find(v => v.id === selectedVillageId) || villages[0];
  const [customPin, setCustomPin] = useState(null);

  const handleMapClick = async (lat, lng) => {
    setCustomPin({
      lat,
      lng,
      loading: true,
      data: null
    });

    try {
      const data = await predictCustomCoordinate(lat, lng);
      setCustomPin({
        lat,
        lng,
        loading: false,
        data
      });
    } catch {
      setCustomPin(null);
    }
  };

  return (
    <div className="relative isolate z-0 w-full h-[460px] sm:h-[480px] lg:h-[500px] rounded-2xl overflow-hidden border border-earth-300/80 shadow-lg bg-earth-200">
      
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 z-[400] bg-earth-900/90 backdrop-blur-sm text-earth-100 px-3.5 py-2 rounded-xl border border-earth-700/80 shadow-md flex items-center gap-3 text-xs pointer-events-auto">
        <div className="flex items-center gap-2 font-bold text-terracotta-300">
          <Mountain className="w-4 h-4" />
          <span>Himalayan Risk Geoscope</span>
        </div>
        <span className="text-earth-600">|</span>
        <span className="text-earth-200 font-medium">
          {villages.length} Monitored Villages
        </span>
        <span className="text-earth-600">|</span>
        <span className="text-earth-300 text-xs hidden sm:inline-flex items-center gap-1.5 font-medium">
          <Crosshair className="w-3.5 h-3.5 text-terracotta-400" />
          Click map to evaluate custom coordinates
        </span>
        {customPin && (
          <button
            onClick={() => setCustomPin(null)}
            className="ml-1 text-xs bg-earth-800 hover:bg-earth-700 text-terracotta-300 font-semibold px-2.5 py-1 rounded border border-earth-700 transition"
          >
            Clear Pin
          </button>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-earth-900/95 backdrop-blur-md text-earth-100 p-4 rounded-xl border border-earth-700/90 shadow-xl text-xs sm:text-sm space-y-2 max-w-[260px] pointer-events-auto select-none">
        <div className="font-bold text-earth-100 mb-1 flex items-center justify-between gap-3">
          <span className="font-heading">Avalanche Threat Key</span>
          <span className="text-xs text-earth-400 font-normal">HiAVAL Standards</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-clay-500 inline-block shadow"></span>
          <span className="text-earth-100 font-medium">High Risk (&gt;70)</span>
          <span className="ml-auto text-clay-300 font-mono text-xs font-bold">
            {villages.filter(v => v.avalancheRisk?.level === 'High').length}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-terracotta-500 inline-block shadow"></span>
          <span className="text-earth-100 font-medium">Moderate Risk (41-70)</span>
          <span className="ml-auto text-terracotta-300 font-mono text-xs font-bold">
            {villages.filter(v => v.avalancheRisk?.level === 'Moderate').length}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-moss-500 inline-block shadow"></span>
          <span className="text-earth-100 font-medium">Low Risk (&le;40)</span>
          <span className="ml-auto text-moss-300 font-mono text-xs font-bold">
            {villages.filter(v => v.avalancheRisk?.level === 'Low').length}
          </span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={[32.5, 77.0]}
        zoom={7}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ZoomControl position="topright" />
        {/* OpenTopoMap / OpenStreetMap with Terrain details */}
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          maxZoom={16}
          attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        />

        <MapCameraController selectedVillage={selectedVillage} />

        {/* Map Click Listener */}
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Dynamic Marker for Clicked Arbitrary Coordinates */}
        {customPin && (
          <Marker
            position={[customPin.lat, customPin.lng]}
            icon={createCustomPinIcon(customPin.loading, customPin.data?.avalancheRisk?.level)}
          >
            <Popup className="village-leaflet-popup" autoPan={true}>
              <div className="p-2 min-w-[260px] max-w-[300px]">
                {customPin.loading ? (
                  <div className="py-4 px-2 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-terracotta-600 mx-auto" />
                    <p className="font-semibold text-sm text-earth-900">
                      Querying Satellite Weather & ML Engine...
                    </p>
                    <p className="text-xs text-earth-600 font-mono">
                      GPS: {customPin.lat.toFixed(4)}°N, {customPin.lng.toFixed(4)}°E
                    </p>
                  </div>
                ) : customPin.data ? (
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-earth-200 pb-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1 text-xs font-bold text-terracotta-600 uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Custom Geolocation</span>
                        </div>
                        <h4 className="font-heading font-bold text-earth-950 text-base leading-tight mt-0.5">
                          Analyzed Sector
                        </h4>
                        <p className="text-xs font-mono text-earth-600 font-medium">
                          {customPin.lat.toFixed(4)}°N, {customPin.lng.toFixed(4)}°E
                        </p>
                      </div>
                      <span
                        style={{ backgroundColor: getRiskColor(customPin.data.avalancheRisk?.level) }}
                        className="text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
                      >
                        {customPin.data.avalancheRisk?.level || 'Low'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-earth-900 mb-2.5">
                      <div className="bg-earth-100/90 p-2 rounded-lg">
                        <span className="text-xs text-earth-600 font-medium block">Est. Elevation</span>
                        <span className="font-bold text-sm text-earth-950">{customPin.data.elevation || customPin.data.weather?.modelElevation || 2850}m</span>
                      </div>
                      <div className="bg-earth-100/90 p-2 rounded-lg">
                        <span className="text-xs text-earth-600 font-medium block">Slope Angle (DEM)</span>
                        <span className="font-bold text-sm text-earth-950">{customPin.data.slopeAngle ?? '--'}°</span>
                      </div>
                      <div className="bg-earth-100/90 p-2 rounded-lg">
                        <span className="text-xs text-earth-600 font-medium block">Live Temp / Wind</span>
                        <span className="font-bold text-sm text-earth-950">{customPin.data.weather?.temperature}°C / {customPin.data.weather?.windSpeed ?? customPin.data.weather?.wind_speed ?? 0} km/h</span>
                      </div>
                      <div className="bg-earth-100/90 p-2 rounded-lg">
                        <span className="text-xs text-earth-600 font-medium block">Avalanche Score</span>
                        <span className="font-bold text-sm" style={{ color: getRiskColor(customPin.data.avalancheRisk?.level) }}>
                          {customPin.data.avalancheRisk?.score}/100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-earth-700 bg-earth-100/90 px-2.5 py-1 rounded-md mb-1 font-mono font-medium">
                      <span>Feed: {customPin.data.weather?.source || 'live-open-meteo'}</span>
                      <span>Snowpack: {customPin.data.weather?.snowDepth ?? customPin.data.weather?.snow_depth ?? 0}cm</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-earth-600 bg-earth-50 px-2.5 py-1 rounded-md mb-2.5 font-mono">
                      <span>24h snow {customPin.data.weather?.snowfall24h ?? 0}cm · rain {customPin.data.weather?.rainfall24h ?? 0}mm</span>
                      <span>Obs {customPin.data.weather?.observationTime ?? '--'}</span>
                    </div>

                    {customPin.data.explanation && (
                      <p className="text-xs sm:text-[13px] text-earth-800 bg-earth-50 p-2 rounded-lg border border-earth-200/90 mb-2.5 leading-relaxed font-medium">
                        {customPin.data.explanation}
                      </p>
                    )}

                    <button
                      onClick={() => setCustomPin(null)}
                      className="w-full py-1.5 px-3 bg-earth-200 hover:bg-earth-300 text-earth-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Custom Point</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </Popup>
          </Marker>
        )}

        {villages.map((v) => {
          const isSelected = v.id === selectedVillageId;
          const level = v.avalancheRisk?.level || 'Low';
          const icon = createVillageIcon(level, isSelected, v.name.split(' ')[0]);

          return (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelect(v.id),
              }}
            >
              <Popup className="village-leaflet-popup">
                <div className="p-2 min-w-[240px] max-w-[270px]">
                  <div className="flex items-start justify-between gap-2 border-b border-earth-200 pb-2 mb-2.5">
                    <div>
                      <h4 className="font-heading font-bold text-earth-950 text-base leading-tight">
                        {v.name}
                      </h4>
                      <p className="text-xs text-earth-600 font-medium mt-0.5">{v.region}</p>
                    </div>
                    <span
                      style={{ backgroundColor: getRiskColor(level) }}
                      className="text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    >
                      {level}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-earth-900 mb-3">
                    <div className="bg-earth-100/90 p-2 rounded-lg">
                      <span className="text-xs text-earth-600 font-medium block">Slope Angle</span>
                      <span className="font-bold text-sm text-earth-950">{v.slopeAngle}°</span>
                    </div>
                    <div className="bg-earth-100/90 p-2 rounded-lg">
                      <span className="text-xs text-earth-600 font-medium block">Elevation</span>
                      <span className="font-bold text-sm text-earth-950">{v.elevation}m</span>
                    </div>
                    <div className="bg-earth-100/90 p-2 rounded-lg">
                      <span className="text-xs text-earth-600 font-medium block">Temp / Wind</span>
                      <span className="font-bold text-sm text-earth-950">{v.weather?.temperature}°C / {v.weather?.windSpeed ?? v.weather?.wind_speed ?? 0} km/h</span>
                    </div>
                    <div className="bg-earth-100/90 p-2 rounded-lg">
                      <span className="text-xs text-earth-600 font-medium block">Avalanche Risk</span>
                      <span className="font-bold text-sm" style={{ color: getRiskColor(level) }}>
                        {v.avalancheRisk?.score}/100
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(v.id)}
                    className="w-full py-2 px-3 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Inspect Risk Breakdown</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
