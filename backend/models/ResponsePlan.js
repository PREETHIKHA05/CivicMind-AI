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
  workOrderStatus: { type: String, default: 'Pending Dispatch' }
}, { _id: false });

const ResponsePlanSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true, default: 'active-crp-01' },
  incidentId: { type: String, default: 'INC-2026-081' },
  title: { type: String, default: 'Ward 18 Hospital Corridor Coordinated Emergency Mitigation' },
  riskScorePre: { type: Number, default: 92 },
  riskScorePost: { type: Number, default: 41 },
  confidence: { type: Number, default: 94 },
  status: { 
    type: String, 
    enum: ['Awaiting Human Review', 'APPROVED BY ICCC OPERATOR', 'Changes Requested', 'Dismissed'],
    default: 'Awaiting Human Review' 
  },
  operatorNote: { type: String, default: '' },
  approvalTime: { type: String, default: null },
  actions: [ActionSchema]
}, { timestamps: true });

export const ResponsePlan = mongoose.models.ResponsePlan || mongoose.model('ResponsePlan', ResponsePlanSchema);
