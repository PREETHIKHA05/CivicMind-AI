import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { CITY_METADATA } from '../data/mockData';
import {
  MapPin,
  Clock,
  CloudRain,
  Thermometer,
  ShieldCheck,
  Play,
  RotateCcw,
  Bot,
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';

export default function HeaderBar() {
  const {
    setIsAiDrawerOpen,
    isSimulating,
    startSimulation,
    resetSimulation,
    currentRiskScore,
    planStatus,
    setIsResponsibleAiModalOpen,
    toasts
  } = useCity();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Location & System Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">{CITY_METADATA.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{CITY_METADATA.region}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span>● LIVE INTELLIGENCE</span>
        </div>

        {/* Telemetry Chips */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200">{currentTime || '07:05:22 AM'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300 font-medium">{CITY_METADATA.weather.rainfall}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">{CITY_METADATA.weather.temp}</span>
          </div>
        </div>
      </div>

      {/* Right: AI Quick Command + Simulation Action + Controls */}
      <div className="flex items-center gap-3">
        {/* Quick AI Command Prompt Trigger */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-mono">Ask CivicMind...</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 text-[10px] font-mono">
            Ctrl+K
          </span>
        </button>

        {/* PROMINENT SIMULATION BUTTON */}
        <div className="flex items-center gap-1.5">
          {!isSimulating ? (
            <button
              onClick={startSimulation}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs font-mono tracking-wider uppercase shadow-lg shadow-amber-950/60 transition-all cursor-pointer flex items-center gap-2 animate-pulse-subtle border border-amber-400/30"
            >
              <Play className="w-4 h-4 fill-current text-amber-100" />
              <span>RUN CITY SIMULATION</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border border-slate-700"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Sim</span>
            </button>
          )}
        </div>

        {/* Responsible AI Button */}
        <button
          onClick={() => setIsResponsibleAiModalOpen(true)}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Responsible AI & Human Approval Governance"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
}
