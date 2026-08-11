/**
 * Orchestrator. Causal engine, supervisor routing, all six domain agents, and
 * conflict detection are real (Phases 2-4). Plan drafting, critique,
 * confidence and gating are still stubbed placeholders — Phase 5 replaces
 * them without changing this file's event contract.
 */
import { propagateRisk } from '../causal/engine.js';
import { decideRouting } from './supervisor.js';
import { detectConflicts, resolveConflict } from './conflicts.js';
import { runWaterAgent } from './agents/waterAgent.js';
import { runWeatherAgent } from './agents/weatherAgent.js';
import { runTrafficAgent } from './agents/trafficAgent.js';
import { runEmergencyAgent } from './agents/emergencyAgent.js';
import { runCitizenAgent } from './agents/citizenAgent.js';
import { runMemoryAgent } from './agents/memoryAgent.js';

const AGENT_IDS = ['weather', 'water', 'traffic', 'emergency', 'citizen', 'memory'];

const AGENT_RUNNERS = {
  water: runWaterAgent,
  weather: runWeatherAgent,
  traffic: runTrafficAgent,
  emergency: runEmergencyAgent,
  citizen: runCitizenAgent,
  memory: runMemoryAgent
};

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
 * streams events over Socket.IO as the pipeline executes.
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
  await sleep(120);

  const causal = propagateRisk(seedNode, magnitude, horizonMin, undefined, extraSeeds);
  emit(io, runId, 'causal_computed', 'CAUSAL_ENGINE', {
    riskIndex: causal.riskIndex,
    terminals: causal.terminals,
    firedEdgeCount: causal.firedEdges.length,
    pathStrength: causal.pathStrength
  }, 'info');
  await sleep(120);

  const routing = await decideRouting(causal, scenario, 1);
  emit(io, runId, 'routing_decision', 'SUPERVISOR', {
    reason: routing.reason,
    agents: routing.agents,
    enforced: routing.enforced,
    geminiFallback: routing.geminiFallback
  }, 'info');
  await sleep(120);

  if (routing.action === 'ABORT') {
    emit(io, runId, 'run_aborted', 'ORCHESTRATOR', { error: routing.reason }, 'error');
    return { runId, causal, aborted: true };
  }

  const invokedAgents = routing.agents;
  const chainSummary = `rainfall ${magnitude}mm/hr, riskIndex ${causal.riskIndex.toFixed(0)}/100, terminals reached: ${causal.terminals.map((t) => `${t.id} (${t.activation.toFixed(0)})`).join(', ') || 'none'}`;
  const peerFindings = []; // essential: later agents see earlier agents' findings, not just parallel silence

  for (const agentId of invokedAgents) {
    emit(io, runId, 'agent_started', agentId.toUpperCase(), {}, 'info');
    await sleep(60);

    const agentEmit = (type, payload, level = 'info') => emit(io, runId, type, agentId.toUpperCase(), payload, level);
    const runner = AGENT_RUNNERS[agentId];
    if (!runner) continue;

    const { finding, geminiMeta } = await runner({ scenario, causal, chainSummary, peerFindings, emit: agentEmit });
    peerFindings.push(finding);

    agentEmit('agent_finding', {
      conclusion: finding.conclusion,
      confidence: finding.selfConfidence,
      evidenceIds: finding.evidenceIds,
      flags: finding.flags,
      geminiFallback: geminiMeta.fallback,
      geminiFallbackReason: geminiMeta.fallbackReason
    }, finding.flags?.length ? 'warn' : 'info');
    await sleep(80);
  }

  // Conflict detection — plain JS, no LLM. An if-statement over two agents'
  // structured output, not a model call.
  const conflicts = detectConflicts(peerFindings);
  const conflictsResolved = [];
  for (const conflict of conflicts) {
    emit(io, runId, 'conflict_detected', 'PLANNER', { detail: conflict.detail, conflict }, 'warn');
    await sleep(100);

    const resolution = resolveConflict(conflict, scenario);
    conflictsResolved.push({ conflict, resolution });

    // Feed the resolution back into Traffic's finding so downstream planning sees the adopted route.
    const trafficFinding = peerFindings.find((f) => f.agent === 'traffic');
    if (trafficFinding && resolution.adoptedRoute) {
      trafficFinding.proposedRoute = resolution.adoptedRoute;
      trafficFinding.conflictOverride = resolution;
    }

    emit(io, runId, 'conflict_resolved', 'PLANNER', { resolution: resolution.resolution, ...resolution }, 'warn');
    await sleep(100);
  }

  // STUB — Phase 5 replaces plan drafting / critique / confidence / gating with the real thing.
  emit(io, runId, 'plan_drafted', 'PLANNER', { actionCount: peerFindings.length, findingsUsed: peerFindings.length }, 'info');
  await sleep(120);
  emit(io, runId, 'critique', 'CRITIC', { verdict: 'APPROVE (stub)' }, 'info');
  await sleep(100);
  emit(io, runId, 'confidence_computed', 'ORCHESTRATOR', { confidence: 0.75 }, 'info');
  await sleep(100);

  const gate = causal.riskIndex >= 85 ? 'AUTO_EXECUTE' : causal.riskIndex < 40 ? 'ESCALATE' : 'HUMAN_APPROVAL';
  emit(io, runId, 'gate_decision', 'ORCHESTRATOR', { gate }, gate === 'ESCALATE' ? 'warn' : 'info');
  await sleep(80);

  emit(io, runId, 'run_completed', 'ORCHESTRATOR', {
    runId,
    agentsInvoked: invokedAgents,
    totalAgents: AGENT_IDS.length,
    riskIndex: causal.riskIndex,
    gate,
    conflictCount: conflicts.length
  }, 'info');

  return { runId, causal, gate, agentsInvoked: invokedAgents, peerFindings, conflictsResolved };
}

export { AGENT_IDS };
