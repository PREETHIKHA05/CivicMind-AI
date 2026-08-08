import React from 'react';
import { useCity } from '../context/CityContext';
import { Play, Pause, RotateCcw, CheckCircle2, ShieldAlert, Cpu, ArrowRight, Activity } from 'lucide-react';

export default function SimulationBar() {
  const {
    isSimulating,
    simStage,
    startSimulation,
    stopSimulation,
    resetSimulation,
    simLogs,
    currentRiskScore,
    planStatus
  } = useCity();

  if (!isSimulating && simStage === 0) return null;

  const stages = [
    { num: 1, title: 'Rainfall Detected', agent: 'Weather Agent' },
    { num: 2, title: 'Drain Capacity 28%', agent: 'Water Agent' },
    { num: 3, title: 'Traffic Speed 6km/h', agent: 'Traffic Agent' },
    { num: 4, title: 'Ambulance Delayed', agent: 'Emergency Agent' },
    { num: 5, title: '2024 Pattern Match', agent: 'Memory Agent' },
    { num: 6, title: 'Risk Score 92/100', agent: 'Planner Agent' },
    { num: 7, title: 'Plan Generated', agent: 'CivicMind' },
    { num: 8, title: 'Human Review', agent: 'ICCC Operator' },
    { num: 9, title: 'Plan Approved', agent: 'Operator Approved' },
    { num: 10, title: 'Risk Lowered (41)', agent: 'Simulated Result' }
  ];

  return (
    <div className="bg-[#0f172a] border-b border-cyan-500/30 px-4 py-3 shadow-xl relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Scenario Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                SIMULATION SCENARIO:
              </span>
              <span className="text-xs font-semibold text-slate-200">Heavy Rainfall Emergency (Ward 18)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Stage {simStage} of 10 — <span className="text-cyan-300 font-semibold">{simStage > 0 ? stages[simStage - 1]?.title : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* Center: Stage Progress Pipeline */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1">
          {stages.map((st) => {
            const isDone = simStage > st.num;
            const isCurrent = simStage === st.num;

            return (
              <div
                key={st.num}
                className={`flex items-center justify-center px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all border shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/40 animate-pulse'
                    : isDone
                    ? 'bg-slate-800 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-900/60 text-slate-600 border-slate-800'
                }`}
                title={`${st.num}. ${st.title} (${st.agent})`}
              >
                <span>{st.num}</span>
              </div>
            );
          })}
        </div>

        {/* Right: Controls & Simulated Risk Score */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">SIMULATED RISK:</span>
            <span
              className={`text-sm font-extrabold font-mono ${
                currentRiskScore > 70 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {currentRiskScore} / 100
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isSimulating ? (
              <button
                onClick={stopSimulation}
                className="p-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/40 hover:bg-amber-900 cursor-pointer"
                title="Pause Simulation"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 cursor-pointer"
                title="Resume Simulation"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
