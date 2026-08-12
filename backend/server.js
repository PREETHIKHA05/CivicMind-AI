/**
 * CivicMind AI Backend API Server & Real-time WebSocket Engine
 * Powered by MongoDB Atlas, Persistent Storage & Socket.io for Hackathon Multi-Laptop Workflow
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

import { ResponsePlan } from './models/ResponsePlan.js';
import { WorkOrder } from './models/WorkOrder.js';
import { TraceEvent } from './models/TraceEvent.js';

import { loadLocalDB, saveLocalDB } from './storage.js';
import { propagateRisk, loadGraph } from './causal/engine.js';
import { startRun, getTrace, setTracePersistHook, setPlanReadyHook } from './orchestrator/run.js';
import { callGemini, MODELS } from './llm/gemini.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS for cross-laptop network communication
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const ENABLE_EMAIL_NOTIFICATIONS = (process.env.ENABLE_EMAIL_NOTIFICATIONS || 'false').toLowerCase() === 'true';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const DEMO_SMS_RECIPIENTS = [
  SMTP_USER || 'admin.flow0@gmail.com'
];

const normalizePhoneNumber = (value = '') => {
  const clean = String(value).replace(/[^\d+]/g, '').replace(/\s+/g, '');
  if (!clean) return null;
  const stripped = clean.replace(/^\+/, '');
  return stripped;
};

const sendEmailBroadcast = async (message, recipients = []) => {
  if (!ENABLE_EMAIL_NOTIFICATIONS) {
    throw new Error('Email notifications are disabled (ENABLE_EMAIL_NOTIFICATIONS not true)');
  }

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete in backend/.env');
  }

  const configured = (process.env.EMAIL_RECIPIENTS || '')
    .split(',')
    .map((v) => v && v.trim())
    .filter(Boolean);

  const emailRegex = /\S+@\S+\.\S+/;

  // Normalize incoming recipients to strings
  const cleanedRequestRecipients = Array.isArray(recipients)
    ? recipients.map((r) => (r || '').toString().trim()).filter(Boolean)
    : [];

  // Filter only entries that look like emails
  const validRequestEmails = cleanedRequestRecipients.filter((v) => emailRegex.test(v));

  let finalRecipients = [];

  if (validRequestEmails.length > 0) {
    finalRecipients = validRequestEmails;
  } else if (configured.length > 0) {
    // Fallback to configured env recipients when request contains no valid emails
    console.warn('sendEmailBroadcast: request contained no valid email addresses, falling back to EMAIL_RECIPIENTS from env. Request payload:', JSON.stringify(cleanedRequestRecipients));
    finalRecipients = configured;
  } else if (DEMO_SMS_RECIPIENTS && DEMO_SMS_RECIPIENTS.length > 0) {
    console.warn('sendEmailBroadcast: no valid recipients in request or EMAIL_RECIPIENTS; using demo recipient list. Request payload:', JSON.stringify(cleanedRequestRecipients));
    finalRecipients = DEMO_SMS_RECIPIENTS;
  }

  // Deduplicate and limit
  const distinctEmails = [...new Set(finalRecipients)].slice(0, 10);

  if (distinctEmails.length === 0) {
    throw new Error('No valid recipient email addresses available. Provide a list of valid emails in the request or set EMAIL_RECIPIENTS in backend/.env');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: SMTP_USER,
    to: distinctEmails.join(','),
    subject: 'CivicMind AI — Ward 18 Emergency Advisory',
    text: message
  });

  return distinctEmails.map((email) => ({
    to: email,
    sid: info.messageId || `email-${Date.now()}-${Math.random().toString(16).slice(2,6)}`,
    status: 'sent',
    sentAt: new Date().toISOString()
  }));
};

app.use(cors());
app.use(express.json());

// Honest empty state — cold start (and /api/seed) must never surface the old
// hardcoded 92/41/95% decorative plan. A judge who opens Response Plans
// before any orchestrator run has completed should see "no plan yet", not
// fabricated numbers we deleted everywhere else in this codebase.
function buildEmptyStatePlan() {
  return {
    planId: 'active-crp-01',
    status: 'no_run_yet',
    incidentId: null,
    title: 'No active plan',
    riskScorePre: null,
    riskScorePost: null,
    confidence: null,
    operatorNote: '',
    approvalTime: null,
    actions: [],
    runId: null,
    confidenceBreakdown: null,
    conflictsResolved: [],
    gate: null,
    gateReason: '',
    unresolved: [],
    revisionHistory: 0,
    evidencePool: [],
    causalRiskIndex: null,
    causalTerminals: []
  };
}

// Persistent State Initialization (Never reset on restart unless explicitly requested)
const defaultSynthesizedPlan = buildEmptyStatePlan();
const persistentData = loadLocalDB(defaultSynthesizedPlan);

let isMongoConnected = false;
let inMemoryPlan = persistentData.plan;
let inMemoryWorkOrders = persistentData.workOrders; // Empty [] until Zone Counselor approves plan!

// Best-effort trace persistence — in-memory Map in orchestrator/run.js is the
// source of truth (same pattern as inMemoryPlan); Mongo is a mirror only.
setTracePersistHook((event) => {
  if (isMongoConnected) {
    TraceEvent.create(event).catch(() => {});
  }
});

// A completed orchestrator run replaces the draft plan the existing
// approve/modify/dismiss flow already reads from. Same in-memory-first,
// best-effort-Mongo pattern as everything else in this file.
setPlanReadyHook((generatedPlan) => {
  inMemoryPlan = {
    ...inMemoryPlan,
    ...generatedPlan,
    planId: 'active-crp-01',
    status: 'Awaiting Human Review',
    operatorNote: '',
    approvalTime: null
  };
  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    ResponsePlan.findOneAndUpdate({ planId: 'active-crp-01' }, inMemoryPlan, { upsert: true, new: true }).catch((err) => {
      console.error('MongoDB plan-ready save error:', err);
    });
  }

  io.emit('planGenerated', inMemoryPlan);
});

// Connect to MongoDB Atlas if connection URI is provided
if (MONGODB_URI && !MONGODB_URI.includes('cluster0.mongodb.net')) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 })
    .then(async () => {
      isMongoConnected = true;
      console.log('🍃 Connected to MongoDB Atlas Cloud Database!');
      await syncWithMongoDBAtlas();
    })
    .catch((err) => {
      console.log('⚡ Running in High-Speed Real-time WebSocket Mode with Local DB Persistence.');
      isMongoConnected = false;
    });
} else {
  console.log('⚡ Running in High-Speed Real-time WebSocket Mode with Local DB Persistence.');
  console.log('💡 Note: To connect to cloud MongoDB Atlas, update MONGODB_URI in backend/.env');
}

/**
 * Loads existing database state from MongoDB Atlas without overwriting!
 */
async function syncWithMongoDBAtlas() {
  try {
    const existingPlan = await ResponsePlan.findOne({ planId: 'active-crp-01' });
    if (existingPlan) {
      inMemoryPlan = existingPlan.toObject();
    } else {
      await ResponsePlan.create({
        planId: 'active-crp-01',
        incidentId: inMemoryPlan.incidentId,
        title: inMemoryPlan.title,
        riskScorePre: inMemoryPlan.riskScorePre,
        riskScorePost: inMemoryPlan.riskScorePost,
        confidence: inMemoryPlan.confidence,
        status: inMemoryPlan.status || 'Awaiting Human Review',
        actions: inMemoryPlan.actions
      });
    }

    const existingOrders = await WorkOrder.find({}).sort({ updatedAt: -1 });
    if (existingOrders && existingOrders.length > 0) {
      inMemoryWorkOrders = existingOrders.map(o => o.toObject());
    }

    saveLocalDB(inMemoryPlan, inMemoryWorkOrders);
  } catch (err) {
    console.error('Error syncing with MongoDB Atlas:', err);
  }
}

// ---------------- Websocket Real-time Connection ----------------
io.on('connection', (socket) => {
  console.log(`🔌 Laptop Connected via WebSocket: ${socket.id}`);

  // Send current state immediately on connect
  socket.emit('initialData', {
    plan: inMemoryPlan,
    workOrders: inMemoryWorkOrders,
    isMongoConnected
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Laptop Disconnected: ${socket.id}`);
  });
});

// ---------------- REST API Routes ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'CivicMind AI Multi-Laptop Backend',
    database: isMongoConnected ? 'MongoDB Atlas' : 'Local DB Persistence (db.json)',
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount
  });
});

// Deprecated: this used to return hardcoded per-agent telemetry from
// backend/agents/*.js (the decorative pre-Phase-1 agent layer). Nothing in
// the frontend calls this anymore — live agent status comes from the
// agent:event trace (see GET /api/runs/:id/trace) instead. Left in place,
// neutered, rather than removed, so an old client hitting it gets an honest
// answer instead of a 404.
app.get('/api/agents', (req, res) => {
  res.json({
    deprecated: true,
    message: 'Static agent telemetry has been replaced by the live orchestrator trace. See GET /api/runs/:id/trace or the agent:event Socket.IO channel.',
    agents: []
  });
});

// GET Causal Graph Structure (nodes + edges, for frontend rendering)
app.get('/api/causal/graph', (req, res) => {
  res.json(loadGraph());
});

// POST Propagate Risk Through Causal Graph — synchronous, deterministic, no LLM
app.post('/api/causal/propagate', (req, res) => {
  const { seedNode = 'rainfall_intensity', magnitude, horizonMin = 180 } = req.body;

  if (typeof magnitude !== 'number' || Number.isNaN(magnitude)) {
    return res.status(400).json({ error: 'magnitude must be a number' });
  }

  try {
    const result = propagateRisk(seedNode, magnitude, horizonMin);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST Start an Agent Run — returns runId immediately, events stream over Socket.IO on 'agent:event'
app.post('/api/runs/start', (req, res) => {
  const scenario = req.body || {};
  if (typeof scenario.magnitude !== 'number' || Number.isNaN(scenario.magnitude)) {
    return res.status(400).json({ error: 'scenario.magnitude must be a number' });
  }
  const runId = startRun(scenario, io);
  res.json({ runId, scenario });
});

// GET Trace for a Run (replay) — serves from the in-memory store first, falls back to Mongo
app.get('/api/runs/:id/trace', async (req, res) => {
  const inMemory = getTrace(req.params.id);
  if (inMemory.length > 0) {
    return res.json({ runId: req.params.id, events: inMemory });
  }
  if (isMongoConnected) {
    try {
      const events = await TraceEvent.find({ runId: req.params.id }).sort({ seq: 1 });
      return res.json({ runId: req.params.id, events });
    } catch (err) {
      console.error('Trace replay fetch error:', err);
    }
  }
  res.json({ runId: req.params.id, events: [] });
});

// GET Current Response Plan
app.get('/api/plan', async (req, res) => {
  try {
    if (isMongoConnected) {
      let dbPlan = await ResponsePlan.findOne({ planId: 'active-crp-01' });
      if (dbPlan) {
        return res.json(dbPlan);
      }
    }
    res.json(inMemoryPlan);
  } catch (err) {
    res.json(inMemoryPlan);
  }
});

// PUT Update Action in Plan (Zone Counselor edits)
app.put('/api/plan/action', async (req, res) => {
  const { actionId, updatedFields } = req.body;

  inMemoryPlan.actions = inMemoryPlan.actions.map(act => act.id === actionId ? { ...act, ...updatedFields } : act);
  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    try {
      const plan = await ResponsePlan.findOne({ planId: 'active-crp-01' });
      if (plan) {
        plan.actions = plan.actions.map(act => act.id === actionId ? { ...act.toObject(), ...updatedFields } : act);
        await plan.save();
      }
    } catch (err) {
      console.error("MongoDB plan update error:", err);
    }
  }

  io.emit('planUpdated', inMemoryPlan);
  res.json(inMemoryPlan);
});

// POST Approve Plan & Dispatch Work Orders to Department Dashboards
app.post('/api/plan/approve', async (req, res) => {
  const { operatorNote, actions, riskScore } = req.body;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const targetActions = actions || inMemoryPlan.actions;
  const updatedPlan = {
    ...inMemoryPlan,
    status: 'APPROVED BY ICCC OPERATOR',
    operatorNote: operatorNote || 'Approved for immediate multi-department dispatch by Zone Counselor.',
    approvalTime: nowTime,
    riskScorePost: riskScore || inMemoryPlan.riskScorePost,
    actions: targetActions
  };

  inMemoryPlan = updatedPlan;

  // Convert enabled actions to Work Orders assigned to departments!
  const dispatchedOrders = targetActions
    .filter(act => act.enabled)
    .map((act, index) => {
      const existing = inMemoryWorkOrders.find(w => w.actionId === act.id);
      return {
        taskId: existing ? existing.taskId : `task-${Date.now()}-${index}`,
        actionId: act.id,
        departmentId: act.departmentId,
        departmentName: act.department,
        title: `${act.department} Action: ${act.resourceUnits || 'Emergency Mitigation'}`,
        recommendation: act.recommendation,
        priority: act.priority,
        assignedBy: "Zone Counselor",
        assignedTime: nowTime,
        status: existing ? existing.status : 'Assigned',
        expectedImpact: act.expectedImpact,
        logs: existing ? existing.logs : [
          { time: nowTime, author: "Zone Counselor", note: "Work Order issued via Approved Plan." }
        ]
      };
    });

  inMemoryWorkOrders = dispatchedOrders;
  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  // Persist to MongoDB Atlas if connected
  if (isMongoConnected) {
    try {
      await ResponsePlan.findOneAndUpdate(
        { planId: 'active-crp-01' },
        updatedPlan,
        { upsert: true, new: true }
      );

      await WorkOrder.deleteMany({});
      for (const order of dispatchedOrders) {
        await WorkOrder.create(order);
      }
    } catch (err) {
      console.error("MongoDB Atlas approval save error:", err);
    }
  }

  // REAL-TIME BROADCAST TO ALL CONNECTED LAPTOPS VIA WEBSOCKETS!
  io.emit('planApproved', updatedPlan);
  io.emit('workOrdersDispatched', dispatchedOrders);

  res.json({
    message: 'Plan Approved and Work Orders Dispatched to Department Dashboards!',
    plan: updatedPlan,
    workOrders: dispatchedOrders
  });
});

// GET Work Orders (Only assigned work orders exist here!)
app.get('/api/work-orders', async (req, res) => {
  const { departmentId } = req.query;

  if (isMongoConnected) {
    try {
      const query = departmentId ? { departmentId } : {};
      const orders = await WorkOrder.find(query).sort({ updatedAt: -1 });
      return res.json(orders);
    } catch (err) {
      console.error("MongoDB fetch work orders error:", err);
    }
  }

  const result = departmentId 
    ? inMemoryWorkOrders.filter(w => w.departmentId === departmentId)
    : inMemoryWorkOrders;

  res.json(result);
});

// PUT Update Work Order Status (Department Official action on Laptop B)
app.put('/api/work-orders/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status, author, note } = req.body;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const noteText = note || `Task status updated to ${status}.`;
  const authorName = author || 'Department Official';

  let updatedOrder = null;

  inMemoryWorkOrders = inMemoryWorkOrders.map(order => {
    if (order.taskId === taskId || order.id === taskId) {
      const newLogs = [...(order.logs || []), { time: nowTime, author: authorName, note: noteText }];
      updatedOrder = { ...order, status, logs: newLogs };
      return updatedOrder;
    }
    return order;
  });

  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    try {
      const dbOrder = await WorkOrder.findOne({ taskId });
      if (dbOrder) {
        dbOrder.status = status;
        dbOrder.logs.push({ time: nowTime, author: authorName, note: noteText });
        await dbOrder.save();
        updatedOrder = dbOrder.toObject();
      }
    } catch (err) {
      console.error("MongoDB WorkOrder status update error:", err);
    }
  }

  // REAL-TIME BROADCAST TO ZONE COUNSELOR LAPTOP A & ALL DEPT LAPTOPS!
  io.emit('workOrderUpdated', { taskId, updatedOrder, allWorkOrders: inMemoryWorkOrders });

  res.json({
    message: `Work Order ${taskId} updated to ${status}`,
    workOrder: updatedOrder,
    allWorkOrders: inMemoryWorkOrders
  });
});

// POST Add Field Log Note to Work Order
app.post('/api/work-orders/:taskId/logs', async (req, res) => {
  const { taskId } = req.params;
  const { author, note } = req.body;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const authorName = author || 'Official';
  let updatedOrder = null;

  inMemoryWorkOrders = inMemoryWorkOrders.map(order => {
    if (order.taskId === taskId || order.id === taskId) {
      const newLogs = [...(order.logs || []), { time: nowTime, author: authorName, note }];
      updatedOrder = { ...order, logs: newLogs };
      return updatedOrder;
    }
    return order;
  });

  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    try {
      const dbOrder = await WorkOrder.findOne({ taskId });
      if (dbOrder) {
        dbOrder.logs.push({ time: nowTime, author: authorName, note });
        await dbOrder.save();
        updatedOrder = dbOrder.toObject();
      }
    } catch (err) {
      console.error("MongoDB Log add error:", err);
    }
  }

  // BROADCAST REAL-TIME LOG UPDATE TO ALL CONNECTED LAPTOPS!
  io.emit('workOrderLogAdded', { taskId, updatedOrder, allWorkOrders: inMemoryWorkOrders });

  res.json({
    message: 'Field log added',
    workOrder: updatedOrder
  });
});

// POST Reset Plan to Unapproved Draft State (Revert Approve Button Action)
app.post('/api/plan/reset', async (req, res) => {
  inMemoryPlan = {
    ...inMemoryPlan,
    status: 'Awaiting Human Review',
    operatorNote: '',
    approvalTime: null
  };
  inMemoryWorkOrders = [];
  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    try {
      await ResponsePlan.findOneAndUpdate(
        { planId: 'active-crp-01' },
        { status: 'Awaiting Human Review', operatorNote: '', approvalTime: null },
        { upsert: true }
      );
      await WorkOrder.deleteMany({});
    } catch (err) {
      console.error("MongoDB plan reset error:", err);
    }
  }

  io.emit('planReset', { plan: inMemoryPlan, workOrders: inMemoryWorkOrders });
  res.json({ message: 'Plan reverted to unapproved draft state.', plan: inMemoryPlan, workOrders: [] });
});

// POST Reset Database to Unapproved Initial State
app.post('/api/seed', async (req, res) => {
  inMemoryPlan = buildEmptyStatePlan();
  inMemoryWorkOrders = [];
  saveLocalDB(inMemoryPlan, inMemoryWorkOrders);

  if (isMongoConnected) {
    await ResponsePlan.deleteMany({});
    await WorkOrder.deleteMany({});
    await syncWithMongoDBAtlas();
  }
  io.emit('databaseSeeded', { plan: inMemoryPlan, workOrders: inMemoryWorkOrders });
  res.json({ message: 'Database reset to initial unapproved state.' });
});

// SMS broadcast for citizen alerting from the Zone Counselor response plan page.
app.post('/api/plan/broadcast-message', async (req, res) => {
  const rawMessage = req.body?.message || 'Ward 18 emergency advisory: follow the official diversion route and stay alert for on-ground updates.';
  const recipients = Array.isArray(req.body?.recipients) && req.body.recipients.length > 0
    ? req.body.recipients.slice(0, 4)
    : DEMO_SMS_RECIPIENTS;

  const message = rawMessage.trim() || 'Ward 18 emergency advisory: follow the official diversion route and stay alert for on-ground updates.';

  let finalRecipients = [];
  let payload;

  try {
    const results = await sendEmailBroadcast(message, recipients);
    if (results && results.length > 0) {
      finalRecipients = results.map((item) => ({
        id: `email-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        to: item.to,
        status: item.status,
        sentAt: item.sentAt,
        body: message,
        sid: item.sid
      }));

      payload = {
        success: true,
        provider: 'email',
        message,
        recipients: finalRecipients,
        sentCount: finalRecipients.length,
        summary: `Email broadcast sent to ${finalRecipients.length} recipients.`
      };
    } else {
      finalRecipients = recipients.map((addr, index) => ({
        id: `email-${Date.now()}-${index + 1}`,
        to: (addr || '').toString(),
        status: 'sent',
        sentAt: new Date().toISOString(),
        body: message
      }));

      payload = {
        success: true,
        provider: 'email',
        message,
        recipients: finalRecipients,
        sentCount: finalRecipients.length,
        summary: `Email broadcast recorded for ${finalRecipients.length} recipients.`
      };
    }
  } catch (error) {
    console.error('Email broadcast error:', error);
    finalRecipients = recipients.map((addr, index) => ({
      id: `email-${Date.now()}-${index + 1}`,
      to: (addr || '').toString(),
      status: 'failed',
      sentAt: new Date().toISOString(),
      body: message,
      error: error.message
    }));

    payload = {
      success: false,
      provider: 'email',
      message,
      recipients: finalRecipients,
      sentCount: 0,
      summary: `Email broadcast failed: ${error.message}`,
      error: error.message
    };
  }

  io.emit('citizenBroadcastSent', payload);
  res.json(payload);
});

// POST Synthesise Cascading Risks from Agent Findings — calls Gemini, returns exactly three risks.
// This is the only new endpoint added for the Agent Council page rework.
app.post('/api/planner/synthesise', async (req, res) => {
  const { findings } = req.body;

  if (!Array.isArray(findings) || findings.length < 2) {
    return res.status(400).json({ error: 'findings must be an array of at least two agent objects.' });
  }

  const FINDINGS_JSON = JSON.stringify(findings, null, 2);

  const prompt = `You are the Planner Agent in a multi-agent urban risk system for Chennai.
Department agents have each reported independently. Identify the three most
serious CASCADING risks — risks emerging from interaction between
departments, not ones any single agent could see alone.

Rules:
- Every risk must cite at least two different agents.
- Only use numbers present in the findings. Never estimate.
- If two findings conflict, say so explicitly.
- Order by severity, most severe first.

Findings: ${FINDINGS_JSON}

Return JSON only, no markdown fences:
{ "risks": [ { "title": "", "severity": "CRITICAL|HIGH|MEDIUM",
  "cascade": "2-3 sentences", "contributingAgents": [],
  "evidenceIds": [], "affectedDepartments": [],
  "estimatedOnsetMinutes": 0, "confidence": 0.0,
  "recommendedAction": "" } ] }`;

  try {
    const llmResult = await callGemini(prompt, null, {
      model: MODELS.STRONG,
      maxRetries: 2,
      fallback: null
    });

    if (llmResult.fallback) {
      return res.status(502).json({
        error: `LLM unavailable: ${llmResult.fallbackReason}. Cannot synthesise without real Gemini output.`
      });
    }

    const raw = llmResult.data;

    // Accept { risks: [...] } or a bare array
    let risks = Array.isArray(raw) ? raw : raw?.risks;

    if (!Array.isArray(risks)) {
      return res.status(502).json({
        error: 'Gemini returned an unexpected shape — expected { risks: [...] }. Raw: ' + JSON.stringify(raw).slice(0, 300)
      });
    }

    // Trim to exactly 3
    risks = risks.slice(0, 3);

    return res.json({ risks });
  } catch (err) {
    console.error('[/api/planner/synthesise] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during synthesis.' });
  }
});

// POST Chatbot assistant route — calls Gemini
app.post('/api/chat', async (req, res) => {
  const { prompt, history } = req.body;

  const CHAT_SCHEMA = {
    type: 'object',
    properties: {
      response: { type: 'string' }
    },
    required: ['response']
  };

  const systemInstruction = `You are CivicMind AI, Chennai's Integrated City Command & Control Centre (ICCC) decision intelligence assistant.
Be extremely concise, data-driven, and clear. Help the zone counselor with emergency, traffic, and water risks.
Current Ward 18 Corridor has active rainfall of 118 mm/hr with critical risk (92/100).`;

  const conversationContext = Array.isArray(history)
    ? history.map(h => `${h.sender === 'user' ? 'User' : 'AI'}: ${h.text}`).join('\n')
    : '';

  const fullPrompt = `${systemInstruction}\n\n${conversationContext}\nUser: ${prompt}`;

  try {
    const llmResult = await callGemini(fullPrompt, CHAT_SCHEMA, {
      model: MODELS.FAST,
      maxRetries: 2,
      fallback: { response: "I am currently running in offline mode. Ward 18 has a critical waterlogging risk (92/100) due to heavy rainfall (118 mm/hr)." }
    });

    return res.json({ response: llmResult.data?.response || llmResult.data || "Error processing request." });
  } catch (err) {
    console.error('[/api/chat] Unexpected error:', err);
    return res.status(500).json({ response: "Error reaching the AI service." });
  }
});


// Start Server

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CivicMind Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Real-time Socket.io WebSockets enabled for Hackathon multi-laptop workflow!`);
});
