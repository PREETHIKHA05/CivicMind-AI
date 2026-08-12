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
      <div className="pb-2 border-b border-purple-200/60">
        <span className="text-xs font-mono font-bold text-cyan-700 tracking-widest">
          Vectorized Historical Incident Repository
        </span>
        <h1 className="text-2xl font-extrabold text-purple-950 tracking-tight">Urban Memory</h1>
        <p className="text-xs text-slate-600 font-mono">
          Search past municipal disasters, action profiles, and spatial recurrence vectors.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search historical incidents... (e.g., 'heavy rain ward 18')"
            className="w-full bg-white border border-purple-100 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          onClick={() => setSearchTerm('heavy rain ward 18')}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center gap-2 border border-purple-500/20 shadow-md shadow-purple-600/10"
        >
          <Sparkles className="w-4 h-4" />
          <span>Try "heavy rain ward 18"</span>
        </button>
      </div>

      {/* Similarity Match Notice */}
      {searchTerm && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs font-mono text-purple-800">
          <span>
            Search query matched <strong>{filteredMemories.length} historical vector embeddings</strong>.
          </span>
          <span className="text-cyan-800 font-bold">Highest Similarity: 91%</span>
        </div>
      )}

      {/* Historical Incidents List */}
      <div className="space-y-4">
        {filteredMemories.map((mem) => (
          <div key={mem.id} className="glass-panel p-6 rounded-2xl border border-purple-100 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-50">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-750 border border-purple-200/60 font-mono text-xs font-bold">
                  {mem.year}
                </span>
                <h3 className="text-base font-bold text-purple-950">{mem.title}</h3>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {mem.location}
                </span>
                <span>Similarity: <strong className="text-cyan-800 font-extrabold">{mem.similarityScore}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block font-bold mb-1">Conditions & Cause</span>
                <p className="text-slate-700 leading-relaxed font-semibold">{mem.conditions}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/60">
                <span className="text-[10px] text-red-750 block font-bold mb-1">Impact & Outcome</span>
                <p className="text-red-900 leading-relaxed font-semibold">{mem.outcome}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 block font-bold mb-1">Actions Taken</span>
                <p className="text-slate-700 leading-relaxed font-semibold">{mem.actionsTaken}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <span className="text-[10px] text-emerald-750 block font-bold mb-1">Lesson Learned & Policy Memory</span>
                <p className="text-emerald-900 leading-relaxed font-semibold">{mem.lessonLearned}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
