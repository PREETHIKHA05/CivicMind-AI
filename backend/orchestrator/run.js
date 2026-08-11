/**
 * Orchestrator skeleton. Phase 2: causal engine is real, everything else is a
 * stubbed placeholder. Phases 3-5 replace the stubs one agent at a time
 * without changing this file's event contract.
 */
import { propagateRisk } from '../causal/engine.js';

const AGENT_IDS = ['weather', 'water', 'traffic', 'emergency', 'citizen', 'memory'];

const seqCounters = new Map(); // runId -> next seq
export const traceStore = new Map(); // runId -> events[]

// Best-effort persistence hook — set by server.js once Mongoose is available,
// so this module doesn't need to know about the DB layer. Same "in-memory is
// the source of truth, persistence is best-effort" pattern as inMemoryPlan.
let persistHook = null;
export function setTracePersistHook(fn) {
  persistHook = fn;
}

function emit(io, runId, type, agent, payload, level = 'info') {
  const seq = seqCounters.get(runId) || 0;
  seqCounters.set(runId, seq + 1);

  const event = { runId, seq, ts: new Date().toISOString(), type, agent, payload, level };

  if (!traceStore.has(runId)) traceStore.set(runId, []);
  traceStore.get(runId).push(event);

  io.emit('agent:event', event);

  if (persistHook) {
    try {
      persistHook(event);
    } catch {
      // best-effort only — never let persistence break a live run
    }
  }

  return event;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function getTrace(runId) {
  return traceStore.get(runId) || [];
}

/**
 * Kicks off a run and returns its runId immediately (synchronously), then
 * streams events over Socket.IO as the (stubbed) pipeline executes.
 */
export function startRun(scenario, io) {
  const runId = `run-${Date.now()}`;
  seqCounters.set(runId, 0);
  traceStore.set(runId, []);

  // Fire and forget — caller gets runId back now, events stream separately.
  runAgents(scenario, io, runId).catch((err) => {
    emit(io, runId, 'run_aborted', 'ORCHESTRATOR', { error: err.message }, 'error');
  });

  return runId;
}

export async function runAgents(scenario, io, runId) {
  const magnitude = scenario.magnitude ?? 118;
  const seedNode = scenario.seedNode || 'rainfall_intensity';
  const horizonMin = scenario.horizonMin ?? 180;
  const extraSeeds = scenario.extraSeeds || [];

  emit(io, runId, 'run_started', 'ORCHESTRATOR', { scenario, runId }, 'info');
  await sleep(150);

  const causal = propagateRisk(seedNode, magnitude, horizonMin, undefined, extraSeeds);
  emit(io, runId, 'causal_computed', 'CAUSAL_ENGINE', {
    riskIndex: causal.riskIndex,
    terminals: causal.terminals,
    firedEdgeCount: causal.firedEdges.length,
    pathStrength: causal.pathStrength
  }, 'info');
  await sleep(150);

  // STUB routing — Phase 4 replaces this with the real enforced supervisor rules.
  const invokedAgents = causal.riskIndex > 40
    ? ['water', 'traffic', 'emergency', 'memory']
    : ['water', 'memory'];

  emit(io, runId, 'routing_decision', 'SUPERVISOR', {
    reason: `rainfall ${magnitude}mm/hr, riskIndex ${causal.riskIndex.toFixed(0)} -> invoke [${invokedAgents.join(', ')}] (stub)`,
    agents: invokedAgents
  }, 'info');
  await sleep(150);

  const stubFindings = {
    water: { conclusion: 'Drain saturation trending high; sump overflow risk within the hour. (stub)', confidence: 0.9 },
    weather: { conclusion: 'Rain cell stationary over Ward 18. (stub)', confidence: 0.92 },
    traffic: { conclusion: 'Corridor speed dropping; recommend signal override. (stub)', confidence: 0.85 },
    emergency: { conclusion: 'Ambulance transit at risk of delay on primary route. (stub)', confidence: 0.88 },
    citizen: { conclusion: 'Distress report cluster forming in Ward 18 South. (stub)', confidence: 0.8 },
    memory: { conclusion: 'Similar 2021 incident found; pump deployment reduced risk only partially. (stub)', confidence: 0.8 }
  };

  for (const agentId of invokedAgents) {
    emit(io, runId, 'agent_started', agentId.toUpperCase(), {}, 'info');
    await sleep(100);
    emit(io, runId, 'tool_call', agentId.toUpperCase(), { tool: 'stub_tool', args: {} }, 'info');
    await sleep(80);
    emit(io, runId, 'tool_result', agentId.toUpperCase(), { result: 'stubbed', durationMs: 120 }, 'info');
    await sleep(80);
    const finding = stubFindings[agentId] || { conclusion: 'No finding. (stub)', confidence: 0.5 };
    emit(io, runId, 'agent_finding', agentId.toUpperCase(), finding, 'info');
    await sleep(100);
  }

  emit(io, runId, 'memory_retrieved', 'MEMORY', { hits: 1, topSimilarity: 0.84 }, 'info');
  await sleep(100);

  if (causal.riskIndex > 60) {
    emit(io, runId, 'conflict_detected', 'PLANNER', {
      detail: 'Traffic proposed route R7; Water flagged R7 as saturated. (stub)'
    }, 'warn');
    await sleep(120);
    emit(io, runId, 'conflict_resolved', 'PLANNER', {
      resolution: 'Rejected R7, adopted R9 (+5 min transit cost). (stub)'
    }, 'warn');
    await sleep(120);
  }

  emit(io, runId, 'plan_drafted', 'PLANNER', { actionCount: 3 }, 'info');
  await sleep(150);
  emit(io, runId, 'critique', 'CRITIC', { verdict: 'APPROVE (stub)' }, 'info');
  await sleep(100);
  emit(io, runId, 'confidence_computed', 'ORCHESTRATOR', { confidence: 0.75 }, 'info');
  await sleep(100);

  const gate = causal.riskIndex >= 85 ? 'AUTO_EXECUTE' : causal.riskIndex < 40 ? 'ESCALATE' : 'HUMAN_APPROVAL';
  emit(io, runId, 'gate_decision', 'ORCHESTRATOR', { gate }, gate === 'ESCALATE' ? 'warn' : 'info');
  await sleep(100);

  emit(io, runId, 'run_completed', 'ORCHESTRATOR', {
    runId,
    agentsInvoked: invokedAgents,
    totalAgents: AGENT_IDS.length,
    riskIndex: causal.riskIndex,
    gate
  }, 'info');

  return { runId, causal, gate, agentsInvoked: invokedAgents };
}

export { AGENT_IDS };
