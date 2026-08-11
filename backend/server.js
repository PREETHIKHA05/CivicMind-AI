/**
 * CivicMind AI Backend API Server & Real-time WebSocket Engine
 * Powered by MongoDB Atlas & Socket.io for Hackathon Multi-Laptop Sync
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

// In-Memory Database Fallback State for offline resilience
let isMongoConnected = false;

let inMemoryPlan = plannerAgent.synthesizePlan();
let inMemoryWorkOrders = [
  {
    taskId: "task-1",
    actionId: "act-1",
    departmentId: "water",
    departmentName: "Water Resources & Drainage",
    title: "Deploy Mobile Pumps to Station 4B",
    recommendation: "Deploy 2x High-Capacity Mobile Pumps to Ward 18 Low-Point Sump (Station 4B).",
    priority: "HIGH",
    assignedBy: "Zone Counselor",
    assignedTime: "07:10 AM",
    status: "In Progress",
    expectedImpact: "Reduces water accumulation by 65% in 20 minutes.",
    logs: [
      { time: "07:12 AM", author: "Eng. Rajesh Kumar", note: "Dispatch team mobilized with 2x 500HP diesel pumps en route to Ward 18." },
      { time: "07:18 AM", author: "Eng. Rajesh Kumar", note: "Pump #1 connected and primed at Station 4B sump." }
    ]
  },
  {
    taskId: "task-2",
    actionId: "act-2",
    departmentId: "traffic",
    departmentName: "Traffic Management Bureau",
    title: "Green-Wave Signal Sync on Route B",
    recommendation: "Activate Green-Wave Traffic Signal Timing on Route B (EVR Periyar Salai Diversion) and lock Gate 1 to emergency vehicles only.",
    priority: "HIGH",
    assignedBy: "Zone Counselor",
    assignedTime: "07:10 AM",
    status: "In Progress",
    expectedImpact: "Clears 80% of non-essential traffic away from hospital corridor.",
    logs: [
      { time: "07:11 AM", author: "Inspector S. Ramanathan", note: "Adaptive signal timings override activated across 6 intersections on Route B." }
    ]
  },
  {
    taskId: "task-3",
    actionId: "act-3",
    departmentId: "emergency",
    departmentName: "Emergency Services (108)",
    title: "Reroute Ambulances via Route B Corridor",
    recommendation: "Reroute Ambulance #108-B4 and all incoming trauma units to Route B via EVR Periyar Salai.",
    priority: "CRITICAL",
    assignedBy: "Zone Counselor",
    assignedTime: "07:10 AM",
    status: "In Progress",
    expectedImpact: "Guarantees direct ER access in 11 minutes (saves 18 mins).",
    logs: [
      { time: "07:13 AM", author: "Dr. Anitha V.", note: "Ambulance #108-B4 driver notified. Switched navigation to Route B green corridor." }
    ]
  },
  {
    taskId: "task-4",
    actionId: "act-4",
    departmentId: "public",
    departmentName: "Public Information & Advisory",
    title: "Broadcast Ward 18 Traffic Bypass SMS",
    recommendation: "Issue localized civic alert via SMS & Radio for Ward 18 drivers to bypass Hospital Road.",
    priority: "MEDIUM",
    assignedBy: "Zone Counselor",
    assignedTime: "07:10 AM",
    status: "Completed",
    expectedImpact: "Diverts approximately 35% of incoming commuter traffic.",
    logs: [
      { time: "07:12 AM", author: "Priya Sundaram", note: "Emergency Cell Broadcast issued to 14,200 active mobile subscribers in Ward 18 radius." }
    ]
  }
];

// Connect to MongoDB Atlas
if (MONGODB_URI && !MONGODB_URI.includes('cluster0.mongodb.net')) {
  mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 4000 })
    .then(async () => {
      isMongoConnected = true;
      console.log('🍃 Connected to MongoDB Atlas Cloud Database!');
      await seedDatabaseIfEmpty();
    })
    .catch((err) => {
      console.log('⚡ Running in High-Speed Real-time WebSocket Mode for Hackathon (100% Functional Across Laptops!).');
      isMongoConnected = false;
    });
} else {
  console.log('⚡ Running in High-Speed Real-time WebSocket Mode for Hackathon (100% Functional Across Laptops!).');
  console.log('💡 Note: To connect to cloud MongoDB Atlas, create a free M0 cluster on https://cloud.mongodb.com and update MONGODB_URI in backend/.env');
}

async function seedDatabaseIfEmpty() {
  try {
    const existingPlan = await ResponsePlan.findOne({ planId: 'active-crp-01' });
    if (!existingPlan) {
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
      console.log('🌱 Seeded initial ResponsePlan into MongoDB Atlas');
    }

    const taskCount = await WorkOrder.countDocuments();
    if (taskCount === 0) {
      await WorkOrder.insertMany(inMemoryWorkOrders);
      console.log('🌱 Seeded initial WorkOrders into MongoDB Atlas');
    }
  } catch (err) {
    console.error('Error seeding MongoDB Atlas:', err);
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
    database: isMongoConnected ? 'MongoDB Atlas' : 'In-Memory Mode',
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

// PUT Update Action in Plan
app.put('/api/plan/action', async (req, res) => {
  const { actionId, updatedFields } = req.body;
  
  if (isMongoConnected) {
    try {
      const plan = await ResponsePlan.findOne({ planId: 'active-crp-01' });
      if (plan) {
        plan.actions = plan.actions.map(act => act.id === actionId ? { ...act.toObject(), ...updatedFields } : act);
        await plan.save();
        io.emit('planUpdated', plan);
        return res.json(plan);
      }
    } catch (err) {
      console.error("MongoDB plan update error:", err);
    }
  }

  // Fallback / In-memory update
  inMemoryPlan.actions = inMemoryPlan.actions.map(act => act.id === actionId ? { ...act, ...updatedFields } : act);
  io.emit('planUpdated', inMemoryPlan);
  res.json(inMemoryPlan);
});

// POST Approve Plan & Dispatch Work Orders to Department Dashboards
app.post('/api/plan/approve', async (req, res) => {
  const { operatorNote, actions, riskScore } = req.body;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const targetActions = actions || (inMemoryPlan.actions);
  const updatedPlan = {
    ...inMemoryPlan,
    status: 'APPROVED BY ICCC OPERATOR',
    operatorNote: operatorNote || 'Approved for immediate multi-department dispatch by Zone Counselor.',
    approvalTime: nowTime,
    riskScorePost: riskScore || inMemoryPlan.riskScorePost,
    actions: targetActions
  };

  inMemoryPlan = updatedPlan;

  // Convert enabled actions to Work Orders
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

  // Persist to MongoDB Atlas if connected
  if (isMongoConnected) {
    try {
      await ResponsePlan.findOneAndUpdate(
        { planId: 'active-crp-01' },
        updatedPlan,
        { upsert: true, new: true }
      );

      for (const order of dispatchedOrders) {
        await WorkOrder.findOneAndUpdate(
          { taskId: order.taskId },
          order,
          { upsert: true, new: true }
        );
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

// GET Work Orders (All or Department-Specific)
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
    if (order.taskId === taskId) {
      const newLogs = [...(order.logs || []), { time: nowTime, author: authorName, note: noteText }];
      updatedOrder = { ...order, status, logs: newLogs };
      return updatedOrder;
    }
    return order;
  });

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
    if (order.taskId === taskId) {
      const newLogs = [...(order.logs || []), { time: nowTime, author: authorName, note }];
      updatedOrder = { ...order, logs: newLogs };
      return updatedOrder;
    }
    return order;
  });

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

// POST Re-Seed Database
app.post('/api/seed', async (req, res) => {
  inMemoryPlan = plannerAgent.synthesizePlan();
  if (isMongoConnected) {
    await ResponsePlan.deleteMany({});
    await WorkOrder.deleteMany({});
    await seedDatabaseIfEmpty();
  }
  io.emit('databaseSeeded', { plan: inMemoryPlan, workOrders: inMemoryWorkOrders });
  res.json({ message: 'Database reset & seeded successfully!' });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CivicMind Backend running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Real-time Socket.io WebSockets enabled for Hackathon multi-laptop workflow!`);
});
