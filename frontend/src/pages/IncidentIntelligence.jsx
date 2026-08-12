import React from 'react';
import { useCity } from '../context/CityContext';
import { INCIDENTS_LIST } from '../data/mockData';
import { AlertTriangle, MapPin, Clock, ShieldAlert, Cpu, ArrowDown, GitBranch, ArrowRight } from 'lucide-react';

export default function IncidentIntelligence() {
  const { selectedIncident, setSelectedIncident, setActivePage } = useCity();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          DEEP INCIDENT DIAGNOSTICS & CASCADE DETECTOR
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">INCIDENT INTELLIGENCE</h1>
        <p className="text-xs text-slate-400 font-mono">
          Investigate urban root causes, multi-department telemetry, and cascading threat vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            ACTIVE INCIDENTS ({INCIDENTS_LIST.length})
          </div>

          <div className="space-y-2">
            {INCIDENTS_LIST.map((inc) => {
              const isSelected = selectedIncident.id === inc.id;

              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-panel border-cyan-500/60 bg-cyan-950/30 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{inc.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        inc.severity === 'critical'
                          ? 'chip-critical bg-red-950 text-red-300 border border-red-500/40'
                          : inc.severity === 'high'
                          ? 'chip-high bg-orange-950 text-orange-300 border border-orange-500/40'
                          : 'chip-medium bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2">{inc.title}</h4>

                  <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {inc.ward}
                    </span>
                    <span>Risk: <strong className="text-amber-300">{inc.riskScore}/100</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident Deep Dive (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedIncident && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Incident Title & Meta Header */}
              <div className="pb-4 border-b border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-500/40 text-xs font-mono font-bold uppercase">
                      {selectedIncident.severity} SEVERITY
                    </span>
                    <span className="text-xs font-mono text-cyan-400">{selectedIncident.id}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {selectedIncident.time}
                    </span>
                    <span>Confidence: <strong className="text-cyan-300">{selectedIncident.confidence}%</strong></span>
                  </div>
                </div>

                <h2 className="text-xl font-extrabold text-white">{selectedIncident.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedIncident.summary}</p>

                {/* Affected Departments Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-mono text-slate-400">Affected Departments:</span>
                  {selectedIncident.affectedDepartments.map((dept, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-200">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* ROOT CAUSES */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>ROOT CAUSES</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedIncident.rootCauses.map((cause, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 font-mono text-xs text-slate-200">
                      <span className="text-cyan-400 font-bold block text-[10px] mb-1">FACTOR {idx + 1}</span>
                      {cause}
                    </div>
                  ))}
                </div>
              </div>

              {/* POTENTIAL CASCADING EFFECTS */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>POTENTIAL CASCADING EFFECTS</span>
                </h3>

                <div className="space-y-2">
                  {selectedIncident.cascadingEffects.map((effect, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3 font-mono text-xs text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-red-950 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span>{effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI ASSESSMENT BOX */}
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    AI ASSESSMENT
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Risk Score: {selectedIncident.riskScore}/100</span>
                </div>
                <p className="text-xs font-mono text-purple-200 leading-relaxed">
                  "{selectedIncident.aiAssessment}"
                </p>
              </div>

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActivePage('response-plans')}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950 cursor-pointer transition-all"
                >
                  <span>Go to Coordinated Response Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
