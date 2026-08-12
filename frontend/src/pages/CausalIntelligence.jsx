import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { CAUSAL_GRAPH_NODES, CAUSAL_GRAPH_EDGES, HISTORICAL_MEMORIES } from '../data/mockData';
import { BrainCircuit, ArrowDown, History, Sparkles, Layers, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function CausalIntelligence() {
  const { setActivePage } = useCity();
  const [selectedNode, setSelectedNode] = useState(CAUSAL_GRAPH_NODES[0]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <span className="eyebrow text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          PROBABILISTIC CAUSAL DISCOVERY ENGINE
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">URBAN CAUSAL INTELLIGENCE GRAPH</h1>
        <p className="text-xs text-slate-400 font-mono">
          Visualize spatial cause-and-effect chains and historical recurrence memories.
        </p>
      </div>

      {/* WOW MOMENT 3: CAUSAL GRAPH INTERACTIVE DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Causal Chain Nodes (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>URBAN CAUSAL CHAIN NODES</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Click node to inspect node metadata</span>
          </div>

          <div className="space-y-3 py-2">
            {CAUSAL_GRAPH_NODES.map((node, idx) => {
              const isSelected = selectedNode.id === node.id;

              return (
                <React.Fragment key={node.id}>
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`cascade-node w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'is-selected bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-950/80 text-white scale-[1.01]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <h4 className="cascade-node-name text-sm font-extrabold font-mono uppercase">{node.label}</h4>
                        <span className="cascade-node-meta text-[11px] text-slate-400 truncate max-w-md block">{node.detail}</span>
                      </div>
                    </div>

                    <span className={`cascade-node-value text-xs font-mono font-semibold text-cyan-300 shrink-0 ${
                      node.val > 70 ? 'sev-high' : node.val > 40 ? 'sev-mid' : 'sev-low'
                    }`}>
                      Value: {node.val}%
                    </span>
                  </button>

                  {/* Animated Down Edge Arrow */}
                  {idx < CAUSAL_GRAPH_NODES.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300">
                        <ArrowDown className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                        <span>{CAUSAL_GRAPH_EDGES[idx]?.label}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Column: Node Metadata Inspection Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {selectedNode && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">NODE METADATA</span>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono">
                  Confidence: 94%
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">EVENT NAME</span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedNode.label}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{selectedNode.detail}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">HISTORICAL FREQUENCY</span>
                  <span className="text-cyan-300 font-semibold">{selectedNode.frequency}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">AFFECTED INFRASTRUCTURE</span>
                  <span className="text-amber-300 font-semibold">Ward 18 Drainage Sump, Hospital Road Corridor, ER Access Gate 2</span>
                </div>
              </div>
            </div>
          )}

          {/* HISTORICAL MEMORY BOX */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <History className="w-4 h-4" />
                <span>SIMILAR HISTORICAL EVENT DETECTED</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-mono font-bold">
                91% Match
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
