/**
 * Confidence is plain arithmetic over run state — Gemini never self-reports
 * this number. Each component is 0-1; the weighted sum is rendered as a
 * stacked bar on the Response Plans page so a judge can see what it's made of.
 */
const WEIGHTS = {
  evidenceCoverage: 0.30,
  dataFreshness: 0.20,
  pathStrength: 0.25,
  memorySupport: 0.10,
  agentAgreement: 0.15
};

function evidenceCoverage(actions) {
  if (actions.length === 0) return 0;
  const withEvidence = actions.filter((a) => (a.evidenceIds || []).length > 0).length;
  return withEvidence / actions.length;
}

// Exponential decay on tool fetchedAt — a reading from 10+ minutes ago counts for much less.
function dataFreshness(toolResults, nowMs = Date.now(), halfLifeMin = 10) {
  const ok = toolResults.filter((t) => t.ok && t.fetchedAt);
  if (ok.length === 0) return 0.5; // neutral if nothing to measure
  const decay = ok.map((t) => {
    const ageMin = Math.max(0, (nowMs - new Date(t.fetchedAt).getTime()) / 60000);
    return Math.pow(0.5, ageMin / halfLifeMin);
  });
  return decay.reduce((a, b) => a + b, 0) / decay.length;
}

function agentAgreement(actions, conflictCount) {
  if (actions.length === 0) return conflictCount > 0 ? 0 : 1;
  return Math.max(0, 1 - conflictCount / actions.length);
}

/**
 * computeConfidence({ actions, toolResults, pathStrength, memorySimilarity, conflictCount })
 * Returns { score (0-100), breakdown: { evidenceCoverage, dataFreshness, pathStrength, memorySupport, agentAgreement } (each 0-1) }
 */
export function computeConfidence({ actions, toolResults, pathStrength, memorySimilarity, conflictCount, now }) {
  const breakdown = {
    evidenceCoverage: evidenceCoverage(actions),
    dataFreshness: dataFreshness(toolResults, now),
    pathStrength: Math.max(0, Math.min(1, pathStrength ?? 0)),
    memorySupport: Math.max(0, Math.min(1, memorySimilarity ?? 0)),
    agentAgreement: agentAgreement(actions, conflictCount ?? 0)
  };

  const score = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + weight * breakdown[key], 0);

  return { score: Math.round(score * 100), breakdown, weights: WEIGHTS };
}

/**
 * Gates, in priority order:
 *  - any irreversible action -> HUMAN_APPROVAL, always (even at high confidence)
 *  - confidence < 0.60 -> ESCALATE
 *  - confidence >= 0.85 and every action reversible and low-cost -> AUTO_EXECUTE
 *  - otherwise -> HUMAN_APPROVAL
 */
export function decideGate(confidenceScore0to100, actions) {
  const hasIrreversible = actions.some((a) => a.reversible === false);
  const confidence = confidenceScore0to100 / 100;

  if (hasIrreversible) {
    return { gate: 'HUMAN_APPROVAL', gateReason: 'One or more actions are irreversible (closures/evacuations/utility shutoffs) — always requires human approval.' };
  }
  if (confidence < 0.60) {
    return { gate: 'ESCALATE', gateReason: `Confidence ${confidenceScore0to100}/100 is below the 60 escalation threshold.` };
  }
  const allLowCost = actions.every((a) => (a.resourceCount ?? 1) <= 3);
  if (confidence >= 0.85 && allLowCost) {
    return { gate: 'AUTO_EXECUTE', gateReason: `Confidence ${confidenceScore0to100}/100, all actions reversible and low-cost.` };
  }
  return { gate: 'HUMAN_APPROVAL', gateReason: `Confidence ${confidenceScore0to100}/100 — within range but not high enough, or not low-cost enough, for auto-execution.` };
}
