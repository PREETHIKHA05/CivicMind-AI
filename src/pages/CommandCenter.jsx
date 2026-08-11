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
    { title: 'ACTIVE INCIDENTS', value: '07', subtitle: '3 High Severity', color: 'text-amber-400', border: 'border-amber-500/30' },
    { title: 'CRITICAL RISKS', value: '02', subtitle: 'Ward 18 & Zone 4', color: 'text-red-400', border: 'border-red-500/30' },
    { title: 'AI RECOMMENDATIONS', value: '14', subtitle: '4 Pending Review', color: 'text-purple-400', border: 'border-purple-500/30' },
    {
      title: 'AGENTS ACTIVE',
      value: currentRun?.agentsInvoked ? `${currentRun.agentsInvoked.length} / ${currentRun.totalAgents ?? 6}` : '— / 6',
      subtitle: runStatus === 'running' ? 'Run in progress…' : currentRun?.agentsInvoked ? 'Dynamic routing, last run' : 'No live run yet',
      color: currentRun?.agentsInvoked ? 'text-cyan-400' : 'text-slate-400',
      border: currentRun?.agentsInvoked ? 'border-cyan-500/30' : 'border-slate-700'
    },
    { title: 'DEPARTMENTS CONNECTED', value: '04', subtitle: 'Water, Traffic, 108, Public', color: 'text-blue-400', border: 'border-blue-500/30' },
    {
      title: 'RUN RISK INDEX',
      value: currentRun?.riskIndex !== undefined ? `${currentRun.riskIndex.toFixed(0)} / 100` : '— / 100',
      subtitle: currentRun?.gate ? `Gate: ${currentRun.gate}` : 'From last orchestrator run',
      color: currentRun?.riskIndex > 60 ? 'text-red-400' : currentRun?.riskIndex > 0 ? 'text-amber-400' : 'text-slate-400',
      border: currentRun?.riskIndex > 60 ? 'border-red-500/30' : 'border-slate-700'
    }
  ];

  const reasoningTimeline = [
    { time: '07:05', agent: 'Weather Agent', text: 'Heavy rainfall detected (120 mm/hr).', color: 'text-cyan-400' },
    { time: '07:06', agent: 'Water Agent', text: 'Drain capacity at 28%. Backwater rising.', color: 'text-blue-400' },
    { time: '07:07', agent: 'Traffic Agent', text: 'Hospital Road congestion high (6 km/h).', color: 'text-amber-400' },
    { time: '07:08', agent: 'Emergency Agent', text: 'Ambulance currently using affected route.', color: 'text-red-400' },
    { time: '07:09', agent: 'Memory Agent', text: 'Similar incident found in 2024 (91% match).', color: 'text-purple-400' },
    { time: '07:10', agent: 'Planner Agent', text: 'Cascading risk identified. Plan generated.', color: 'text-emerald-400' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            ICCC REAL-TIME COMMAND BOARD
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">CITY COMMAND CENTER</h1>
          <p className="text-xs text-slate-400 font-mono">Location: {CITY_METADATA.name} — Ward 18 Corridor Focus</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('agent-council')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <GitMerge className="w-4 h-4 text-purple-400" />
            <span>Agent Council</span>
          </button>

          <button
            onClick={() => setActivePage('response-plans')}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950 cursor-pointer transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>View Coordinated Response Plan</span>
          </button>
        </div>
      </div>

      {/* Scenario Dial — deterministic causal engine, no LLM in this path */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Scenario Dial — Rainfall Intensity
          </span>
          <span className="text-sm font-extrabold font-mono text-cyan-300">{rainfall} mm/hr</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          step="1"
          value={rainfall}
          onChange={(e) => setRainfall(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />
        <div className="flex items-center gap-4 text-xs font-mono pt-1">
          <span className="text-slate-400">Causal Risk Index:</span>
          <span className={`text-base font-extrabold ${
            !causalResult ? 'text-slate-500' : causalResult.riskIndex > 60 ? 'text-red-400' : causalResult.riskIndex > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {causalResult ? `${causalResult.riskIndex.toFixed(0)} / 100` : '—'}
          </span>
          <span className="text-slate-500">
            {causalResult ? `${causalResult.terminals.length} terminal node(s) reached` : 'computing…'}
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`glass-panel-interactive p-3.5 rounded-xl border ${kpi.border} flex flex-col justify-between`}
          >
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              {kpi.title}
            </span>
            <div className={`text-xl font-extrabold font-mono my-1 ${kpi.color}`}>
              {kpi.value}
            </div>
            <span className="text-[10px] text-slate-400 truncate">{kpi.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Main Grid: Left Map (Visual Centerpiece), Right CivicMind Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Command Map (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>LIVE SPATIAL INTELLIGENCE MAP</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">Interactive Layers Enabled</span>
          </div>

          <CommandMap />

          {/* Live Incident Prominent Highlight Card */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/40 bg-red-950/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-mono font-bold tracking-wider uppercase">
                  CRITICAL URBAN RISK
                </span>
                <span className="text-xs font-mono text-slate-400">Affected: Ward 18 / Hospital Road</span>
              </div>

              <h3 className="text-lg font-extrabold text-white">Potential Hospital Access Failure</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Emergency vehicle delays on Hospital Road due to 32cm water stagnation and 6 km/h traffic bottleneck.
              </p>
            </div>

            <button
              onClick={() => {
                setActivePage('response-plans');
              }}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shrink-0 shadow-lg shadow-red-950 flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>View Full Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: CivicMind Intelligence Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main CivicMind Intelligence Card */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>CivicMind Intelligence</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-semibold">
                Real-Time Synthesis
              </span>
            </div>

            {/* Situation Summary */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                CURRENT SITUATION
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                "Heavy rainfall is developing across Ward 18."
              </p>
            </div>

            {/* Risk, Confidence, Window */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 font-mono text-center">
              <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/30">
                <span className="text-[10px] text-slate-400 block">RISK LEVEL</span>
                <span className="text-sm font-bold text-red-400">CRITICAL</span>
              </div>

              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block">CONFIDENCE</span>
                <span className="text-sm font-bold text-cyan-300">94%</span>
              </div>

              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[10px] text-slate-400 block">IMPACT WINDOW</span>
                <span className="text-xs font-bold text-purple-300">35–45 min</span>
              </div>
            </div>

            {/* "WHY?" Evidence Chips */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                WHY IS THIS HAPPENING? (EVIDENCE CHIPS)
              </span>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-medium">
                  🌧️ Heavy Rainfall (120mm/h)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium">
                  🚰 Low Drain Capacity (28%)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-orange-950/80 border border-orange-500/40 text-orange-300 text-xs font-mono font-medium">
                  🚗 High Traffic (6 km/h)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-medium">
                  🚑 Hospital Route Dependency
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium">
                  🧠 Historical Flood Pattern (2024)
                </span>
              </div>
            </div>
          </div>

          {/* AI REASONING TIMELINE */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>AI REASONING TIMELINE</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Collaborative Logic</span>
            </div>

            <div className="space-y-3 pt-1">
              {reasoningTimeline.map((item, index) => (
                <div key={index} className="flex items-start gap-3 relative group">
                  {/* Vertical connector line */}
                  {index < reasoningTimeline.length - 1 && (
                    <span className="absolute left-[27px] top-6 bottom-0 w-0.5 bg-slate-800" />
                  )}

                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
                    {item.time}
                  </span>

                  <div className="flex-1 text-xs">
                    <span className={`font-mono font-bold ${item.color} block`}>
                      {item.agent}
                    </span>
                    <span className="text-slate-300">{item.text}</span>
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
