import mongoose from 'mongoose';

const TraceEventSchema = new mongoose.Schema({
  runId: { type: String, required: true, index: true },
  seq: { type: Number, required: true },
  ts: { type: String, required: true },
  type: { type: String, required: true },
  agent: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  level: { type: String, default: 'info' }
}, { timestamps: true });

TraceEventSchema.index({ runId: 1, seq: 1 }, { unique: true });

export const TraceEvent = mongoose.models.TraceEvent || mongoose.model('TraceEvent', TraceEventSchema);
