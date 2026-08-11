import React, { useState, useEffect, useRef } from 'react';
import { useCity } from '../context/CityContext';
import { HISTORICAL_MEMORIES } from '../data/mockData';
import { BrainCircuit, History, Activity } from 'lucide-react';

const DEFAULT_RAINFALL = 120;
const HORIZON_MIN = 180;
const DEBOUNCE_MS = 120;

export default function CausalIntelligence() {
  const { setActivePage, backendUrl } = useCity();
  const [graph, setGraph] = useState(null);
  const [rainfall, setRainfall] = useState(DEFAULT_RAINFALL);
  const [result, setResult] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const debounceRef = useRef(null);

  // Graph structure (nodes/edges/evidence) is fetched once — it's static JSON, not a live feed.
  useEffect(() => {
    fetch(`${backendUrl}/api/causal/graph`)
      .then(res => res.json())
      .then(setGraph)
      .catch(() => setGraph(null));
  }, [backendUrl]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`${backendUrl}/api/causal/propagate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedNode: 'rainfall_intensity', magnitude: rainfall, horizonMin: HORIZON_MIN })
      })
        .then(res => res.json())
        .then(setResult)
        .catch(() => setResult(null));
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [rainfall, backendUrl]);

  if (!graph || !result) {
    return <div className="p-8 text-center text-slate-400 font-mono text-sm">Loading causal graph from backend…</div>;
  }

  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const firedByTarget = new Map(graph.edges.map(e => [e.to, e]));
  for (const fired of result.firedEdges) {
    firedByTarget.set(fired.to, graph.edges.find(e => e.from === fired.from && e.to === fired.to));
  }

  const activatedIds = new Set(Object.keys(result.activations));
  const orderedActivated = graph.nodes
    .filter(n => activatedIds.has(n.id))
    .sort((a, b) => (result.arrivalTimes[a.id] ?? 0) - (result.arrivalTimes[b.id] ?? 0));
  const dormant = graph.nodes.filter(n => !activatedIds.has(n.id));

  const selectedNode = nodesById.get(selectedNodeId) || orderedActivated[orderedActivated.length - 1] || graph.nodes[0];
  const selectedEdge = activatedIds.has(selectedNode.id) && result.firedEdges.some(e => e.to === selectedNode.id)
    ? firedByTarget.get(selectedNode.id)
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          DETERMINISTIC CAUSAL PROPAGATION ENGINE
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">URBAN CAUSAL INTELLIGENCE GRAPH</h1>
        <p className="text-xs text-slate-400 font-mono">
          Plain arithmetic, no LLM — every activation, threshold and evidence string below comes from backend/causal/engine.js.
        </p>
      </div>

      {/* Scenario Dial */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Rainfall Intensity
          </span>
          <span className="text-lg font-extrabold font-mono text-cyan-300">{rainfall} mm/hr</span>
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
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>0 mm/hr</span>
          <span>IMD "Heavy" ≥ 64.5</span>
          <span>IMD "Very Heavy" ≥ 115.6</span>
          <span>200 mm/hr</span>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2 font-mono text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">RISK INDEX</span>
            <span className={`text-lg font-bold ${result.riskIndex > 60 ? 'text-red-400' : result.riskIndex > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {result.riskIndex.toFixed(0)} / 100
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">NODES ACTIVATED</span>
            <span className="text-lg font-bold text-cyan-300">{orderedActivated.length} / {graph.nodes.length}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">TERMINALS REACHED</span>
            <span className="text-lg font-bold text-purple-300">{result.terminals.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Nodes in arrival order */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>CASCADE — NODES IN ARRIVAL ORDER</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Click a node to inspect it</span>
          </div>

          <div className="space-y-2 py-2 max-h-[520px] overflow-y-auto pr-1">
            {orderedActivated.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const activation = result.activations[node.id];
              const arrival = result.arrivalTimes[node.id];

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-xl text-white'
                      : node.is_terminal
                      ? 'bg-red-950/30 border-red-500/40 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-extrabold font-mono uppercase">{node.label}</h4>
                    <span className="text-[10px] text-slate-400">
                      +{arrival} min · {node.dept}{node.is_terminal ? ' · TERMINAL' : ''}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-cyan-300 shrink-0">
                    {activation.toFixed(0)}{node.unit === 'pct' ? '%' : ` ${node.unit}`}
                  </span>
                </button>
              );
            })}

            {dormant.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                  Below threshold — not yet activated ({dormant.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dormant.map((node) => (
                    <span
                      key={node.id}
                      className="px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-600 text-[10px] font-mono"
                    >
                      {node.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Node metadata + memory box */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">NODE METADATA</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-mono">
                {selectedNode.dept}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">EVENT NAME</span>
              <h3 className="text-lg font-bold text-white mt-1">{selectedNode.label}</h3>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">CURRENT ACTIVATION</span>
                <span className="text-cyan-300 font-semibold">
                  {result.activations[selectedNode.id] !== undefined
                    ? `${result.activations[selectedNode.id].toFixed(1)} ${selectedNode.unit} @ +${result.arrivalTimes[selectedNode.id]} min`
                    : `Not reached at ${rainfall} mm/hr`}
                </span>
              </div>

              {selectedEdge ? (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">
                    FIRING EDGE — {selectedEdge.from} → {selectedEdge.to}
                  </span>
                  <span className="text-amber-300 font-semibold block">
                    weight {selectedEdge.weight} · threshold {selectedEdge.threshold} · lag {selectedEdge.lag_min} min
                  </span>
                  <span className="text-slate-300 block mt-1 leading-relaxed">{selectedEdge.evidence}</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-500">
                  No edge has fired into this node at the current rainfall level.
                </div>
              )}
            </div>
          </div>

          {/* HISTORICAL MEMORY BOX — static illustrative reference; the full corpus lives in City Memory */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <History className="w-4 h-4" />
                <span>RELATED HISTORICAL EVENT</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono font-bold">
                {HISTORICAL_MEMORIES[0].similarityScore} Match
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="text-sm font-bold text-white">{HISTORICAL_MEMORIES[0].title}</div>
              <div className="text-slate-400">Date: {HISTORICAL_MEMORIES[0].date}</div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                <strong>Conditions:</strong> {HISTORICAL_MEMORIES[0].conditions}
              </div>
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200">
                <strong>Outcome:</strong> {HISTORICAL_MEMORIES[0].outcome}
              </div>
            </div>

            <button
              onClick={() => setActivePage('city-memory')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold cursor-pointer transition-colors"
            >
              Explore City Memory Database →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
