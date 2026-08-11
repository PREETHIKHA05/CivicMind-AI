import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
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
  ArrowRight,
  Plus,
  Minus,
  Sliders,
  Check,
  X,
  Send,
  Layers
} from 'lucide-react';

export default function ResponsePlans() {
  const {
    currentUser,
    planStatus,
    approvePlan,
    requestPlanChanges,
    dismissPlan,
    operatorNote,
    approvalTime,
    currentRiskScore,
    planActions,
    updatePlanAction,
    togglePlanAction,
    calculateProjectedRisk,
    setActivePage
  } = useCity();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [noteInput, setNoteInput] = useState('');

  const iconMap = {
    Droplets,
    Car,
    Ambulance,
    Radio
  };

  // Dynamically computed projected risk from active/edited actions
  const dynamicRisk = calculateProjectedRisk(planActions);
  const isCounselor = !currentUser || currentUser.role === 'counselor';

  const handleApproveConfirm = () => {
    approvePlan(noteInput);
    setShowConfirmModal(false);
  };

  const handleRequestChangesConfirm = () => {
    requestPlanChanges(noteInput || 'Zone Counselor requested plan parameter adjustments.');
    setShowChangesModal(false);
  };

  const startEditAction = (action) => {
    setEditingActionId(action.id);
    setEditForm({
      recommendation: action.recommendation,
      priority: action.priority,
      resourceCount: action.resourceCount || 1,
      resourceUnits: action.resourceUnits || '',
      reason: action.reason
    });
  };

  const saveEditAction = (actionId) => {
    updatePlanAction(actionId, {
      recommendation: editForm.recommendation,
      priority: editForm.priority,
      resourceCount: Number(editForm.resourceCount),
      resourceUnits: editForm.resourceUnits,
      reason: editForm.reason,
      expectedImpact: `Customized by ${currentUser?.name || 'Zone Counselor'}: Reduces risk with priority ${editForm.priority}`
    });
    setEditingActionId(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              HUMAN-IN-THE-LOOP DECISION MATRIX
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
              {isCounselor ? 'Role: Zone Counselor (Admin)' : `Role: ${currentUser?.deptName || 'Department Official'}`}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            COORDINATED RESPONSE PLAN (CRP)
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Multi-department recommendations synthesized by CivicMind AI. Zone Counselor can customize department actions and approve work orders.
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

      {/* DYNAMIC PROJECT RISK SUMMARY CARD */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-xs font-mono font-bold uppercase">
                CRITICAL TARGET RISK
              </span>
              <span className="text-xs font-mono text-slate-400">Incident: INC-2026-081 (Ward 18)</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-2">
              Hospital Access Corridor Emergency Response Plan
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Adjust department action parameters below to observe real-time risk index variations.
            </p>
          </div>

          {/* Dynamic Risk Gauge Box */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 font-mono text-center shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">PRE-INTERVENTION</span>
              <span className="text-xl font-extrabold text-red-400">92/100</span>
            </div>

            <div className="w-px h-10 bg-slate-800" />

            <div>
              <span className="text-[10px] text-cyan-400 block font-semibold">DYNAMIC PROJECTED RISK</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-2xl font-extrabold ${dynamicRisk <= 45 ? 'text-emerald-400' : dynamicRisk <= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                  {dynamicRisk}/100
                </span>
                {dynamicRisk < 92 && (
                  <span className="text-[10px] text-emerald-400 font-bold">
                    (-{92 - dynamicRisk} pts)
                  </span>
                )}
              </div>
            </div>

            <div className="w-px h-10 bg-slate-800" />

            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">CONFIDENCE</span>
              <span className="text-lg font-bold text-cyan-300">94%</span>
            </div>
          </div>
        </div>

        {/* HUMAN APPROVAL ACTION BAR */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-300">
            {planStatus === 'APPROVED BY ICCC OPERATOR' ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  APPROVED BY ZONE COUNSELOR at {approvalTime || '07:12 AM'}. Work orders dispatched to 4 department dashboards.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-cyan-300">
                <UserCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                <span>Zone Counselor Review & Plan Customization Mode</span>
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
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg shadow-emerald-950 cursor-pointer transition-all border border-emerald-400/40 animate-pulse-subtle flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>APPROVE & DISPATCH WORK ORDERS</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* EDITABLE DEPARTMENT RECOMMENDATIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            SYNTHESIZED DEPARTMENTAL ACTIONS ({planActions.length})
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            Zone Counselor can edit actions & parameters below
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planActions.map((act) => {
            const Icon = iconMap[act.deptIcon] || FileCheck2;
            const isEditing = editingActionId === act.id;

            return (
              <div
                key={act.id}
                className={`glass-panel p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                  !act.enabled
                    ? 'opacity-50 border-slate-800 bg-slate-950/40'
                    : 'border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div>
                  {/* Action Card Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">{act.department}</span>
                        <span className="text-[10px] font-mono text-slate-400">Target Risk Contribution: -{act.baseRiskImpact} pts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Action Enable/Disable */}
                      <button
                        onClick={() => togglePlanAction(act.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer border transition-colors ${
                          act.enabled
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-red-950 hover:text-red-300'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-emerald-950 hover:text-emerald-300'
                        }`}
                        title={act.enabled ? "Disable Action in Plan" : "Enable Action in Plan"}
                      >
                        {act.enabled ? "ACTIVE IN PLAN" : "DISABLED"}
                      </button>

                      {/* Edit Button */}
                      {!isEditing && isCounselor && (
                        <button
                          onClick={() => startEditAction(act)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                          title="Edit Action Parameters"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Normal Card View vs Edit Form View */}
                  {!isEditing ? (
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                            RECOMMENDATION
                          </span>
                          <p className="text-slate-100 font-semibold font-mono mt-0.5">{act.recommendation}</p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                            act.priority === 'CRITICAL'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {act.priority}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">REASONING & EVIDENCE</span>
                        <p className="text-slate-300 font-mono text-[11px]">{act.reason}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                          EXPECTED IMPACT & UNITS ({act.resourceUnits || 'Standard Deployment'})
                        </span>
                        <p className="text-emerald-200 font-mono text-[11px]">{act.expectedImpact}</p>
                      </div>
                    </div>
                  ) : (
                    /* Inline Action Editing Form for Zone Counselor */
                    <div className="mt-3 space-y-3 bg-slate-950 p-4 rounded-xl border border-cyan-500/40 text-xs font-mono">
                      <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1.5">
                        <span>Edit Department Action Parameters</span>
                        <span className="text-[10px] text-slate-400 font-normal">Modifies projected risk score</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Recommendation Text
                        </label>
                        <textarea
                          value={editForm.recommendation}
                          onChange={(e) => setEditForm({ ...editForm, recommendation: e.target.value })}
                          className="w-full h-16 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Priority Level
                          </label>
                          <select
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          >
                            <option value="CRITICAL">CRITICAL (1.25x Risk Reduction)</option>
                            <option value="HIGH">HIGH (1.0x Risk Reduction)</option>
                            <option value="MEDIUM">MEDIUM (0.7x Risk Reduction)</option>
                            <option value="LOW">LOW (0.4x Risk Reduction)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                            Resource Units / Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editForm.resourceCount}
                            onChange={(e) => setEditForm({ ...editForm, resourceCount: e.target.value })}
                            className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Operational Reason
                        </label>
                        <input
                          type="text"
                          value={editForm.reason}
                          onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingActionId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditAction(act.id)}
                          className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
                        >
                          Save Changes & Recalculate Risk
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Info */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Confidence: <strong className="text-cyan-300">{act.confidence}</strong></span>
                  <span className="truncate max-w-[200px] text-slate-500">
                    Work Order Status: <strong className="text-white">{act.workOrderStatus || 'Pending Dispatch'}</strong>
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
              <h3 className="text-lg font-bold text-white">Approve & Dispatch Work Orders?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Approving this plan as Zone Counselor will authorize work orders directly to Water, Traffic, Emergency Services, and Public Advisory department dashboards with calculated projected risk of <strong>{dynamicRisk}/100</strong>.
            </p>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                ZONE COUNSELOR AUTHORIZATION NOTE
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter counselor authorization log..."
                className="w-full h-20 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              Note: Work orders will immediately appear in each department's active dashboard terminal.
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-950"
              >
                CONFIRM & DISPATCH
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
              Specify instructions for Planner Agent to re-synthesize departmental actions.
            </p>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                CHANGE INSTRUCTIONS
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Increase mobile pump count at Station 4B to 3..."
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

