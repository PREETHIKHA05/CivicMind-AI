import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { COORDINATED_RESPONSE_PLAN } from '../data/mockData';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Car,
  Ambulance,
  Radio,
  UserCheck,
  XCircle,
  Edit3,
  ShieldAlert,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function ResponsePlans() {
  const {
    planStatus,
    approvePlan,
    requestPlanChanges,
    dismissPlan,
    operatorNote,
    approvalTime,
    currentRiskScore,
    setActivePage
  } = useCity();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const iconMap = {
    Droplets,
    Car,
    Ambulance,
    Radio
  };

  const handleApproveConfirm = () => {
    approvePlan(noteInput);
    setShowConfirmModal(false);
  };

  const handleRequestChangesConfirm = () => {
    requestPlanChanges(noteInput || 'Operator requested minor routing timing adjustments.');
    setShowChangesModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            HUMAN-IN-THE-LOOP DECISION MATRIX
          </span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">COORDINATED RESPONSE PLAN</h1>
          <p className="text-xs text-slate-400 font-mono">
            Multi-department recommendations synthesized by CivicMind AI. Requires Human Authority Approval.
          </p>
        </div>

        {/* Plan Status Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">STATUS:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              planStatus === 'APPROVED BY ICCC OPERATOR'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-950'
                : planStatus === 'Changes Requested'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 animate-pulse'
            }`}
          >
            {planStatus}
          </span>
        </div>
      </div>

      {/* TOP RISK SCORE SUMMARY CARD */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-xs font-mono font-bold uppercase">
                CRITICAL TARGET RISK
              </span>
              <span className="text-xs font-mono text-slate-400">Incident: INC-2026-081 (Ward 18)</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-2">
              Potential Hospital Access Failure Mitigation
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">CURRENT RISK</span>
              <span className="text-lg font-bold text-red-400">{currentRiskScore}/100</span>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            <div>
              <span className="text-[10px] text-slate-400 block">PROJECTED RISK</span>
              <span className="text-lg font-bold text-emerald-400">41/100</span>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            <div>
              <span className="text-[10px] text-slate-400 block">CONFIDENCE</span>
              <span className="text-lg font-bold text-cyan-300">94%</span>
            </div>
          </div>
        </div>

        {/* HUMAN APPROVAL ACTION BAR (WOW MOMENT 5) */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-300">
            {planStatus === 'APPROVED BY ICCC OPERATOR' ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  APPROVED BY ICCC OPERATOR at {approvalTime || '07:12 AM'}. Dispatch instructions dispatched to simulated department terminals.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-cyan-300">
                <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Awaiting Operator Review & Decision</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {planStatus !== 'APPROVED BY ICCC OPERATOR' && (
              <>
                <button
                  onClick={() => setShowChangesModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold cursor-pointer transition-colors border border-slate-700"
                >
                  REQUEST CHANGES
                </button>

                <button
                  onClick={dismissPlan}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 font-mono text-xs cursor-pointer transition-colors border border-slate-800"
                >
                  DISMISS
                </button>

                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-950 cursor-pointer transition-all border border-emerald-400/40 animate-pulse-subtle"
                >
                  APPROVE PLAN
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DEPARTMENT-BASED RECOMMENDATIONS LIST */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          SYNTHESIZED DEPARTMENTAL ACTIONS (4)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COORDINATED_RESPONSE_PLAN.actions.map((act) => {
            const Icon = iconMap[act.deptIcon] || FileCheck2;

            return (
              <div
                key={act.id}
                className="glass-panel-interactive p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{act.department}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        act.priority === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border border-red-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {act.priority} PRIORITY
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                        RECOMMENDATION
                      </span>
                      <p className="text-slate-100 font-semibold font-mono mt-0.5">{act.recommendation}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">REASONING</span>
                      <p className="text-slate-300 font-mono text-[11px]">{act.reason}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                        EXPECTED IMPACT
                      </span>
                      <p className="text-emerald-200 font-mono text-[11px]">{act.expectedImpact}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence & Confidence */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Confidence: <strong className="text-cyan-300">{act.confidence}</strong></span>
                  <span className="truncate max-w-[200px] text-slate-500">
                    Evidence: {act.evidence.join(' | ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-emerald-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Approve Coordinated Response Plan?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Approving this plan will authorize simulated dispatch orders to Water, Traffic, Emergency Services, and Public Advisory terminals.
            </p>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                OPERATOR LOG NOTE (OPTIONAL)
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter operator authorization notes..."
                className="w-full h-20 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              Note: This is a prototype command simulation. No real government emergency services are contacted.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleApproveConfirm}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
              >
                CONFIRM APPROVAL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-amber-500/40 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <Edit3 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Request Plan Modifications</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Specify what parameters or departmental recommendations require revision before approval.
            </p>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                CHANGE INSTRUCTIONS FOR PLANNER AGENT
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Adjust traffic signal diversion timing on Route B from 8 mins to 12 mins..."
                className="w-full h-24 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowChangesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestChangesConfirm}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
              >
                SUBMIT REQUEST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
