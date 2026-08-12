import React from 'react';
import { useCity } from '../context/CityContext';
import {
  Car,
  Droplets,
  CloudRain,
  Ambulance,
  MessageSquare,
  Building2,
  TrendingUp,
  ArrowDown,
  ShieldAlert,
  GitMerge,
  Activity,
  CheckCircle2
} from 'lucide-react';

const getIconStyle = (color) => {
  switch (color) {
    case 'amber': return 'bg-amber-50 border border-amber-200 text-amber-600';
    case 'blue': return 'bg-blue-50 border border-blue-200 text-blue-600';
    case 'cyan': return 'bg-cyan-50 border border-cyan-200 text-cyan-600';
    case 'red': return 'bg-red-50 border border-red-200 text-red-600';
    case 'emerald': return 'bg-emerald-50 border border-emerald-200 text-emerald-600';
    case 'purple': return 'bg-purple-50 border border-purple-200 text-purple-600';
    default: return 'bg-slate-50 border border-slate-200 text-slate-600';
  }
};

export default function CityIntelligence() {
  const { setActivePage } = useCity();

  const sections = [
    {
      id: 'traffic',
      title: 'TRAFFIC MANAGEMENT',
      icon: Car,
      color: 'amber',
      status: 'HIGH CONGESTION',
      risk: 'HIGH',
      trend: '↑ 21% Surge',
      speed: '18 km/h Avg (6 km/h Hospital Rd)',
      latestEvent: 'Anna Salai junction tailback 1.8km due to rain bottleneck.',
      metrics: [
        { label: 'Congestion Index', val: '88%' },
        { label: 'Arterial Speed', val: '18 km/h' },
        { label: 'Signals Synced', val: '92/110' },
        { label: 'Critical Bottlenecks', val: '3 Zones' }
      ]
    },
    {
      id: 'water',
      title: 'WATER & DRAINAGE',
      icon: Droplets,
      color: 'blue',
      status: 'SLUICE SATURATION',
      risk: 'CRITICAL',
      trend: '↓ 40% Outflow Rate',
      speed: 'Drain Capacity: 28%',
      latestEvent: 'Zone 4 canal headwaters experiencing backwater pressure.',
      metrics: [
        { label: 'Drain Capacity', val: '28%' },
        { label: 'Water Level', val: '+32 cm' },
        { label: 'Sluice Flow', val: '125 m³/s' },
        { label: 'Pumps Active', val: '1 / 4' }
      ]
    },
    {
      id: 'weather',
      title: 'METEOROLOGICAL TELEMETRY',
      icon: CloudRain,
      color: 'cyan',
      status: 'SEVERE MONSOON CELL',
      risk: 'CRITICAL',
      trend: '↑ 120 mm/hr Cell',
      speed: 'Temp: 27°C | Humidity: 94%',
      latestEvent: 'Heavy localized precipitation core hovering over Ward 18.',
      metrics: [
        { label: 'Current Rain', val: '120 mm/h' },
        { label: 'Radar Echo', val: 'High DBZ' },
        { label: 'Wind Velocity', val: '24 km/h' },
        { label: 'Predictive Window', val: '3 hrs' }
      ]
    },
    {
      id: 'emergency',
      title: 'EMERGENCY SERVICES (108)',
      icon: Ambulance,
      color: 'red',
      status: 'ALERT CORRIDOR',
      risk: 'HIGH',
      trend: '↑ +18m Transit Delay',
      speed: 'Hospital Capacity: 83%',
      latestEvent: 'Ambulance #108-B4 delayed carrying critical cardiac unit.',
      metrics: [
        { label: 'Active Ambulances', val: '12 Fleet' },
        { label: 'ER Occupancy', val: '83%' },
        { label: 'Avg Dispatch', val: '4.2 min' },
        { label: 'Blocked Corridors', val: '1 (Ward 18)' }
      ]
    },
    {
      id: 'citizen',
      title: 'CITIZEN VOICE & HELPLINE',
      icon: MessageSquare,
      color: 'emerald',
      status: 'REPORT CLUSTER',
      risk: 'MEDIUM',
      trend: '↑ 38 Calls / 15m',
      speed: 'Sentiment: Distressed',
      latestEvent: 'Geotagged citizen reports confirm knee-deep water on Hospital Road.',
      metrics: [
        { label: 'Recent Reports', val: '38 Calls' },
        { label: 'NLP Score', val: '88% Verified' },
        { label: 'Primary Issue', val: 'Waterlogging' },
        { label: 'Avg Response', val: '8 mins' }
      ]
    },
    {
      id: 'infrastructure',
      title: 'MUNICIPAL UTILITIES',
      icon: Building2,
      color: 'purple',
      status: 'UTILITY STANDBY',
      risk: 'LOW',
      trend: '→ Stable Operation',
      speed: 'Substations: 100% Online',
      latestEvent: 'Substation #3 sump pumps cycling normally; grid intact.',
      metrics: [
        { label: 'Grid Uptime', val: '99.8%' },
        { label: 'Pumping Stations', val: '6 / 6' },
        { label: 'Backup Power', val: 'Ready' },
        { label: 'Telecom Lines', val: 'Normal' }
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="pb-2 border-b border-purple-200/60">
        <span className="text-xs font-mono font-bold text-cyan-700 tracking-widest">
          CROSS-DEPARTMENT DATA AGGREGATOR
        </span>
        <h1 className="text-2xl font-extrabold text-purple-950 tracking-tight">CITY INTELLIGENCE</h1>
        <p className="text-xs text-slate-600 font-mono">
          Unified real-time telemetry across municipal operational silos in Chennai.
        </p>
      </div>

      {/* CROSS-DEPARTMENT CONNECTIONS VISUAL FLOW */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
            <GitMerge className="w-5 h-5 text-purple-600" />
            <span>CROSS-DEPARTMENT CASUAL RELATIONSHIPS</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Integrated Intelligence Layer</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          CivicMind AI does not treat departmental events in isolation. It maps interdependent operational chains to detect cascading risks before they paralyze municipal functions:
        </p>

        {/* Visual Cascading Chain */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-center font-mono">
            <span className="text-[10px] text-cyan-800 block font-bold">1. METEOROLOGY</span>
            <span className="text-sm font-extrabold text-cyan-950 block mt-1">HEAVY RAINFALL</span>
            <span className="text-[10px] text-cyan-700 block mt-1">120 mm/hr Core</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center font-mono">
            <span className="text-[10px] text-blue-800 block font-bold">2. WATER RESOURCES</span>
            <span className="text-sm font-extrabold text-blue-950 block mt-1">DRAIN OVERFLOW</span>
            <span className="text-[10px] text-blue-700 block mt-1">Capacity at 28%</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center font-mono">
            <span className="text-[10px] text-amber-800 block font-bold">3. INFRASTRUCTURE</span>
            <span className="text-sm font-extrabold text-amber-950 block mt-1">ROAD FLOODING</span>
            <span className="text-[10px] text-amber-700 block mt-1">32cm Water Level</span>
          </div>

          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-center font-mono">
            <span className="text-[10px] text-orange-800 block font-bold">4. TRAFFIC BUREAU</span>
            <span className="text-sm font-extrabold text-orange-950 block mt-1">CONGESTION</span>
            <span className="text-[10px] text-orange-700 block mt-1">Speed drops to 6km/h</span>
          </div>

          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center font-mono glow-red">
            <span className="text-[10px] text-red-800 block font-bold">5. EMERGENCY 108</span>
            <span className="text-sm font-extrabold text-red-950 block mt-1">AMBULANCE DELAY</span>
            <span className="text-[10px] text-red-700 block mt-1">Hospital Access Risk</span>
          </div>
        </div>
      </div>

      {/* Grid of 6 Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((sec) => {
          const Icon = sec.icon;

          return (
            <div
              key={sec.id}
              className="glass-panel-interactive p-5 rounded-2xl border border-purple-100 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${getIconStyle(sec.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-900">{sec.title}</h3>
                      <span className="text-[10px] font-mono text-slate-500">{sec.speed}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      sec.risk === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-200/60'
                        : sec.risk === 'HIGH'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                        : sec.risk === 'MEDIUM'
                        ? 'bg-orange-50 text-orange-700 border-orange-200/60'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    }`}
                  >
                    {sec.risk} RISK
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  {sec.metrics.map((m, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-50/60 border border-slate-100/80">
                      <span className="text-[10px] font-mono text-slate-500 block">{m.label}</span>
                      <span className="text-xs font-bold font-mono text-slate-800">{m.val}</span>
                    </div>
                  ))}
                </div>

                {/* Latest Event */}
                <div className="p-3 rounded-xl bg-purple-50/30 border border-purple-100/50">
                  <span className="text-[10px] font-mono font-bold text-purple-700 tracking-wider block mb-1">
                    LATEST SENSOR EVENT
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-mono">{sec.latestEvent}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-slate-100">
                <span className="text-slate-500">Trend: {sec.trend}</span>
                <button
                  onClick={() => setActivePage('incident-intelligence')}
                  className="text-purple-600 hover:text-purple-800 hover:underline cursor-pointer font-bold"
                >
                  Inspect Incidents →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
