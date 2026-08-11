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
  Layers,
  RotateCcw
} from 'lucide-react';

export default function ResponsePlans() {
  const {
    currentUser,
    planStatus,
    approvePlan,
    requestPlanChanges,
    dismissPlan,
    resetPlanToUnapproved,
    operatorNote,
    approvalTime,
    currentRiskScore,
    planActions,
    updatePlanAction,
    togglePlanAction,
    calculateProjectedRisk
  } = useCity();

  const isCounselor = currentUser && currentUser.role === 'counselor';
  const dynamicRisk = calculateProjectedRisk(planActions);

  // Editing Action State
  const [editingActionId, setEditingActionId] = useState(null);
  const [editFields, setEditFields] = useState({
    recommendation: '',
    priority: 'HIGH',
    resourceCount: 1
  });

  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [customNoteInput, setCustomNoteInput] = useState('');

  const iconMap = {
    Droplets,
    Car,
    Ambulance,
    Radio
  };

  const handleStartEdit = (action) => {
    setEditingActionId(action.id);
    setEditFields({
      recommendation: action.recommendation,
      priority: action.priority,
      resourceCount: action.resourceCount || 1
    });
  };

  const handleSaveEdit = (actionId) => {
    updatePlanAction(actionId, editFields);
    setEditingActionId(null);
  };

  const handleCancelEdit = () => {
    setEditingActionId(null);
  };

  const handleConfirmApproval = () => {
    approvePlan(customNoteInput);
    setShowConfirmModal(false);
    setCustomNoteInput('');
  };

  const handleConfirmChanges = () => {
    requestPlanChanges(customNoteInput);
    setShowChangesModal(false);
    setCustomNoteInput('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  APPROVED BY ZONE COUNSELOR at {approvalTime || '07:12 AM'}. Work orders dispatched to department dashboards.
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
            {planStatus === 'APPROVED BY ICCC OPERATOR' ? (
              <button
                onClick={resetPlanToUnapproved}
                className="px-5 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/50 font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>REVERT TO UNAPPROVED DRAFT</span>
              </button>
            ) : (
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

        <div className="grid grid-cols-1 gap-4">
          {planActions.map((action) => {
            const Icon = iconMap[action.deptIcon] || Sliders;
            const isEditing = editingActionId === action.id;

            return (
              <div
                key={action.id}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  !action.enabled
                    ? 'border-slate-800/50 opacity-60 bg-slate-950/40'
                    : isEditing
                    ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Action Title Header */}
                  <div className="flex items-start gap-4">
                    {/* Action Enable Toggle */}
                    <button
                      onClick={() => togglePlanAction(action.id)}
                      className={`p-2 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                        action.enabled
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                      title={action.enabled ? 'Action Enabled' : 'Action Disabled'}
                    >
                      {action.enabled ? 'ON' : 'OFF'}
                    </button>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono uppercase">
                          {action.department}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            action.priority === 'CRITICAL'
                              ? 'bg-red-950 text-red-300 border border-red-500/40'
                              : action.priority === 'HIGH'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {action.priority} PRIORITY
                        </span>

                        <span className="text-xs font-mono text-slate-400">
                          Risk Impact: <strong className="text-emerald-400">-{action.baseRiskImpact} pts</strong>
                        </span>
                      </div>

                      {/* Recommendation Text or Edit Input */}
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editFields.recommendation}
                            onChange={(e) => setEditFields({ ...editFields, recommendation: e.target.value })}
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-500/60 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                            rows={2}
                          />

                          <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Priority:</span>
                              <select
                                value={editFields.priority}
                                onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
                                className="bg-slate-950 border border-slate-800 text-cyan-300 rounded px-2 py-1"
                              >
                                <option value="CRITICAL">CRITICAL (1.25x Impact)</option>
                                <option value="HIGH">HIGH (1.0x Impact)</option>
                                <option value="MEDIUM">MEDIUM (0.7x Impact)</option>
                                <option value="LOW">LOW (0.4x Impact)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Resource Count:</span>
                              <div className="flex items-center gap-1 bg-slate-950 rounded px-2 py-0.5 border border-slate-800">
                                <button
                                  onClick={() => setEditFields({ ...editFields, resourceCount: Math.max(1, editFields.resourceCount - 1) })}
                                  className="text-slate-400 hover:text-white p-1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-white px-1">{editFields.resourceCount}</span>
                                <button
                                  onClick={() => setEditFields({ ...editFields, resourceCount: editFields.resourceCount + 1 })}
                                  className="text-slate-400 hover:text-white p-1"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-slate-200 mt-1 font-semibold">
                          {action.recommendation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions / Edit Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(action.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>SAVE</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      isCounselor && planStatus !== 'APPROVED BY ICCC OPERATOR' && (
                        <button
                          onClick={() => handleStartEdit(action)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>EDIT ACTION</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Additional Impact Details */}
                {!isEditing && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-400">
                    <div>
                      <strong className="text-slate-300">Causal Trigger Reason:</strong> {action.reason}
                    </div>
                    <div>
                      <strong className="text-emerald-400">Expected Outcome:</strong> {action.expectedImpact}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM APPROVAL MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white font-mono">
                Confirm Plan Approval & Task Dispatch
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              You are approving the 4-Point Coordinated Response Plan as <strong>Zone Counselor</strong>. Work orders will be dispatched directly to Water, Traffic, Emergency 108, and Public Info department dashboards.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Calculated Project Risk Index:</span>
                <strong className="text-emerald-400">{dynamicRisk}/100</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Active Actions Dispatched:</span>
                <strong className="text-cyan-300">{planActions.filter(a => a.enabled).length} Departments</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Official Authorization Note (Optional):
              </label>
              <textarea
                value={customNoteInput}
                onChange={(e) => setCustomNoteInput(e.target.value)}
                placeholder="Approved for immediate multi-department dispatch by Zone Counselor..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>CONFIRM & DISPATCH WORK ORDERS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/40 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white font-mono">
                Request Changes to Response Plan
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Flag recommendations for adjustment before dispatching to department terminals.
            </p>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                Reason for Requested Changes:
              </label>
              <textarea
                value={customNoteInput}
                onChange={(e) => setCustomNoteInput(e.target.value)}
                placeholder="Requesting 3x mobile pumps instead of 2 for Station 4B sump..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setShowChangesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmChanges}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-lg"
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
