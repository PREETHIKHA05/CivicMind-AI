import React from 'react';
import { useCity } from '../context/CityContext';
import { ShieldCheck, UserCheck, Eye, CheckCircle2, Lock, X, AlertTriangle } from 'lucide-react';

export default function ResponsibleAiModal() {
  const { isResponsibleAiModalOpen, setIsResponsibleAiModalOpen } = useCity();

  if (!isResponsibleAiModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel p-6 rounded-2xl border border-cyan-500/30 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Responsible AI & Governance Framework</h3>
          </div>
          <button
            onClick={() => setIsResponsibleAiModalOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="uppercase font-bold block mb-1 font-mono text-amber-300">CORE ETHICAL MANDATE</span>
            "AI provides recommendations. Human authorities retain final decision-making authority."
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <UserCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-mono">1. Human-In-The-Loop Approval</span>
              CivicMind AI never directly triggers physical infrastructure actions or changes traffic signals autonomously. Every recommendation requires explicit verification by an ICCC Senior Operator.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <Eye className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-mono">2. Explainable & Evidence-Backed Reasoning</span>
              Every AI prediction includes confidence scores (e.g. 94%), underlying sensor telemetry chips, and step-by-step reasoning logs from 7 specialized domain agents.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block font-mono">3. Complete Audit Trail & Accountability</span>
              Operator approvals, notes, and timestamp logs are stored in a tamper-resistant municipal memory ledger for post-event analysis.
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsResponsibleAiModalOpen(false)}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs font-mono transition-colors cursor-pointer"
        >
          I UNDERSTAND & CONFIRM GOVERNANCE RULES
        </button>
      </div>
    </div>
  );
}
