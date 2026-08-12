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
    <div className="bg-white border-b border-purple-100 px-4 py-3 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Scenario Info */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200/60 text-purple-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wider">
                SIMULATION SCENARIO:
              </span>
              <span className="text-xs font-semibold text-slate-800">Heavy Rainfall Emergency (Ward 18)</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Stage {simStage} of 10 — <span className="text-purple-700 font-bold">{simStage > 0 ? stages[simStage - 1]?.title : 'Idle'}</span>
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
                className={`flex items-center justify-center px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all border shrink-0 ${
                  isCurrent
                    ? 'bg-purple-600 text-white border-purple-400 shadow-sm animate-pulse'
                    : isDone
                    ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                    : 'bg-white text-slate-400 border-purple-100/60'
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-purple-100/60 shadow-sm">
            <span className="text-xs text-slate-500 font-mono">SIMULATED RISK:</span>
            <span
              className={`text-sm font-extrabold font-mono ${
                currentRiskScore > 70 ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {currentRiskScore} / 100
            </span>
          </div>

          <div className="flex items-center gap-1">
            {isSimulating ? (
              <button
                onClick={stopSimulation}
                className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 hover:bg-purple-100 cursor-pointer"
                title="Pause Simulation"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={startSimulation}
                className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60 hover:bg-purple-100 cursor-pointer"
                title="Resume Simulation"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={resetSimulation}
              className="p-1.5 rounded-lg bg-white text-slate-500 hover:text-purple-600 border border-purple-100/60 cursor-pointer shadow-sm"
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
