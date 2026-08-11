import { callGemini, MODELS } from '../../llm/gemini.js';
import { getRainfallNowcast } from '../../tools/index.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'getRainfallNowcast(wardId, horizonHours)';

function buildPrompt({ chainSummary, peerFindings, toolResults }) {
  return `You are the Weather Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers that came from a tool result. Never estimate.
- Your conclusion must be at most 2 sentences.
- If another agent's finding contradicts yours, raise it in \`flags\`.
- If your tools cannot answer, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Tool results this run: ${JSON.stringify(toolResults.map((t) => ({ id: t.id, ok: t.ok, data: t.data })))}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "weather", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

export async function runWeatherAgent({ scenario, chainSummary, peerFindings, emit }) {
  const wardId = scenario.wardId || 'ward18';
  const toolResults = [];

  emit('tool_call', { tool: 'getRainfallNowcast', args: { wardId, horizonHours: 6 } });
  const t0 = Date.now();
  const nowcast = getRainfallNowcast(wardId, 6, scenario);
  toolResults.push(nowcast);
  emit('tool_result', { tool: 'getRainfallNowcast', result: nowcast.ok ? nowcast.data : nowcast.notes, durationMs: Date.now() - t0 }, nowcast.ok ? 'info' : 'warn');
  if (!nowcast.ok) emit('tool_error', { tool: 'getRainfallNowcast', error: nowcast.notes }, 'error');

  const fallback = () => ({
    agent: 'weather',
    conclusion: nowcast.ok
      ? `${nowcast.data.imdCategory} rainfall projected: ${nowcast.data.currentIntensityMmHr}mm/hr sustained over the next ${nowcast.data.horizonHours}h.`
      : 'Rainfall nowcast unavailable this run.',
    signals: [],
    evidenceIds: toolResults.filter((t) => t.ok).map((t) => t.id),
    selfConfidence: nowcast.ok ? 0.6 : 0.3,
    flags: nowcast.ok ? [] : ['tool_failure:getRainfallNowcast']
  });

  const prompt = buildPrompt({ chainSummary, peerFindings, toolResults });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'weather', toolResults);

  return { finding, toolResults, geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage } };
}
