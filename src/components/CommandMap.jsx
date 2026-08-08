import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MAP_MARKERS, CITY_METADATA } from '../data/mockData';
import { useCity } from '../context/CityContext';
import { Layers, AlertTriangle, Building2, Navigation, Droplets, Car, ShieldAlert, Cpu, X } from 'lucide-react';

export default function CommandMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const { setSelectedMarker } = useCity();
  const [activeMarker, setActiveMarker] = useState(MAP_MARKERS[0]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Layer Filter Toggles
  const [layers, setLayers] = useState({
    incidents: true,
    traffic: true,
    floodRisk: true,
    hospitals: true,
    emergencyRoutes: true,
    infrastructure: true
  });

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Helper for Marker Colors
  const getMarkerColor = (severity, category) => {
    if (category === 'hospital') return '#10b981'; // green
    if (category === 'infrastructure') return '#3b82f6'; // blue
    if (category === 'route') return '#06b6d4'; // cyan
    if (severity === 'critical') return '#ef4444'; // red
    if (severity === 'high') return '#f97316'; // orange
    if (severity === 'medium') return '#f59e0b'; // yellow
    return '#8b5cf6'; // purple AI
  };

  // Create SVG Marker Icon
  const createCustomIcon = (marker) => {
    const color = getMarkerColor(marker.severity, marker.category);
    const isCritical = marker.severity === 'critical';

    const svgHtml = `
      <div style="position: relative; display: flex; items-center; justify-content: center;">
        ${isCritical ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #0f172a;
          border: 3px solid ${color};
          box-shadow: 0 0 15px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${color};"></div>
        </div>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-map-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: CITY_METADATA.center,
        zoom: 13,
        zoomControl: false
      });

      // CartoDB Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Filter and add markers based on layer toggles
    MAP_MARKERS.forEach(marker => {
      const isVisible =
        (marker.category === 'incident' && layers.incidents) ||
        (marker.category === 'traffic' && layers.traffic) ||
        (marker.category === 'water' && layers.floodRisk) ||
        (marker.category === 'hospital' && layers.hospitals) ||
        (marker.category === 'route' && layers.emergencyRoutes) ||
        (marker.category === 'infrastructure' && layers.infrastructure) ||
        (marker.category === 'weather' && layers.floodRisk);

      if (!isVisible) return;

      const icon = createCustomIcon(marker);
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon }).addTo(map);

      leafletMarker.on('click', () => {
        setActiveMarker(marker);
        setSelectedMarker(marker);
        setShowDetailModal(true);
      });

      markersRef.current.push(leafletMarker);
    });

    // Handle map resize container
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [layers]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080c14]">
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Control Bar */}
      <div className="absolute top-4 left-4 z-20 glass-panel p-2.5 rounded-xl border border-slate-800 text-xs flex flex-wrap items-center gap-2 max-w-xl">
        <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-400 px-2 py-1 border-r border-slate-800">
          <Layers className="w-4 h-4" />
          <span>MAP LAYERS:</span>
        </div>

        <button
          onClick={() => toggleLayer('incidents')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.incidents
              ? 'bg-red-950/80 text-red-300 border border-red-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800'
          }`}
        >
          ● Incidents
        </button>

        <button
          onClick={() => toggleLayer('traffic')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.traffic
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800'
          }`}
        >
          ● Traffic
        </button>

        <button
          onClick={() => toggleLayer('floodRisk')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.floodRisk
              ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800'
          }`}
        >
          ● Flood Risk
        </button>

        <button
          onClick={() => toggleLayer('hospitals')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.hospitals
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800'
          }`}
        >
          ● Hospitals
        </button>

        <button
          onClick={() => toggleLayer('emergencyRoutes')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.emergencyRoutes
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800'
          }`}
        >
          ● Emergency Routes
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-3 rounded-xl border border-slate-800 text-[11px] font-mono hidden sm:flex items-center gap-4">
        <div className="text-slate-400 font-semibold">SEVERITY:</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Critical</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>High</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Warning</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Normal</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>AI Prediction</div>
      </div>

      {/* Marker Telemetry Detail Modal Drawer */}
      {showDetailModal && activeMarker && (
        <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-96 glass-panel border-l border-slate-800 p-5 overflow-y-auto shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  activeMarker.severity === 'critical'
                    ? 'bg-red-950 text-red-300 border border-red-500/40'
                    : activeMarker.severity === 'high'
                    ? 'bg-orange-950 text-orange-300 border border-orange-500/40'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {activeMarker.severity} SEVERITY
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs font-mono text-cyan-400 font-semibold">{activeMarker.ward}</span>
              <h3 className="text-base font-bold text-slate-100 mt-1">{activeMarker.title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{activeMarker.description}</p>
            </div>

            {/* Sensor Telemetry Box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                SENSOR TELEMETRY
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(activeMarker.telemetry || {}).map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-slate-950/60 border border-slate-800/60">
                    <span className="text-slate-500 text-[10px] block capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-cyan-300 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prediction Box */}
            <div className="mt-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300 mb-1">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>AI PREDICTIVE INSIGHT</span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed font-mono">
                {activeMarker.aiPrediction}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDetailModal(false)}
            className="mt-6 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            Close Telemetry Panel
          </button>
        </div>
      )}
    </div>
  );
}
