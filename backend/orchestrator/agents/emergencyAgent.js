import { callGemini, MODELS } from '../../llm/gemini.js';
import { getAmbulanceFleet, getHospitalAccess } from '../../tools/index.js';
import { AGENT_FINDING_SCHEMA, sanitizeFinding } from './schema.js';

const TOOL_LIST = 'getAmbulanceFleet(zone), getHospitalAccess(hospitalId)';

function buildPrompt({ chainSummary, peerFindings, toolResults }) {
  return `You are the Emergency Services (108) Agent in a multi-agent urban risk system for Chennai.
Tools available: ${TOOL_LIST}

Rules:
- You may ONLY state numbers that came from a tool result. Never estimate.
- Your conclusion must be at most 2 sentences.
- If another agent's finding contradicts yours, raise it in \`flags\`.
- If your tools cannot answer, say so and set selfConfidence below 0.5.

Causal chain: ${chainSummary}
Tool results this run: ${JSON.stringify(toolResults.map((t) => ({ id: t.id, ok: t.ok, data: t.data })))}
Findings from other agents so far: ${JSON.stringify(peerFindings)}

Return JSON: { agent: "emergency", conclusion, signals, evidenceIds, selfConfidence, flags }`;
}

export async function runEmergencyAgent({ scenario, chainSummary, peerFindings, emit }) {
  const wardId = scenario.wardId || 'ward18';
  const toolResults = [];

  emit('tool_call', { tool: 'getAmbulanceFleet', args: { zone: wardId } });
  const t0 = Date.now();
  const fleet = getAmbulanceFleet(wardId, scenario);
  toolResults.push(fleet);
  emit('tool_result', { tool: 'getAmbulanceFleet', result: fleet.ok ? fleet.data : fleet.notes, durationMs: Date.now() - t0 }, fleet.ok ? 'info' : 'warn');
  if (!fleet.ok) emit('tool_error', { tool: 'getAmbulanceFleet', error: fleet.notes }, 'error');

  emit('tool_call', { tool: 'getHospitalAccess', args: { hospitalId: 'kmc-trauma' } });
  const t1 = Date.now();
  const access = getHospitalAccess('kmc-trauma', scenario);
  toolResults.push(access);
  emit('tool_result', { tool: 'getHospitalAccess', result: access.ok ? access.data : access.notes, durationMs: Date.now() - t1 }, access.ok ? 'info' : 'warn');
  if (!access.ok) emit('tool_error', { tool: 'getHospitalAccess', error: access.notes }, 'error');

  const fallback = () => ({
    agent: 'emergency',
    conclusion: fleet.ok && access.ok
      ? `${fleet.data.delayedUnits}/${fleet.data.fleetBaseline} ambulance units delayed (~${fleet.data.avgDelayMin}min); hospital access loss at ${access.data.accessLossPct}%.`
      : 'Fleet or hospital telemetry unavailable this run.',
    signals: [],
    evidenceIds: toolResults.filter((t) => t.ok).map((t) => t.id),
    selfConfidence: fleet.ok && access.ok ? 0.65 : 0.3,
    flags: fleet.ok && access.ok ? [] : ['tool_failure']
  });

  const prompt = buildPrompt({ chainSummary, peerFindings, toolResults });
  const result = await callGemini(prompt, AGENT_FINDING_SCHEMA, { model: MODELS.FAST, fallback });
  const finding = sanitizeFinding(result.data, 'emergency', toolResults);

  return { finding, toolResults, geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage } };
}
