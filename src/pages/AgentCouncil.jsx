import React from 'react';
import { useCity } from '../context/CityContext';
import { AI_AGENTS } from '../data/mockData';
import {
  CloudRain,
  Waves,
  Car,
  Ambulance,
  MessageSquare,
  BrainCircuit,
  Cpu,
  Play,
  CheckCircle2,
  GitMerge,
  Sparkles,
  Activity
} from 'lucide-react';

export default function AgentCouncil() {
  const {
    isAgentReasoning,
    activeReasoningAgentIndex,
    runAgentReasoning
  } = useCity();

  const iconMap = {
    CloudRain,
    Waves,
    Car,
    Ambulance,
    MessageSquare,
    BrainCircuit,
    Cpu
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            MULTI-AGENT COLLABORATION NETWORK
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AGENT COUNCIL</h1>
          <p className="text-xs text-slate-400 font-mono">
            Specialized AI agents collaborate in real-time before synthesizing recommendations.
          </p>
        </div>

        <button
          onClick={runAgentReasoning}
          disabled={isAgentReasoning}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950 cursor-pointer disabled:opacity-50 transition-all border border-purple-400/30"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-spin" />
          <span>{isAgentReasoning ? 'REASONING IN PROGRESS...' : 'RUN AGENT ANALYSIS'}</span>
        </button>
      </div>

      {/* WOW MOMENT 2: AGENT COLLABORATION VISUALIZATION DIAGRAM */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <GitMerge className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              MULTI-AGENT CONSENSUS TOPOLOGY
            </h2>
          </div>

          <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold">
            {isAgentReasoning
              ? `Agent ${activeReasoningAgentIndex + 1}/7 Analyzing...`
              : 'Consensus Reached (95%)'}
          </span>
        </div>

        {/* Circular / Distributed Node Layout */}
        <div className="my-8 py-6 relative flex flex-col items-center justify-center min-h-[320px]">
          {/* Connecting SVG Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
            <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="18%" y2="80%" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="82%" y2="80%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" />
          </svg>

          {/* Central Planner Agent */}
          <div className="relative z-10 p-5 rounded-2xl bg-slate-900 border-2 border-pink-500 text-center shadow-2xl shadow-pink-950/50 max-w-xs animate-pulse-subtle">
            <div className="w-12 h-12 mx-auto rounded-xl bg-pink-950 text-pink-400 border border-pink-500/40 flex items-center justify-center mb-2">
              <Cpu className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-bold text-pink-300 block">PLANNER AGENT</span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              {isAgentReasoning ? 'Synthesizing inputs...' : 'Consensus reached (95%)'}
            </span>
          </div>

          {/* Outer Agents Ring Display */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-8 relative z-10">
            {AI_AGENTS.filter(a => a.id !== 'planner').map((ag, i) => {
              const Icon = iconMap[ag.avatar] || Cpu;
              const isActiveReasoning = isAgentReasoning && activeReasoningAgentIndex === i;
              const isDone = isAgentReasoning ? activeReasoningAgentIndex > i : true;

              return (
                <div
                  key={ag.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isActiveReasoning
                      ? 'bg-cyan-950 border-cyan-400 shadow-lg shadow-cyan-500/50 scale-105 animate-pulse'
                      : isDone
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1.5"
                    style={{ backgroundColor: `${ag.color}20`, color: ag.color, borderColor: `${ag.color}50`, borderWidth: '1px' }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold block truncate">{ag.name}</span>
                  <span className="text-[9px] font-mono block text-slate-400 mt-0.5">
                    {isActiveReasoning ? 'Reasoning...' : isDone ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid of 7 Detailed Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_AGENTS.map((agent, index) => {
          const Icon = iconMap[agent.avatar] || Cpu;

          return (
            <div
              key={agent.id}
              className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="p-2.5 rounded-xl border flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}20`, color: agent.color, borderColor: `${agent.color}40` }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{agent.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{agent.role}</span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    {agent.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">CURRENT TASK</span>
                    <span className="text-slate-300 font-mono">{agent.task}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold mb-1">
                      LAST OBSERVATION
                    </span>
                    <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                      "{agent.lastObservation}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Confidence Score:</span>
                  <span className="font-bold text-cyan-300">{agent.confidence}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${agent.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
