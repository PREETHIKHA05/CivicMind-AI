import { callGemini, MODELS } from '../../llm/gemini.js';
import { getDrainCapacity, computeOverflowEta } from '../../tools/index.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'getDrainCapacity(wardId), computeOverflowEta(inflow, capacity, currentPct)';

function buildPrompt({ chainSummary, peerFindings, toolResults }) {
  return `You are the Water & Drainage Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers that came from a tool result. Never estimate.
- Your conclusion must be at most 2 sentences.
- If another agent's finding contradicts yours, raise it in \`flags\`.
- If your tools cannot answer, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Tool results this run: ${JSON.stringify(toolResults.map((t) => ({ id: t.id, ok: t.ok, data: t.data })))}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "water", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

/**
 * runWaterAgent({ scenario, chainSummary, peerFindings, emit })
 * emit(type, payload, level) streams tool_call/tool_result/tool_error events
 * into the same trace the orchestrator is already emitting to.
 */
export async function runWaterAgent({ scenario, chainSummary, peerFindings, emit }) {
  const wardId = scenario.wardId || 'ward18';
  const toolResults = [];

  emit('tool_call', { tool: 'getDrainCapacity', args: { wardId } });
  const t0 = Date.now();
  const drain = getDrainCapacity(wardId, scenario);
  toolResults.push(drain);
  emit('tool_result', { tool: 'getDrainCapacity', result: drain.ok ? drain.data : drain.notes, durationMs: Date.now() - t0 }, drain.ok ? 'info' : 'warn');
  if (!drain.ok) emit('tool_error', { tool: 'getDrainCapacity', error: drain.notes }, 'error');

  let eta = null;
  if (drain.ok) {
    emit('tool_call', { tool: 'computeOverflowEta', args: { inflow: scenario.magnitude, capacity: drain.data.designCapacityMmHr, currentPct: drain.data.utilisationPct } });
    const t1 = Date.now();
    eta = computeOverflowEta(scenario.magnitude, drain.data.designCapacityMmHr, drain.data.utilisationPct);
    toolResults.push(eta);
    emit('tool_result', { tool: 'computeOverflowEta', result: eta.data, durationMs: Date.now() - t1 });
  }

  const fallback = () => ({
    agent: 'water',
    conclusion: drain.ok
      ? `Drain utilisation at ${drain.data.utilisationPct}% against ${drain.data.designCapacityMmHr}mm/hr design capacity; overflow expected in ~${eta?.data?.etaMinutes ?? '?'} min.`
      : 'Drain telemetry unavailable this run; cannot state a numeric conclusion.',
    signals: [],
    evidenceIds: toolResults.filter((t) => t.ok).map((t) => t.id),
    selfConfidence: drain.ok ? 0.55 : 0.3,
    flags: drain.ok ? [] : ['tool_failure:getDrainCapacity']
  });

  const prompt = buildPrompt({ chainSummary, peerFindings, toolResults });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'water', toolResults);

  return {
    finding,
    toolResults,
    geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage }
  };
}
