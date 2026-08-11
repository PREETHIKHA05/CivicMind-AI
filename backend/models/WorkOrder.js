import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  time: { type: String, required: true },
  author: { type: String, required: true },
  note: { type: String, required: true }
}, { _id: false });

const WorkOrderSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  actionId: { type: String, required: true },
  departmentId: { type: String, required: true, index: true },
  departmentName: { type: String, required: true },
  title: { type: String, required: true },
  recommendation: { type: String, required: true },
  priority: { type: String, default: 'HIGH' },
  assignedBy: { type: String, default: 'Zone Counselor' },
  assignedTime: { type: String },
  status: { type: String, enum: ['Assigned', 'In Progress', 'Completed'], default: 'Assigned' },
  expectedImpact: { type: String },
  logs: [LogSchema]
}, { timestamps: true });

export const WorkOrder = mongoose.models.WorkOrder || mongoose.model('WorkOrder', WorkOrderSchema);
