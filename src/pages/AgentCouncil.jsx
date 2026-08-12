import React, { useState, useRef, useEffect } from 'react';
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
  GitMerge,
  Sparkles
} from 'lucide-react';

const DOMAIN_AGENT_IDS = ['weather', 'water', 'traffic', 'emergency', 'citizen', 'memory'];
const INJECTABLE_TOOLS = ['drain_capacity', 'route_status', 'hospital_access', 'ambulance_fleet'];

const LEVEL_STYLES = {
  info: 'text-slate-300',
  warn: 'text-amber-300',
  error: 'text-red-400'
};

const AGENT_COLOR = {
  ORCHESTRATOR: '#94a3b8',
  CAUSAL_ENGINE: '#06b6d4',
  SUPERVISOR: '#ec4899',
  PLANNER: '#ec4899',
  CRITIC: '#f59e0b',
  WEATHER: '#06b6d4',
  WATER: '#3b82f6',
  TRAFFIC: '#f59e0b',
  EMERGENCY: '#ef4444',
  CITIZEN: '#10b981',
  MEMORY: '#a855f7'
};

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

// Renders each event's body lines from its payload. Payload shapes are a
// contract shared with backend/orchestrator/run.js — kept stable across
// Phase 2 (stubbed) and Phase 3+ (real agents/planner/critic).
function eventLines(event) {
  const p = event.payload || {};
  switch (event.type) {
    case 'run_started':
      return [`scenario: rainfall ${p.scenario?.magnitude ?? '?'}mm/hr, horizon ${p.scenario?.horizonMin ?? '?'}min`];
    case 'causal_computed':
      return [`riskIndex=${p.riskIndex?.toFixed?.(1)} · terminals=${p.terminals?.length ?? 0} · firedEdges=${p.firedEdgeCount ?? 0} · pathStrength=${p.pathStrength?.toFixed?.(3)}`];
    case 'routing_decision':
      return [p.reason, `invoke [${(p.agents || []).join(', ')}]`].filter(Boolean);
    case 'agent_started':
      return ['started'];
    case 'tool_call':
      return [`→ ${p.tool}(${p.args ? JSON.stringify(p.args) : ''})`];
    case 'tool_result':
      return [`← ${typeof p.result === 'string' ? p.result : JSON.stringify(p.result)}   [${p.durationMs ?? '?'}ms]`];
    case 'tool_error':
      return [`✗ ${p.tool} failed: ${p.error}`];
    case 'agent_finding':
      return [`"${p.conclusion}"${p.confidence !== undefined ? `   conf ${p.confidence}` : ''}`, ...(p.flags?.length ? [`⚠ flags: ${p.flags.join('; ')}`] : [])];
    case 'memory_retrieved':
      return [`${p.hits ?? 0} hit(s) · top similarity ${p.topSimilarity ?? '?'}`];
    case 'conflict_detected':
      return [p.detail];
    case 'conflict_resolved':
      return [p.resolution];
    case 'plan_drafted':
      return [`${p.actionCount ?? '?'} action(s) drafted`];
    case 'critique':
      return [p.verdict, ...(p.reasons?.length ? p.reasons : [])].filter(Boolean);
    case 'revision_started':
      return [`revision #${p.revisionNumber}`];
    case 'confidence_computed':
      return [`confidence=${p.confidence}`];
    case 'gate_decision':
      return [`gate=${p.gate}${p.gateReason ? ` — ${p.gateReason}` : ''}`];
    case 'run_completed':
      return [`agents invoked: ${(p.agentsInvoked || []).join(', ')} (${p.agentsInvoked?.length ?? 0}/${p.totalAgents ?? 6}) · riskIndex=${p.riskIndex?.toFixed?.(1)} · gate=${p.gate}`];
    case 'run_aborted':
      return [`error: ${p.error}`];
    default:
      return [JSON.stringify(p)];
  }
}

export default function AgentCouncil() {
  const { agentTrace, activeAgents, currentRun, runStatus, startAgentRun, loadTraceReplay } = useCity();
  const [rainfall, setRainfall] = useState(118);
  const [failTools, setFailTools] = useState([]);
  const [replayRunId, setReplayRunId] = useState('');

  const toggleFailTool = (tool) => {
    setFailTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]));
  };

  const iconMap = { CloudRain, Waves, Car, Ambulance, MessageSquare, BrainCircuit, Cpu };

  // Per-agent status derived from the live trace, not a timer.
  const agentStatus = {};
  for (const id of DOMAIN_AGENT_IDS) agentStatus[id] = 'idle';
  for (const id of activeAgents) if (agentStatus[id] !== undefined) agentStatus[id] = 'queued';
  for (const event of agentTrace) {
    const id = event.agent?.toLowerCase();
    if (!DOMAIN_AGENT_IDS.includes(id)) continue;
    if (event.type === 'agent_started') agentStatus[id] = 'active';
    if (event.type === 'agent_finding') agentStatus[id] = 'done';
  }

  // Auto-scroll trace panel, pausing when the operator manually scrolls up.
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [agentTrace, autoScroll]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setAutoScroll(atBottom);
  };

  const runAnalysis = () => {
    startAgentRun({ seedNode: 'rainfall_intensity', magnitude: rainfall, horizonMin: 180, forceFailTools: failTools });
  };

  const runReplay = () => {
    if (replayRunId.trim()) loadTraceReplay(replayRunId.trim());
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
            Live orchestrator trace — deterministic causal engine plus (from Phase 3 on) real Gemini calls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Rainfall</span>
            <input
              type="number"
              min="0"
              max="200"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
            />
            <span>mm/hr</span>
          </label>

          <button
            onClick={runAnalysis}
            disabled={runStatus === 'running'}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950 cursor-pointer disabled:opacity-50 transition-all border border-purple-400/30"
          >
            {runStatus === 'running' ? <Sparkles className="w-4 h-4 text-purple-200 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{runStatus === 'running' ? 'RUN IN PROGRESS...' : 'RUN AGENT ANALYSIS'}</span>
          </button>
        </div>
      </div>

      {/* Demo hardening controls: failure injection + trace replay */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 uppercase tracking-wider">Inject tool failures:</span>
          {INJECTABLE_TOOLS.map((tool) => (
            <label
              key={tool}
              className={`px-2 py-1 rounded-lg border cursor-pointer select-none ${
                failTools.includes(tool)
                  ? 'bg-red-950 text-red-300 border-red-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={failTools.includes(tool)}
                onChange={() => toggleFailTool(tool)}
                className="hidden"
              />
              {tool}
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <span className="text-slate-500 uppercase tracking-wider">Replay run:</span>
          <input
            type="text"
            value={replayRunId}
            onChange={(e) => setReplayRunId(e.target.value)}
            placeholder="run-1786..."
            className="w-36 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
          />
          <button
            onClick={runReplay}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
          >
            LOAD
          </button>
        </div>
      </div>

      {/* Topology — nodes light up as agents actually fire */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <GitMerge className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              MULTI-AGENT CONSENSUS TOPOLOGY
            </h2>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-xs font-mono font-semibold">
            {currentRun?.gate ? `Gate: ${currentRun.gate}` : runStatus === 'running' ? 'Run in progress…' : 'No live run yet'}
          </span>
        </div>

        <div className="my-8 py-6 relative flex flex-col items-center justify-center min-h-[320px]">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
            <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="18%" y2="80%" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
            <line x1="50%" y1="50%" x2="82%" y2="80%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" />
          </svg>

          <div className={`relative z-10 p-5 rounded-2xl bg-slate-900 border-2 text-center shadow-2xl max-w-xs ${
            runStatus === 'running' ? 'border-pink-500 shadow-pink-950/50 animate-pulse-subtle' : 'border-slate-700'
          }`}>
            <div className="w-12 h-12 mx-auto rounded-xl bg-pink-950 text-pink-400 border border-pink-500/40 flex items-center justify-center mb-2">
              <Cpu className="w-7 h-7" />
            </div>
            <span className="text-xs font-mono font-bold text-pink-300 block">PLANNER AGENT</span>
            <span className="text-[10px] text-slate-400 font-mono block mt-1">
              {currentRun?.gate ? `Gate: ${currentRun.gate}` : runStatus === 'running' ? 'Synthesizing…' : 'Awaiting live run'}
            </span>
          </div>

          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-8 relative z-10">
            {AI_AGENTS.filter(a => a.id !== 'planner').map((ag) => {
              const Icon = iconMap[ag.avatar] || Cpu;
              const status = agentStatus[ag.id] || 'idle';

              return (
                <div
                  key={ag.id}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    status === 'active'
                      ? 'bg-cyan-950 border-cyan-400 shadow-lg shadow-cyan-500/50 scale-105 animate-pulse'
                      : status === 'done'
                      ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                      : status === 'queued'
                      ? 'bg-slate-900/50 border-slate-600 text-slate-300'
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
                  <span className="text-[9px] font-mono block text-slate-400 mt-0.5 capitalize">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flight-recorder trace */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">Orchestrator Trace</h3>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
            <span>{agentTrace.length} events</span>
            {!autoScroll && (
              <button
                onClick={() => setAutoScroll(true)}
                className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 cursor-pointer"
              >
                resume auto-scroll
              </button>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="max-h-[420px] overflow-y-auto px-5 py-4 font-mono text-[11.5px] leading-relaxed bg-[#060a12] space-y-3"
        >
          {agentTrace.length === 0 ? (
            <div className="text-slate-600">No run yet. Click RUN AGENT ANALYSIS to start the orchestrator.</div>
          ) : (
            agentTrace.map((event) => {
              const color = AGENT_COLOR[event.agent] || '#94a3b8';
              const levelClass = LEVEL_STYLES[event.level] || LEVEL_STYLES.info;
              return (
                <div key={`${event.runId}-${event.seq}`} className={levelClass}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-slate-600">{formatTime(event.ts)}</span>
                    <span className="font-bold" style={{ color }}>{event.agent}</span>
                    <span className="text-slate-500 lowercase">{event.type.replace(/_/g, ' ')}</span>
                  </div>
                  {eventLines(event).map((line, i) => (
                    <div key={i} className="pl-[88px] text-slate-300">{line}</div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
