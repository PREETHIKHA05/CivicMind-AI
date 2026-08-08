import React from 'react';
import { useCity } from '../context/CityContext';
import { ShieldCheck, Cpu, GitMerge, BrainCircuit, Activity, ArrowRight, Building2, Eye } from 'lucide-react';

export default function LaunchScreen() {
  const { setHasLaunched } = useCity();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080c14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))] text-slate-100 overflow-hidden">
      {/* Background Animated Grid & Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scanline opacity-70 pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full mx-4 p-8 glass-panel rounded-2xl border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
        {/* Top Status Badge */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
              ICCC Integrated Command Center Prototype
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chennai Metropolitan Area</span>
          </div>
        </div>

        {/* Hero Branding */}
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 glow-cyan">
            <Cpu className="w-10 h-10 animate-pulse-subtle" />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            CIVICMIND AI
          </h1>

          <p className="mt-3 text-lg md:text-xl font-medium text-cyan-300">
            "From fragmented city data to coordinated intelligence."
          </p>

          <p className="mt-1 text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            An Agentic Decision Intelligence Platform for Smart City Coordination
          </p>
        </div>

        {/* Architectural Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-left">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1">
              <GitMerge className="w-4 h-4" />
              <span>Multi-Agent Council</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              7 specialized AI agents (Weather, Water, Traffic, Emergency, Citizen, Memory, Planner) reason across silos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-left">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span>Urban Causal Graph</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traces cause-and-effect chains across weather, drainage, traffic, and emergency hospital access.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-left">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Human-In-The-Loop</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI generates explainable recommendations. Human authorities retain final approval and command control.
            </p>
          </div>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="p-3 my-4 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-center gap-2 text-amber-300/90 text-xs font-medium text-center">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Responsible AI Framework:</strong> AI does not directly control infrastructure. Recommendations require explicit human operator approval.
          </span>
        </div>

        {/* Enter Command Center Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-800">
          <button
            onClick={() => setHasLaunched(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Activity className="w-5 h-5 text-cyan-200 animate-pulse" />
            <span>ENTER COMMAND CENTER</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
