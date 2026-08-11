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

import { weatherAgent } from './agents/weatherAgent.js';
import { waterAgent } from './agents/waterAgent.js';
import { trafficAgent } from './agents/trafficAgent.js';
import { emergencyAgent } from './agents/emergencyAgent.js';
import { citizenAgent } from './agents/citizenAgent.js';
import { memoryAgent } from './agents/memoryAgent.js';
import { plannerAgent } from './agents/plannerAgent.js';

import { ResponsePlan } from './models/ResponsePlan.js';
import { WorkOrder } from './models/WorkOrder.js';
import { TraceEvent } from './models/TraceEvent.js';

import { loadLocalDB, saveLocalDB } from './storage.js';
import { propagateRisk, loadGraph } from './causal/engine.js';
import { startRun, getTrace, setTracePersistHook } from './orchestrator/run.js';

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

app.use(cors());
app.use(express.json());

// Persistent State Initialization (Never reset on restart unless explicitly requested)
const defaultSynthesizedPlan = plannerAgent.synthesizePlan();
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

// AI Agents Telemetry
app.get('/api/agents', (req, res) => {
  res.json({
    agents: [
      { ...weatherAgent, telemetry: weatherAgent.getTelemetry() },
      { ...waterAgent, telemetry: waterAgent.getTelemetry() },
      { ...trafficAgent, telemetry: trafficAgent.getTelemetry() },
      { ...emergencyAgent, telemetry: emergencyAgent.getTelemetry() },
      { ...citizenAgent, telemetry: citizenAgent.getTelemetry() },
      { ...memoryAgent, telemetry: memoryAgent.getTelemetry() },
      { ...plannerAgent }
    ]
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
  inMemoryPlan = plannerAgent.synthesizePlan();
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

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CivicMind Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Real-time Socket.io WebSockets enabled for Hackathon multi-laptop workflow!`);
});
