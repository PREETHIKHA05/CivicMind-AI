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
    planActions,
    updatePlanAction,
    togglePlanAction,
    calculateProjectedRisk,
    planRunId,
    planConfidenceBreakdown,
    planGate,
    planGateReason,
    planUnresolved,
    planConflictsResolved,
    departmentTasks,
    setActivePage,
    incidents,
    selectedIncident,
    setSelectedIncident
  } = useCity();

  const totalTasks = departmentTasks ? departmentTasks.length : 0;
  const completedTasks = departmentTasks ? departmentTasks.filter(t => t.status === 'Completed').length : 0;
  const inProgressTasks = departmentTasks ? departmentTasks.filter(t => t.status === 'In Progress').length : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  // Empty state when no incidents
  if (!incidents || incidents.length === 0) {
    return (
      <div className="space-y-6 pb-12 font-sans">
        {/* Header */}
        <div className="pb-2 border-b border-slate-300">
          <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest">
            HUMAN-IN-THE-LOOP DECISION MATRIX
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">COORDINATED RESPONSE PLAN (CRP)</h1>
          <p className="text-xs text-slate-600 font-mono">
            Multi-department recommendations synthesized by CivicMind AI. Zone Counselor can customize department actions and approve work orders.
          </p>
        </div>

        <div className="glass-panel p-12 rounded-2xl border border-purple-200 flex flex-col items-center justify-center text-center gap-3">
          <FileCheck2 className="w-10 h-10 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-700">No Active Response Plans</h2>
          <p className="text-sm text-slate-600 font-mono max-w-md">
            Go to Agent Council and synthesize agent findings to generate coordinated response plans.
          </p>
          <button
            onClick={() => setActivePage('agent-council')}
            className="mt-3 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
          >
            Go to Agent Council →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="pb-2 border-b border-slate-300">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest">
            HUMAN-IN-THE-LOOP DECISION MATRIX
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold">
            {isCounselor ? 'Role: Zone Counselor (Admin)' : `Role: ${currentUser?.deptName || 'Department Official'}`}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">COORDINATED RESPONSE PLAN (CRP)</h1>
        <p className="text-xs text-slate-600 font-mono">
          Multi-department recommendations synthesized by CivicMind AI. Zone Counselor can customize department actions and approve work orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider mb-2">
            ACTIVE INCIDENTS ({incidents.length})
          </div>

          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;

              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? 'glass-panel border-purple-400 bg-purple-100 shadow-lg'
                    : 'bg-white border-purple-200 hover:bg-purple-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700">{inc.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${inc.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : inc.severity === 'HIGH'
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2">{inc.title}</h4>

                  <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-600">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-slate-500" />
                      {inc.ward || 'Ward 18'}
                    </span>
                    {inc.confidence && (
                      <span>Conf: <strong className="text-purple-700">{Math.round(inc.confidence)}%</strong></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: CRP Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedIncident && (
            <>
              {/* Plan Status Badge */}
              <div className="glass-panel p-4 rounded-xl border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-mono font-bold text-slate-700">RESPONSE PLAN STATUS:</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${planStatus === 'APPROVED BY ICCC OPERATOR'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-md'
                    : planStatus === 'Changes Requested'
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                    }`}
                >
                  {planStatus}
                </span>
              </div>

              {/* DYNAMIC RISK SUMMARY CARD */}
              <div className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 text-xs font-mono font-bold uppercase">
                        {selectedIncident.severity} TARGET RISK
                      </span>
                      <span className="text-xs font-mono text-slate-600">Incident: {selectedIncident.id} ({selectedIncident.ward})</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                      {selectedIncident.title}
                    </h2>
                    <p className="text-xs text-slate-600 font-mono mt-1">
                      Adjust department action parameters below to observe real-time risk index variations.
                    </p>
                  </div>

                  {/* Dynamic Risk Gauge Box */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-purple-200 font-mono text-center shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-600 block font-semibold">PRE-INTERVENTION</span>
                      <span className="text-xl font-extrabold text-red-600">92/100</span>
                    </div>

                    <div className="w-px h-10 bg-slate-200" />

                    <div>
                      <span className="text-[10px] text-purple-600 block font-semibold">DYNAMIC PROJECTED RISK</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-2xl font-extrabold ${dynamicRisk <= 45 ? 'text-emerald-600' : dynamicRisk <= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                          {dynamicRisk}/100
                        </span>
                        {dynamicRisk < 92 && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            (-{92 - dynamicRisk} pts)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-px h-10 bg-slate-200" />

                    <div>
                      <span className="text-[10px] text-slate-600 block font-semibold">CONFIDENCE</span>
                      <span className="text-lg font-bold text-purple-600">{selectedIncident.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* HUMAN APPROVAL ACTION BAR */}
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs font-mono text-slate-700">
                    {planStatus === 'APPROVED BY ICCC OPERATOR' ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>
                          APPROVED BY ZONE COUNSELOR at {approvalTime || '07:12 AM'}. Work orders dispatched to {planActions.length} departments.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-purple-700">
                        <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
                        <span>Zone Counselor Review & Plan Customization Mode</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {planStatus === 'APPROVED BY ICCC OPERATOR' ? (
                      <button
                        onClick={resetPlanToUnapproved}
                        className="px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 font-mono text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                        <span>REVERT TO UNAPPROVED DRAFT</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowChangesModal(true)}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs font-semibold cursor-pointer transition-colors border border-purple-200"
                        >
                          REQUEST CHANGES
                        </button>

                        <button
                          onClick={dismissPlan}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 font-mono text-xs cursor-pointer transition-colors border border-purple-200"
                        >
                          DISMISS
                        </button>

                        <button
                          onClick={() => setShowConfirmModal(true)}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-lg cursor-pointer transition-all border border-emerald-400/40 animate-pulse-subtle flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>APPROVE & DISPATCH WORK ORDERS</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* AI GOVERNANCE: GATE + CONFIDENCE BREAKDOWN — populated once a real orchestrator run has produced this plan */}
              {planRunId && (
                <div className="bg-white p-6 rounded-2xl border border-purple-100 space-y-5 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest">
                        ORCHESTRATOR GOVERNANCE — RUN {planRunId}
                      </span>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        Gate decision and confidence components.
                      </p>
                    </div>
                    {planGate && (
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase border shrink-0 ${planGate === 'AUTO_EXECUTE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : planGate === 'ESCALATE'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                      >
                        {planGate}
                      </span>
                    )}
                  </div>

                  {planGateReason && (
                    <p className="text-xs font-mono text-slate-600 bg-purple-50/50 border border-purple-100/60 rounded-xl p-3">
                      {planGateReason}
                    </p>
                  )}

                  {/* Confidence stacked bar */}
                  {planConfidenceBreakdown && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        Confidence Components
                      </span>
                      <div className="w-full h-4 rounded-full overflow-hidden flex bg-purple-50 border border-purple-100">
                        {[
                          { key: 'evidenceCoverage', label: 'Evidence', color: '#8b5cf6', weight: 0.30 },
                          { key: 'dataFreshness', label: 'Freshness', color: '#3b82f6', weight: 0.20 },
                          { key: 'pathStrength', label: 'Path Strength', color: '#a855f7', weight: 0.25 },
                          { key: 'memorySupport', label: 'Memory', color: '#f59e0b', weight: 0.10 },
                          { key: 'agentAgreement', label: 'Agreement', color: '#10b981', weight: 0.15 }
                        ].map((c) => (
                          <div
                            key={c.key}
                            className="h-full"
                            style={{ width: `${c.weight * 100}%`, backgroundColor: c.color, opacity: 0.35 + 0.65 * (planConfidenceBreakdown[c.key] ?? 0) }}
                            title={`${c.label}: ${((planConfidenceBreakdown[c.key] ?? 0) * 100).toFixed(0)}%`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
                        {[
                          { key: 'evidenceCoverage', label: 'Evidence (30%)', color: 'text-purple-600' },
                          { key: 'dataFreshness', label: 'Freshness (20%)', color: 'text-blue-600' },
                          { key: 'pathStrength', label: 'Path Strength (25%)', color: 'text-purple-600' },
                          { key: 'memorySupport', label: 'Memory (10%)', color: 'text-amber-600' },
                          { key: 'agentAgreement', label: 'Agreement (15%)', color: 'text-emerald-600' }
                        ].map((c) => (
                          <div key={c.key} className="flex items-center justify-between bg-white border border-purple-100/60 rounded-lg px-2 py-1">
                            <span className="text-slate-500">{c.label}</span>
                            <span className={`font-bold ${c.color}`}>{((planConfidenceBreakdown[c.key] ?? 0) * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conflicts resolved */}
                  {planConflictsResolved && planConflictsResolved.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
                        Conflicts Resolved ({planConflictsResolved.length})
                      </span>
                      {planConflictsResolved.map((c, i) => (
                        <div key={i} className="text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                          Rejected <strong>{c.route}</strong> — {c.cost}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unresolved */}
                  {planUnresolved && planUnresolved.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        Unresolved / Known Gaps
                      </span>
                      {planUnresolved.map((u, i) => (
                        <div key={i} className="text-xs font-mono text-slate-600 bg-white border border-purple-100/60 rounded-xl p-2.5">
                          {u}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LIVE MULTI-DEPARTMENT WORK ORDER EXECUTION PROGRESS CARD */}
              {planStatus === 'APPROVED BY ICCC OPERATOR' && (
                <div className="bg-white p-6 rounded-2xl border border-emerald-200 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-purple-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                          LIVE FIELD EXECUTION PROGRESS
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-semibold">Real-Time Department Sync</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-800 font-mono mt-1">
                        Department Work Order Execution Tracker
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                        ● {completedTasks} / {totalTasks} Completed
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-700 font-bold">
                        ● {inProgressTasks} In Progress
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600 font-bold">Overall Department Completion Progress:</span>
                      <span className="text-emerald-600 font-extrabold text-sm font-mono">{progressPercent}%</span>
                    </div>

                    <div className="w-full h-3.5 bg-purple-50 rounded-full overflow-hidden p-0.5 border border-purple-100 flex">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Individual Department Task Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 font-mono">
                    {departmentTasks.map((task) => (
                      <div
                        key={task.id || task.taskId}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${task.status === 'Completed'
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : task.status === 'In Progress'
                            ? 'bg-purple-50/30 border-purple-200/60'
                            : 'bg-white border-purple-100/60'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 truncate">{task.departmentName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'In Progress'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60 animate-pulse'
                              : 'bg-white text-slate-500 border border-purple-100/60'
                            }`}>
                            {task.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 font-medium leading-tight line-clamp-2">
                          {task.title}
                        </p>

                        {task.logs && task.logs.length > 0 && (
                          <div className="pt-1.5 border-t border-purple-100/60 text-[10px] text-slate-500 font-mono">
                            <span className="text-purple-600 font-bold">Latest Log:</span>{' '}
                            <span className="text-slate-600 truncate block">{task.logs[task.logs.length - 1].note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDITABLE DEPARTMENT RECOMMENDATIONS LIST */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
                    SYNTHESIZED DEPARTMENTAL ACTIONS ({planActions.length})
                  </h3>
                  <span className="text-xs font-mono text-purple-600">
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
                        className={`glass-panel p-5 rounded-2xl border transition-all ${!action.enabled
                          ? 'border-purple-200 opacity-60 bg-slate-50'
                          : isEditing
                            ? 'border-purple-400 shadow-lg bg-purple-50'
                            : 'border-purple-200 hover:border-purple-300 bg-white'
                          }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          {/* Action Title Header */}
                          <div className="flex items-start gap-4">
                            {/* Action Enable Toggle */}
                            <button
                              onClick={() => togglePlanAction(action.id)}
                              className={`p-2 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${action.enabled
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-white text-slate-500 border border-purple-200'
                                }`}
                              title={action.enabled ? 'Action Enabled' : 'Action Disabled'}
                            >
                              {action.enabled ? 'ON' : 'OFF'}
                            </button>

                            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 shrink-0">
                              <Icon className="w-6 h-6" />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 font-mono uppercase">
                                  {action.department}
                                </span>

                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${action.priority === 'CRITICAL'
                                    ? 'bg-red-100 text-red-700 border border-red-300'
                                    : action.priority === 'HIGH'
                                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                                    }`}
                                >
                                  {action.priority} PRIORITY
                                </span>

                                <span className="text-xs font-mono text-slate-600">
                                  Risk Impact: <strong className="text-emerald-600">-{action.baseRiskImpact} pts</strong>
                                </span>

                                {Array.isArray(action.evidenceIds) && action.evidenceIds.length > 0 && (
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-300"
                                    title={action.evidenceIds.join(', ')}
                                  >
                                    {action.evidenceIds.length} evidence id{action.evidenceIds.length > 1 ? 's' : ''}
                                  </span>
                                )}

                                {action.reversible === false && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-300">
                                    IRREVERSIBLE
                                  </span>
                                )}
                              </div>

                              {/* Recommendation Text or Edit Input */}
                              {isEditing ? (
                                <div className="mt-2 space-y-2">
                                  <textarea
                                    value={editFields.recommendation}
                                    onChange={(e) => setEditFields({ ...editFields, recommendation: e.target.value })}
                                    className="w-full p-2.5 rounded-xl bg-white border border-purple-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-400"
                                    rows={2}
                                  />

                                  <div className="flex items-center gap-4 text-xs font-mono">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-600">Priority:</span>
                                      <select
                                        value={editFields.priority}
                                        onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
                                        className="bg-white border border-purple-200 text-purple-700 rounded px-2 py-1"
                                      >
                                        <option value="CRITICAL">CRITICAL (1.25x Impact)</option>
                                        <option value="HIGH">HIGH (1.0x Impact)</option>
                                        <option value="MEDIUM">MEDIUM (0.7x Impact)</option>
                                        <option value="LOW">LOW (0.4x Impact)</option>
                                      </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-600">Resource Count:</span>
                                      <div className="flex items-center gap-1 bg-white rounded px-2 py-0.5 border border-purple-200">
                                        <button
                                          onClick={() => setEditFields({ ...editFields, resourceCount: Math.max(1, editFields.resourceCount - 1) })}
                                          className="text-slate-600 hover:text-slate-900 p-1"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-bold text-slate-900 px-1">{editFields.resourceCount}</span>
                                        <button
                                          onClick={() => setEditFields({ ...editFields, resourceCount: editFields.resourceCount + 1 })}
                                          className="text-slate-600 hover:text-slate-900 p-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs font-mono text-slate-700 mt-1 font-semibold">
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
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs cursor-pointer transition-colors border border-purple-200"
                                >
                                  CANCEL
                                </button>
                              </div>
                            ) : (
                              isCounselor && planStatus !== 'APPROVED BY ICCC OPERATOR' && (
                                <button
                                  onClick={() => handleStartEdit(action)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-mono text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
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
                          <div className="mt-3 pt-3 border-t border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono text-slate-600">
                            <div>
                              <strong className="text-slate-700">Causal Trigger Reason:</strong> {action.reason}
                            </div>
                            <div>
                              <strong className="text-emerald-600">Expected Outcome:</strong> {action.expectedImpact}
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="glass-panel p-6 rounded-2xl border border-purple-200 max-w-lg w-full space-y-4 shadow-2xl bg-white">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                      <h3 className="text-lg font-bold text-slate-900 font-mono">
                        Confirm Plan Approval & Task Dispatch
                      </h3>
                    </div>

                    <p className="text-xs text-slate-700 font-mono leading-relaxed">
                      You are approving the Coordinated Response Plan as <strong>Zone Counselor</strong>. Work orders will be dispatched directly to department dashboards.
                    </p>

                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span>Calculated Project Risk Index:</span>
                        <strong className="text-emerald-600">{dynamicRisk}/100</strong>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Active Actions Dispatched:</span>
                        <strong className="text-purple-700">{planActions.filter(a => a.enabled).length} Departments</strong>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-600 block mb-1">
                        Official Authorization Note (Optional):
                      </label>
                      <textarea
                        value={customNoteInput}
                        onChange={(e) => setCustomNoteInput(e.target.value)}
                        placeholder="Approved for immediate multi-department dispatch by Zone Counselor..."
                        className="w-full p-2.5 rounded-xl bg-white border border-purple-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400"
                        rows={2}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer border border-purple-200"
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
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="glass-panel p-6 rounded-2xl border border-purple-200 max-w-lg w-full space-y-4 shadow-2xl bg-white">
                    <div className="flex items-center gap-3 text-amber-600">
                      <AlertTriangle className="w-6 h-6" />
                      <h3 className="text-lg font-bold text-slate-900 font-mono">
                        Request Changes to Response Plan
                      </h3>
                    </div>

                    <p className="text-xs text-slate-700 font-mono leading-relaxed">
                      Flag recommendations for adjustment before dispatching to department terminals.
                    </p>

                    <div>
                      <label className="text-xs font-mono text-slate-600 block mb-1">
                        Reason for Requested Changes:
                      </label>
                      <textarea
                        value={customNoteInput}
                        onChange={(e) => setCustomNoteInput(e.target.value)}
                        placeholder="Requesting 3x mobile pumps instead of 2 for Station 4B sump..."
                        className="w-full p-2.5 rounded-xl bg-white border border-purple-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
                      <button
                        onClick={() => setShowChangesModal(false)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold cursor-pointer border border-purple-200"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
