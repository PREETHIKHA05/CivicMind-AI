/**
 * Orchestrator. Causal engine, supervisor routing, all six domain agents, and
 * conflict detection are real (Phases 2-4). Plan drafting, critique,
 * confidence and gating are still stubbed placeholders — Phase 5 replaces
 * them without changing this file's event contract.
 */
import { propagateRisk } from '../causal/engine.js';
import { decideRouting } from './supervisor.js';
import { detectConflicts, resolveConflict } from './conflicts.js';
import { draftPlan } from './planner.js';
import { critiquePlan } from './critic.js';
import { computeConfidence, decideGate } from './confidence.js';
import { resetToolIdCounter } from '../tools/index.js';
import { runWaterAgent } from './agents/waterAgent.js';
import { runWeatherAgent } from './agents/weatherAgent.js';
import { runTrafficAgent } from './agents/trafficAgent.js';
import { runEmergencyAgent } from './agents/emergencyAgent.js';
import { runCitizenAgent, resetCitizenIdCounter } from './agents/citizenAgent.js';
import { runMemoryAgent, resetMemoryIdCounter } from './agents/memoryAgent.js';

const MAX_REVISIONS = 2;

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

// Called once per completed run with the final plan object (or null if the
// run aborted/escalated with no plan) — server.js uses this to replace the
// draft plan the existing approve/modify/dismiss flow already reads from.
let planReadyHook = null;
export function setPlanReadyHook(fn) {
  planReadyHook = fn;
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

  // Reset per run (not per process) so an identical scenario produces identical
  // tool-result ids, hence identical prompt text, hence identical cache keys —
  // required for DEMO_MODE's warm-cache replay to actually hit. Assumes one run
  // at a time, which matches this app's actual usage; concurrent runs would
  // collide on ids, but nothing in this codebase runs two orchestrator runs
  // simultaneously.
  resetToolIdCounter();
  resetCitizenIdCounter();
  resetMemoryIdCounter();

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
  const allToolResults = [];
  let memoryHits = [];

  for (const agentId of invokedAgents) {
    emit(io, runId, 'agent_started', agentId.toUpperCase(), {}, 'info');
    await sleep(60);

    const agentEmit = (type, payload, level = 'info') => emit(io, runId, type, agentId.toUpperCase(), payload, level);
    const runner = AGENT_RUNNERS[agentId];
    if (!runner) continue;

    const agentResult = await runner({ scenario, causal, chainSummary, peerFindings, emit: agentEmit });
    const { finding, geminiMeta, toolResults } = agentResult;
    peerFindings.push(finding);
    allToolResults.push(...(toolResults || []));
    if (agentId === 'memory' && agentResult.hits) memoryHits = agentResult.hits;

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

  // Evidence pool: every tool result any agent produced this run, plus memory hits
  // wrapped the same way — this is the ONLY thing an evidenceId is allowed to cite.
  const evidencePool = [
    ...allToolResults.filter((t) => t.ok).map((t) => ({ id: t.id, data: t.data })),
    ...memoryHits.map((h) => ({ id: `memory:${h.id}`, data: { title: h.title, outcome: h.outcome, similarity: h.similarity } }))
  ];

  let plan = await draftPlan({ scenario, chainSummary, peerFindings, conflictsResolved, evidencePool, critique: null });
  emit(io, runId, 'plan_drafted', 'PLANNER', { actionCount: plan.actions.length, title: plan.title, geminiFallback: plan.geminiMeta.fallback }, 'info');
  await sleep(120);

  let revisionCount = 0;
  let critiqueResult = critiquePlan(plan, { peerFindings, conflictsResolved, evidencePool, causal });
  emit(io, runId, 'critique', 'CRITIC', { verdict: critiqueResult.verdict, reasons: critiqueResult.reasons }, critiqueResult.verdict === 'REVISE' ? 'warn' : 'info');
  await sleep(100);

  while (critiqueResult.verdict === 'REVISE' && revisionCount < MAX_REVISIONS) {
    revisionCount += 1;
    emit(io, runId, 'revision_started', 'PLANNER', { revisionNumber: revisionCount, reasons: critiqueResult.reasons }, 'warn');
    await sleep(100);

    plan = await draftPlan({ scenario, chainSummary, peerFindings, conflictsResolved, evidencePool, critique: critiqueResult.reasons.join('\n') });
    emit(io, runId, 'plan_drafted', 'PLANNER', { actionCount: plan.actions.length, title: plan.title, revisionNumber: revisionCount }, 'info');
    await sleep(120);

    critiqueResult = critiquePlan(plan, { peerFindings, conflictsResolved, evidencePool, causal });
    emit(io, runId, 'critique', 'CRITIC', { verdict: critiqueResult.verdict, reasons: critiqueResult.reasons, revisionNumber: revisionCount }, critiqueResult.verdict === 'REVISE' ? 'warn' : 'info');
    await sleep(100);
  }

  const escalatedToHuman = critiqueResult.verdict === 'REVISE'; // hit MAX_REVISIONS without an APPROVE

  const confidence = computeConfidence({
    actions: plan.actions,
    toolResults: allToolResults,
    // APPROVED interpretation (design review, see conversation record): a causal
    // chain that never reaches a terminal is a confident PREDICTION of low risk,
    // not an uncertain one — the engine is not unsure whether something bad is
    // happening, it has deterministically confirmed nothing crossed threshold.
    // Scoring that as pathStrength=0 would treat "we checked and it's fine" the
    // same as "we don't know", which is wrong and (without this) made it
    // impossible for a genuinely low-risk Normal scenario to ever reach
    // AUTO_EXECUTE regardless of how clean its evidence was.
    pathStrength: causal.terminals.length > 0 ? causal.pathStrength : 1,
    memorySimilarity: memoryHits[0]?.similarity ?? 0,
    conflictCount: conflicts.length
  });
  emit(io, runId, 'confidence_computed', 'ORCHESTRATOR', { confidence: confidence.score, breakdown: confidence.breakdown }, 'info');
  await sleep(100);

  let gateResult = decideGate(confidence.score, plan.actions);
  if (escalatedToHuman) {
    gateResult = { gate: 'ESCALATE', gateReason: `Critic still returned REVISE after ${MAX_REVISIONS} revision(s): ${critiqueResult.reasons.join('; ')}` };
  }
  emit(io, runId, 'gate_decision', 'ORCHESTRATOR', { gate: gateResult.gate, gateReason: gateResult.gateReason }, gateResult.gate === 'AUTO_EXECUTE' ? 'info' : 'warn');
  await sleep(80);

  const finalPlan = {
    runId,
    incidentId: scenario.incidentId || 'INC-2026-081',
    title: plan.title,
    riskScorePre: Math.round(causal.riskIndex),
    riskScorePost: Math.max(15, Math.round(causal.riskIndex * (1 - confidence.score / 200))),
    confidence: confidence.score,
    confidenceBreakdown: confidence.breakdown,
    status: 'Awaiting Human Review',
    actions: plan.actions,
    evidencePool,
    conflictsResolved: conflictsResolved.map((c) => ({ route: c.conflict.route, adoptedRoute: c.resolution.adoptedRoute, cost: c.resolution.resolution })),
    gate: gateResult.gate,
    gateReason: gateResult.gateReason,
    unresolved: plan.unresolved,
    revisionHistory: revisionCount,
    causalRiskIndex: causal.riskIndex,
    causalTerminals: causal.terminals
  };

  if (planReadyHook) {
    try {
      planReadyHook(finalPlan);
    } catch (err) {
      console.error('planReadyHook error:', err);
    }
  }

  emit(io, runId, 'run_completed', 'ORCHESTRATOR', {
    runId,
    agentsInvoked: invokedAgents,
    totalAgents: AGENT_IDS.length,
    riskIndex: causal.riskIndex,
    gate: gateResult.gate,
    conflictCount: conflicts.length,
    confidence: confidence.score
  }, 'info');

  return { runId, causal, gate: gateResult.gate, agentsInvoked: invokedAgents, peerFindings, conflictsResolved, plan: finalPlan };
}

export { AGENT_IDS };
