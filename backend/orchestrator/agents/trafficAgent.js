import { callGemini, MODELS } from '../../llm/gemini.js';
import { getRouteStatus, simulateDiversion } from '../../tools/index.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'getRouteStatus(routeIds), simulateDiversion(fromRoute, toRoute)';
// R7 is Traffic's default preferred corridor (fastest arterial under normal
// conditions) — proposing it regardless of this run's flood state is exactly
// the failure mode conflict detection (Phase D3) exists to catch.
const DEFAULT_ROUTE = 'R7';
const ALT_ROUTE = 'R9';

function buildPrompt({ chainSummary, peerFindings, toolResults }) {
  return `You are the Traffic Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers that came from a tool result. Never estimate.
- Your conclusion must be at most 2 sentences.
- If another agent's finding contradicts yours, raise it in \`flags\`.
- If your tools cannot answer, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Tool results this run: ${JSON.stringify(toolResults.map((t) => ({ id: t.id, ok: t.ok, data: t.data })))}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "traffic", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

export async function runTrafficAgent({ scenario, chainSummary, peerFindings, emit }) {
  const toolResults = [];

  emit('tool_call', { tool: 'getRouteStatus', args: { routeIds: [DEFAULT_ROUTE, ALT_ROUTE] } });
  const t0 = Date.now();
  const routes = getRouteStatus([DEFAULT_ROUTE, ALT_ROUTE], scenario);
  toolResults.push(routes);
  emit('tool_result', { tool: 'getRouteStatus', result: routes.ok ? routes.data : routes.notes, durationMs: Date.now() - t0 }, routes.ok ? 'info' : 'warn');
  if (!routes.ok) emit('tool_error', { tool: 'getRouteStatus', error: routes.notes }, 'error');

  emit('tool_call', { tool: 'simulateDiversion', args: { fromRoute: DEFAULT_ROUTE, toRoute: ALT_ROUTE } });
  const t1 = Date.now();
  const diversion = simulateDiversion(DEFAULT_ROUTE, ALT_ROUTE, scenario);
  toolResults.push(diversion);
  emit('tool_result', { tool: 'simulateDiversion', result: diversion.ok ? diversion.data : diversion.notes, durationMs: Date.now() - t1 }, diversion.ok ? 'info' : 'warn');

  const fallback = () => ({
    agent: 'traffic',
    conclusion: routes.ok
      ? `Corridor ${DEFAULT_ROUTE} carrying primary transit load; recommend Green-Wave signal timing to hold speed above congestion threshold.`
      : 'Route telemetry unavailable this run.',
    signals: [],
    evidenceIds: toolResults.filter((t) => t.ok).map((t) => t.id),
    selfConfidence: routes.ok ? 0.6 : 0.3,
    flags: routes.ok ? [] : ['tool_failure:getRouteStatus']
  });

  const prompt = buildPrompt({ chainSummary, peerFindings, toolResults });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'traffic', toolResults);

  // Deterministic, not left to Gemini's free text: the actual route proposal
  // conflict detection reads. Always defaults to the preferred corridor.
  finding.proposedRoute = DEFAULT_ROUTE;
  finding.alternativeRoute = ALT_ROUTE;

  return { finding, toolResults, geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage } };
}
