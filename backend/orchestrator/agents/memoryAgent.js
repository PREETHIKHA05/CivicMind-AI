import { callGemini, MODELS } from '../../llm/gemini.js';
import { retrieveMemories } from '../../memory/retrieve.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'retrieveMemories(tags, text) — tag + keyword match against backend/memory/incidents.json, no embeddings';

function buildPrompt({ chainSummary, peerFindings, hits }) {
  return `You are the Memory Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers/outcomes that came from a retrieved incident. Never estimate.
- Your conclusion must be at most 2 sentences.
- If a retrieved incident was a FAILURE or PARTIAL_FAILURE and contradicts another agent's optimism, raise it in \`flags\` — that redirection is the point of this agent.
- If no incident matches, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Retrieved incidents this run: ${JSON.stringify(hits)}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "memory", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

function tagsFromCausal(causal) {
  const tags = ['ward18'];
  const act = causal?.activations || {};
  if ((act.pump_station_failure ?? 0) > 0 || (act.pump_maintenance_deficit ?? 0) > 0) tags.push('pump_deployment', 'pump_failure');
  if ((act.drain_saturation ?? 0) > 0) tags.push('drain_saturation');
  if ((act.hospital_access_loss ?? 0) > 0) tags.push('hospital_access');
  if ((act.traffic_gridlock ?? 0) > 0) tags.push('traffic_diversion');
  if ((act.citizen_report_volume ?? 0) > 0) tags.push('citizen_reports');
  if ((act.power_outage_risk ?? 0) > 0) tags.push('power_outage');
  return tags;
}

let idCounter = 0;
// See resetToolIdCounter() in tools/index.js — same rationale, reset per run
// so identical scenarios produce identical prompt text and cache keys.
export function resetMemoryIdCounter() {
  idCounter = 0;
}
function wrapHitsAsToolResult(hits, ok) {
  idCounter += 1;
  return {
    id: `tool:memory:retrieve:${String(idCounter).padStart(3, '0')}`,
    ok,
    data: hits,
    source: 'deterministic:memory:retrieve',
    fetchedAt: new Date().toISOString(),
    confidence: ok ? (hits[0]?.similarity ?? 0) : 0,
    notes: ok ? `${hits.length} incident(s) matched.` : 'No incidents matched this scenario.'
  };
}

export async function runMemoryAgent({ scenario, causal, chainSummary, peerFindings, emit }) {
  const tags = tagsFromCausal(causal);
  emit('tool_call', { tool: 'retrieveMemories', args: { tags, text: chainSummary } });
  const hits = retrieveMemories({ tags, text: chainSummary, topK: 3 });
  const toolResult = wrapHitsAsToolResult(hits, hits.length > 0);
  const toolResults = [toolResult];
  emit('tool_result', { tool: 'retrieveMemories', result: hits, durationMs: 0 }, hits.length > 0 ? 'info' : 'warn');
  emit('memory_retrieved', { hits: hits.length, topSimilarity: hits[0]?.similarity ?? 0, topMatch: hits[0]?.title, topOutcome: hits[0]?.outcome });

  const fallback = () => {
    const top = hits[0];
    if (!top) {
      return { agent: 'memory', conclusion: 'No comparable historical incident found for this scenario.', signals: [], evidenceIds: [], selfConfidence: 0.3, flags: [] };
    }
    const isBadOutcome = top.outcome === 'FAILURE' || top.outcome === 'PARTIAL_FAILURE';
    return {
      agent: 'memory',
      conclusion: `${top.title} (${top.outcome}, ${Math.round(top.similarity * 100)}% match): ${top.outcomeSummary}`,
      signals: [],
      evidenceIds: [toolResult.id],
      selfConfidence: top.similarity,
      flags: isBadOutcome ? [`historical_precedent_underperformed:${top.id}`] : []
    };
  };

  const prompt = buildPrompt({ chainSummary, peerFindings, hits });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'memory', toolResults);

  return { finding, toolResults, hits, geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage } };
}
