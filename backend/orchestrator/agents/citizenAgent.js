import { callGemini, MODELS } from '../../llm/gemini.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'causal engine snapshot (citizen_report_volume, public_panic_index) — no dedicated citizen telemetry tool exists yet';

function buildPrompt({ chainSummary, peerFindings, toolResults }) {
  return `You are the Citizen Voice Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers that came from a tool result. Never estimate.
- Your conclusion must be at most 2 sentences.
- If another agent's finding contradicts yours, raise it in \`flags\`.
- If your tools cannot answer, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Tool results this run: ${JSON.stringify(toolResults.map((t) => ({ id: t.id, ok: t.ok, data: t.data })))}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "citizen", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

let idCounter = 0;

/**
 * There's no dedicated citizen-reports tool in backend/tools/index.js — this
 * agent reads the causal engine's own citizen_report_volume/public_panic_index
 * nodes directly, wrapped in the same {ok,data,source,fetchedAt,confidence,notes}
 * envelope every other tool uses, so evidenceId sanitization still applies.
 */
function causalSnapshotTool(causal) {
  idCounter += 1;
  const reportVolume = causal?.activations?.citizen_report_volume;
  const panicIndex = causal?.activations?.public_panic_index;
  const ok = reportVolume !== undefined;
  return {
    id: `tool:citizen:causal_snapshot:${String(idCounter).padStart(3, '0')}`,
    ok,
    data: ok ? { reportVolumeActivation: Math.round(reportVolume), panicIndexActivation: panicIndex !== undefined ? Math.round(panicIndex) : null } : null,
    source: 'deterministic:citizen:causal_snapshot',
    fetchedAt: new Date().toISOString(),
    confidence: ok ? 0.75 : 0,
    notes: ok ? 'Read directly from causal engine activations for this run.' : 'citizen_report_volume node not activated at this rainfall level.'
  };
}

export async function runCitizenAgent({ scenario, causal, chainSummary, peerFindings, emit }) {
  emit('tool_call', { tool: 'causal_snapshot', args: { nodes: ['citizen_report_volume', 'public_panic_index'] } });
  const snapshot = causalSnapshotTool(causal);
  const toolResults = [snapshot];
  emit('tool_result', { tool: 'causal_snapshot', result: snapshot.ok ? snapshot.data : snapshot.notes, durationMs: 0 }, snapshot.ok ? 'info' : 'warn');

  const fallback = () => ({
    agent: 'citizen',
    conclusion: snapshot.ok
      ? `Report volume activation at ${snapshot.data.reportVolumeActivation}; panic index at ${snapshot.data.panicIndexActivation ?? 'n/a'}.`
      : 'No citizen report signal activated at this rainfall level.',
    signals: [],
    evidenceIds: toolResults.filter((t) => t.ok).map((t) => t.id),
    selfConfidence: snapshot.ok ? 0.55 : 0.35,
    flags: snapshot.ok ? [] : []
  });

  const prompt = buildPrompt({ chainSummary, peerFindings, toolResults });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'citizen', toolResults);

  return { finding, toolResults, geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage } };
}
