import mongoose from 'mongoose';

const ActionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  departmentId: { type: String, required: true },
  department: { type: String, required: true },
  deptColor: { type: String },
  deptIcon: { type: String },
  enabled: { type: Boolean, default: true },
  priority: { type: String, default: 'HIGH' },
  baseRiskImpact: { type: Number, default: 15 },
  resourceUnits: { type: String },
  resourceCount: { type: Number, default: 1 },
  recommendation: { type: String, required: true },
  reason: { type: String },
  confidence: { type: String, default: '94%' },
  expectedImpact: { type: String },
  workOrderStatus: { type: String, default: 'Pending Dispatch' },
  evidenceIds: { type: [String], default: [] },
  reversible: { type: Boolean, default: true }
}, { _id: false });

const ResponsePlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true, default: 'active-crp-01' },
  // Defaults are the empty state, not a fabricated plan — a document created without
  // explicit fields (there should be none; see buildEmptyStatePlan() in server.js)
  // must never surface fake numbers.
  incidentId: { type: String, default: null },
  title: { type: String, default: 'No active plan' },
  riskScorePre: { type: Number, default: null },
  riskScorePost: { type: Number, default: null },
  confidence: { type: Number, default: null },
  status: {
    type: String,
    enum: ['no_run_yet', 'Awaiting Human Review', 'APPROVED BY ICCC OPERATOR', 'Changes Requested', 'Dismissed'],
    default: 'no_run_yet'
  },
  operatorNote: { type: String, default: '' },
  approvalTime: { type: String, default: null },
  actions: [ActionSchema],
  // Additive fields populated by the real orchestrator (backend/orchestrator/run.js).
  runId: { type: String, default: null },
  confidenceBreakdown: { type: mongoose.Schema.Types.Mixed, default: null },
  conflictsResolved: { type: [mongoose.Schema.Types.Mixed], default: [] },
  gate: { type: String, default: null },
  gateReason: { type: String, default: '' },
  unresolved: { type: [String], default: [] },
  revisionHistory: { type: Number, default: 0 },
  evidencePool: { type: [mongoose.Schema.Types.Mixed], default: [] },
  causalRiskIndex: { type: Number, default: null },
  causalTerminals: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

export const ResponsePlan = mongoose.models.ResponsePlan || mongoose.model('ResponsePlan', ResponsePlanSchema);
