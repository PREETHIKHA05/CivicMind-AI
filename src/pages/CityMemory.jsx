import React, { useState } from 'react';
import { HISTORICAL_MEMORIES } from '../data/mockData';
import { History, Search, Sparkles, Filter, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function CityMemory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMemories = HISTORICAL_MEMORIES.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.conditions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          VECTORIZED HISTORICAL INCIDENT REPOSITORY
        </span>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">URBAN MEMORY</h1>
        <p className="text-xs text-slate-400 font-mono">
          Search past municipal disasters, action profiles, and spatial recurrence vectors.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search historical incidents... (e.g., 'heavy rain ward 18')"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <button
          onClick={() => setSearchTerm('heavy rain ward 18')}
          className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-xs font-semibold cursor-pointer shrink-0 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Try "heavy rain ward 18"</span>
        </button>
      </div>

      {/* Similarity Match Notice */}
      {searchTerm && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs font-mono text-purple-300">
          <span>
            Search query matched <strong>{filteredMemories.length} historical vector embeddings</strong>.
          </span>
          <span className="text-cyan-300 font-bold">Highest Similarity: 91%</span>
        </div>
      )}

      {/* Historical Incidents List */}
      <div className="space-y-4">
        {filteredMemories.map((mem) => (
          <div key={mem.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold">
                  {mem.year}
                </span>
                <h3 className="text-base font-bold text-white">{mem.title}</h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {mem.location}
                </span>
                <span>Similarity: <strong className="text-cyan-300">{mem.similarityScore}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">CONDITIONS & CAUSE</span>
                <p className="text-slate-200">{mem.conditions}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
                <span className="text-[10px] text-red-400 block font-bold uppercase mb-1">IMPACT & OUTCOME</span>
                <p className="text-red-200">{mem.outcome}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold uppercase mb-1">ACTIONS TAKEN</span>
                <p className="text-slate-200">{mem.actionsTaken}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase mb-1">LESSON LEARNED & POLICY MEMORY</span>
                <p className="text-emerald-200">{mem.lessonLearned}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
