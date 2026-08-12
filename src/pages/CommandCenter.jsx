import React, { useState, useEffect, useRef } from 'react';
import { useCity } from '../context/CityContext';
import CommandMap from '../components/CommandMap';
import { CITY_METADATA } from '../data/mockData';
import {
  AlertTriangle,
  ShieldAlert,
  Cpu,
  BrainCircuit,
  Building2,
  GitMerge,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

const DEBOUNCE_MS = 120;

export default function CommandCenter() {
  const { setActivePage, setSelectedIncident, backendUrl, currentRun, runStatus } = useCity();

  // Scenario dial — calls the deterministic causal engine directly, no LLM in this path.
  const [rainfall, setRainfall] = useState(120);
  const [causalResult, setCausalResult] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`${backendUrl}/api/causal/propagate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedNode: 'rainfall_intensity', magnitude: rainfall, horizonMin: 180 })
      })
        .then(res => res.json())
        .then(setCausalResult)
        .catch(() => setCausalResult(null));
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [rainfall, backendUrl]);

  const kpiCards = [
    { title: 'ACTIVE INCIDENTS', value: '07', subtitle: '3 High Severity', color: 'text-purple-600', border: 'border-purple-100/60' },
    { title: 'CRITICAL RISKS', value: '02', subtitle: 'Ward 18 & Zone 4', color: 'text-red-600', border: 'border-purple-100/60' },
    { title: 'AI RECOMMENDATIONS', value: '14', subtitle: '4 Pending Review', color: 'text-purple-600', border: 'border-purple-100/60' },
    {
      title: 'AGENTS ACTIVE',
      value: currentRun?.agentsInvoked ? `${currentRun.agentsInvoked.length} / ${currentRun.totalAgents ?? 6}` : '— / 6',
      subtitle: runStatus === 'running' ? 'Run in progress…' : currentRun?.agentsInvoked ? 'Dynamic routing, last run' : 'No live run yet',
      color: currentRun?.agentsInvoked ? 'text-purple-600' : 'text-slate-500',
      border: 'border-purple-100/60'
    },
    { title: 'DEPARTMENTS CONNECTED', value: '04', subtitle: 'Water, Traffic, 108, Public', color: 'text-purple-600', border: 'border-purple-100/60' },
    {
      title: 'RUN RISK INDEX',
      value: currentRun?.riskIndex !== undefined ? `${currentRun.riskIndex.toFixed(0)} / 100` : '— / 100',
      subtitle: currentRun?.gate ? `Gate: ${currentRun.gate}` : 'From last orchestrator run',
      color: currentRun?.riskIndex > 60 ? 'text-red-600' : 'text-slate-500',
      border: 'border-purple-100/60'
    }
  ];

  const reasoningTimeline = [
    { time: '07:05', agent: 'Weather Agent', text: 'Heavy rainfall detected (120 mm/hr).', color: 'text-purple-600' },
    { time: '07:06', agent: 'Water Agent', text: 'Drain capacity at 28%. Backwater rising.', color: 'text-purple-600' },
    { time: '07:07', agent: 'Traffic Agent', text: 'Hospital Road congestion high (6 km/h).', color: 'text-purple-600' },
    { time: '07:08', agent: 'Emergency Agent', text: 'Ambulance currently using affected route.', color: 'text-red-600' },
    { time: '07:09', agent: 'Memory Agent', text: 'Similar incident found in 2024 (91% match).', color: 'text-purple-600' },
    { time: '07:10', agent: 'Planner Agent', text: 'Cascading risk identified. Plan generated.', color: 'text-purple-600' }
  ];

  const incidentsList = [
    {
      id: "INC-2026-081",
      title: "Hospital Road Inundation & Emergency Corridor Blockage",
      ward: "Ward 18",
      severity: "critical",
      riskScore: 92,
      confidence: 94,
      time: "07:05 AM (Live)",
      affectedDepartments: ["Water", "Traffic", "Emergency Services", "Municipal Works"],
      summary: "Heavy localized rainfall combined with 28% drain capacity is creating water stagnation on Hospital Road. Ambulance #108-B4 delayed by 18 minutes while carrying critical emergency patient.",
      rootCauses: [
        "Heavy localized downpour (120 mm/hr)",
        "Low drainage outflow capacity (28% efficiency)",
        "Existing signal congestion at Anna Salai junction"
      ],
      cascadingEffects: [
        "Water level reaches +32cm on Hospital Road",
        "Vehicular traffic stalls completely near Gate 2",
        "Ambulances blocked from reaching Trauma Center"
      ],
      aiAssessment: "HIGH PROBABILITY (92%) of total hospital access failure within 35 minutes unless coordinated drainage pumps and traffic diversion are activated immediately."
    },
    {
      id: "INC-2026-082",
      title: "Zone 4 Sluice Gate Sediment Overflow Risk",
      ward: "Zone 4",
      severity: "high",
      riskScore: 79,
      confidence: 91,
      time: "06:48 AM",
      affectedDepartments: ["Water Resources", "Municipal Works"],
      summary: "Heavy silt accumulation in secondary canal channel reduced outflow velocity by 40%. Water backup spilling into low-lying housing layout.",
      rootCauses: [
        "Uncleared urban debris buildup in canal channel",
        "High tide back-pressure from coastal estuary"
      ],
      cascadingEffects: [
        "Basin overflow into Residential Zone 4",
        "Localized power transformer short-circuit risk"
      ],
      aiAssessment: "Moderate-to-high risk of residential waterlogging. Recommending mechanical excavator dispatch to clear sluice channel."
    }
  ];

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <span className="text-xs font-mono font-bold text-purple-600 tracking-widest">
            ICCC REAL-TIME COMMAND BOARD
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">CITY COMMAND CENTER</h1>
          <p className="text-xs text-slate-500 font-semibold font-mono">Location: {CITY_METADATA.name} — Ward 18 Corridor Focus</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('agent-council')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50/50 border border-purple-200/60 text-purple-700 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <GitMerge className="w-4 h-4 text-purple-600" />
            <span>Agent Council</span>
          </button>

          <button
            onClick={() => setActivePage('response-plans')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/10 cursor-pointer transition-all border border-purple-500/20"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>View Coordinated Response Plan</span>
          </button>
        </div>
      </div>

      {/* Scenario Dial — deterministic causal engine, no LLM in this path */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-700 tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" /> Scenario Dial — Rainfall Intensity
          </span>
          <span className="text-sm font-extrabold font-mono text-purple-600">{rainfall} mm/hr</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="1"
          value={rainfall}
          onChange={(e) => setRainfall(Number(e.target.value))}
          className="w-full accent-purple-600 cursor-pointer"
        />
        <div className="flex items-center gap-4 text-xs font-mono pt-1">
          <span className="text-slate-500">Causal Risk Index:</span>
          <span className={`text-base font-extrabold ${
            !causalResult ? 'text-slate-500' : causalResult.riskIndex > 60 ? 'text-red-600' : causalResult.riskIndex > 0 ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {causalResult ? `${causalResult.riskIndex.toFixed(0)} / 100` : '—'}
          </span>
          <span className="text-slate-500 font-semibold">
            {causalResult ? `${causalResult.terminals.length} terminal node(s) reached` : 'computing…'}
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-white p-3.5 rounded-xl border ${kpi.border} flex flex-col justify-between shadow-sm`}
          >
            <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider block">
              {kpi.title}
            </span>
            <div className={`text-xl font-black font-mono my-1 ${kpi.color}`}>
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-500 truncate font-semibold">{kpi.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Main Swapped Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Critical Urban Risks (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-mono font-bold text-slate-800 flex items-center gap-2 tracking-wider">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>CRITICAL URBAN RISKS & ACTIVE ISSUES</span>
            </h2>
            <span className="text-xs font-mono text-purple-600 font-bold">Dynamic Generator Feed</span>
          </div>

          <div className="space-y-4">
            {incidentsList.map((inc) => (
              <div 
                key={inc.id}
                className={`bg-white p-5 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
                  inc.severity === 'critical' ? 'border-red-200 bg-red-50/10' : 'border-purple-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100/60">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${
                      inc.severity === 'critical' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inc.severity} Severity
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">{inc.id}</span>
                  </div>
                  <span className="text-xs font-mono text-purple-600 font-bold">{inc.time}</span>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-mono text-purple-600 font-bold">{inc.ward}</span>
                  <h3 className="text-base font-extrabold text-slate-800 mt-0.5">{inc.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{inc.summary}</p>
                </div>

                {/* Roots & Cascading Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-3 bg-purple-50/40 border border-purple-100/60 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider block mb-1">
                      ROOT CAUSES
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                      {inc.rootCauses.map((rc, i) => (
                        <li key={i}>{rc}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 tracking-wider block mb-1">
                      CASCADING RISK EFFECTS
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 font-mono text-[11px]">
                      {inc.cascadingEffects.map((ce, i) => (
                        <li key={i}>{ce}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Prediction Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200/60 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[10px] font-mono font-bold text-purple-700 tracking-wider block mb-0.5">
                      AI ASSESSMENT
                    </span>
                    <p className="text-xs text-purple-900 leading-relaxed font-mono font-bold">
                      {inc.aiAssessment}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Departments:</span>
                    <div className="flex flex-wrap gap-1">
                      {inc.affectedDepartments.map((dept, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-purple-100/80 border border-purple-200/40 text-[10px] font-mono text-purple-700">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedIncident(inc);
                      setActivePage('response-plans');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold shadow-md shadow-purple-600/10 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <span>Dispatch Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Command Map & AI Reasoning Timeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-mono font-bold text-slate-800 flex items-center gap-2 tracking-wider">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>LIVE SPATIAL MAP</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">Interactive Layers Enabled</span>
            </div>

            <CommandMap />
          </div>

          {/* AI REASONING TIMELINE */}
          <div className="bg-white p-5 rounded-2xl border border-purple-100 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <h3 className="text-xs font-mono font-bold text-slate-800 flex items-center gap-2 tracking-wider">
                <BrainCircuit className="w-4 h-4 text-purple-600" />
                <span>AI REASONING TIMELINE</span>
              </h3>
              <span className="text-[10px] font-mono text-purple-600 font-bold">Collaborative Logic</span>
            </div>

            <div className="space-y-3 pt-1">
              {reasoningTimeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3 relative group text-slate-800">
                  {/* Vertical connector line */}
                  {index < reasoningTimeline.length - 1 && (
                    <span className="absolute left-[27px] top-6 bottom-0 w-0.5 bg-purple-100" />
                  )}

                  <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-[10px] font-mono text-purple-700 shrink-0 font-bold">
                    {item.time}
                  </span>

                  <div className="flex-1 text-xs">
                    <span className="font-mono font-bold text-purple-600 block">
                      {item.agent}
                    </span>
                    <span className="text-slate-600 font-medium">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
