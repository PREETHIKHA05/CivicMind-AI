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
        ${isCritical ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #ffffff;
          border: 3.5px solid ${color};
          box-shadow: 0 4px 10px rgba(124, 58, 237, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 7px; height: 7px; border-radius: 50%; background-color: ${color};"></div>
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

      // CartoDB Voyager Light tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
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
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-purple-100 shadow-md bg-white">
      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Layer Control Bar */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 border border-purple-100 p-2.5 rounded-xl text-xs flex flex-wrap items-center gap-2 max-w-xl shadow-md">
        <div className="flex items-center gap-1.5 font-mono font-bold text-purple-600 px-2 py-1 border-r border-purple-100">
          <Layers className="w-4 h-4" />
          <span>MAP LAYERS:</span>
        </div>

        <button
          onClick={() => toggleLayer('incidents')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.incidents
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-white text-slate-500 border border-purple-100/60'
          }`}
        >
          ● Incidents
        </button>

        <button
          onClick={() => toggleLayer('traffic')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.traffic
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-white text-slate-500 border border-purple-100/60'
          }`}
        >
          ● Traffic
        </button>

        <button
          onClick={() => toggleLayer('floodRisk')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.floodRisk
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-white text-slate-500 border border-purple-100/60'
          }`}
        >
          ● Flood Risk
        </button>

        <button
          onClick={() => toggleLayer('hospitals')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.hospitals
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-white text-slate-500 border border-purple-100/60'
          }`}
        >
          ● Hospitals
        </button>

        <button
          onClick={() => toggleLayer('emergencyRoutes')}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
            layers.emergencyRoutes
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'bg-white text-slate-500 border border-purple-100/60'
          }`}
        >
          ● Emergency Routes
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white border border-purple-100 p-3 rounded-xl text-[11px] font-mono hidden sm:flex items-center gap-4 shadow-md text-slate-700">
        <div className="text-slate-500 font-semibold">SEVERITY:</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>Critical</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>High</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Warning</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Normal</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>AI Prediction</div>
      </div>

      {/* Marker Telemetry Detail Modal Drawer */}
      {showDetailModal && activeMarker && (
        <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-96 bg-white border-l border-purple-100 p-5 overflow-y-auto shadow-2xl flex flex-col justify-between text-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  activeMarker.severity === 'critical'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : activeMarker.severity === 'high'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {activeMarker.severity} SEVERITY
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-purple-50 text-slate-400 hover:text-purple-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs font-mono text-purple-600 font-bold">{activeMarker.ward}</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">{activeMarker.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activeMarker.description}</p>
            </div>

            {/* Sensor Telemetry Box */}
            <div className="mt-4 p-3 rounded-xl bg-purple-50/50 border border-purple-100/60 space-y-2">
              <span className="text-[11px] font-mono font-bold text-purple-600 uppercase tracking-wider block">
                SENSOR TELEMETRY
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(activeMarker.telemetry || {}).map(([k, v]) => (
                  <div key={k} className="p-2 rounded bg-white border border-purple-100/60">
                    <span className="text-slate-500 text-[10px] block capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-purple-700 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prediction Box */}
            <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200/60">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 mb-1">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>AI PREDICTIVE INSIGHT</span>
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-mono">
                {activeMarker.aiPrediction}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDetailModal(false)}
            className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs font-mono tracking-wide transition-colors cursor-pointer"
          >
            Close Telemetry Panel
          </button>
        </div>
      )}
    </div>
  );
}
