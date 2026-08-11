// Shared Gemini structured-output schema for every domain agent.
export const AGENT_FINDING_SCHEMA = {
  type: 'object',
  properties: {
    agent: { type: 'string' },
    conclusion: { type: 'string' },
    signals: { type: 'array', items: { type: 'string' } },
    evidenceIds: { type: 'array', items: { type: 'string' } },
    selfConfidence: { type: 'number' },
    flags: { type: 'array', items: { type: 'string' } }
  },
  required: ['agent', 'conclusion', 'evidenceIds', 'selfConfidence']
};

// Enforces the "evidenceIds must reference real tool result IDs from this run"
// rule in code, not in the prompt — a Gemini response can't fabricate a citation.
export function sanitizeFinding(rawFinding, agentId, toolResults) {
  const okIds = new Set(toolResults.filter((t) => t.ok).map((t) => t.id));
  const finding = { ...rawFinding, agent: agentId };
  finding.evidenceIds = (finding.evidenceIds || []).filter((id) => okIds.has(id));
  if (finding.evidenceIds.length === 0 && okIds.size > 0) {
    finding.evidenceIds = [...okIds];
  }
  if (typeof finding.selfConfidence !== 'number') finding.selfConfidence = 0.5;
  finding.flags = finding.flags || [];
  finding.signals = finding.signals || [];
  return finding;
}
