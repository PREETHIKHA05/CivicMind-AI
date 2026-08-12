import { callGemini, MODELS } from '../llm/gemini.js';

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          departmentId: { type: 'string' },
          department: { type: 'string' },
          recommendation: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          resourceUnits: { type: 'string' },
          resourceCount: { type: 'number' },
          expectedImpact: { type: 'string' },
          confidence: { type: 'number' },
          evidenceIds: { type: 'array', items: { type: 'string' } },
          reversible: { type: 'boolean' }
        },
        required: ['departmentId', 'department', 'recommendation', 'evidenceIds', 'reversible']
      }
    },
    unresolved: { type: 'array', items: { type: 'string' } }
  },
  required: ['title', 'actions', 'unresolved']
};

const DEPT_ICON = { water: 'Droplets', traffic: 'Car', emergency: 'Ambulance', public: 'Radio' };
const VALID_DEPTS = new Set(['water', 'traffic', 'emergency', 'public']);
const AGENT_TO_DEPT = { water: 'water', traffic: 'traffic', emergency: 'emergency', citizen: 'public' };

// weather/memory findings are informational, not their own actionable department —
// they inform the LLM-drafted plan's reasoning but don't get a templated fallback action.
const ACTIONABLE_AGENTS = new Set(['water', 'traffic', 'emergency', 'citizen']);

// Deterministic, keyword-bearing recommendation templates for the no-Gemini fallback path —
// echoing an agent's raw observation back as the "recommendation" fails the critic's
// department-remit check, since an observation isn't an action.
const FALLBACK_RECOMMENDATION = {
  water: 'Deploy mobile pumps and prioritize drain/outfall clearance in the affected sump.',
  traffic: 'Activate signal and route diversion away from the saturated corridor.',
  emergency: 'Reroute ambulance units to maintain hospital/ER access on the clearest available corridor.',
  citizen: 'Issue a public SMS/broadcast advisory for residents in the affected area.'
};

function buildPrompt({ chainSummary, peerFindings, conflictsResolved, evidencePool, critique }) {
  return `You are the Planner in a multi-agent urban risk system for Chennai. Draft a Coordinated Response Plan.

Causal chain: ${chainSummary}
Agent findings: ${JSON.stringify(peerFindings.map((f) => ({ agent: f.agent, conclusion: f.conclusion, evidenceIds: f.evidenceIds, flags: f.flags })))}
Conflicts already resolved (record them, do not re-litigate): ${JSON.stringify(conflictsResolved)}
Available evidence — you may ONLY cite ids from this list: ${JSON.stringify(evidencePool)}
${critique ? `\nA previous draft was REVISED for these reasons — address them:\n${critique}\n` : ''}

Hard rules:
- Every numeric claim needs an evidenceId from the evidence pool above. If you can't cite it, don't make the claim.
- Mark reversible:false for closures, evacuations, or utility shutoffs; true otherwise.
- Populate unresolved[] with what could not be determined this run — reject an empty array unless genuinely nothing is unknown.
- Maximum 6 actions.
- departmentId must be one of: water, traffic, emergency, public.

Return JSON: { title, actions: [...], unresolved: [...] }`;
}

function sanitizeAction(a, i, evidenceIds) {
  const cleanEvidenceIds = (a.evidenceIds || []).filter((id) => evidenceIds.has(id));
  const dept = VALID_DEPTS.has(a.departmentId) ? a.departmentId : 'water';
  return {
    id: `act-${i + 1}`,
    departmentId: dept,
    department: a.department || dept,
    deptIcon: DEPT_ICON[dept] || 'ShieldAlert',
    enabled: true,
    priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(a.priority) ? a.priority : 'HIGH',
    baseRiskImpact: Math.max(1, Math.min(30, Math.round((a.resourceCount || 1) * 8))),
    resourceUnits: a.resourceUnits || 'Response Unit',
    resourceCount: a.resourceCount || 1,
    recommendation: a.recommendation,
    reason: a.reason || '',
    confidence: `${Math.round((typeof a.confidence === 'number' ? a.confidence : 0.7) * 100)}%`,
    expectedImpact: a.expectedImpact || '',
    evidenceIds: cleanEvidenceIds,
    reversible: a.reversible !== false
  };
}

function buildFallbackPlan({ peerFindings }) {
  const actions = peerFindings
    .filter((f) => ACTIONABLE_AGENTS.has(f.agent))
    .map((f) => ({
      departmentId: AGENT_TO_DEPT[f.agent],
      department: f.agent,
      recommendation: FALLBACK_RECOMMENDATION[f.agent],
      reason: f.conclusion,
      priority: 'HIGH',
      resourceUnits: 'Response Unit',
      resourceCount: 1,
      expectedImpact: 'Not computed — Gemini unavailable, deterministic fallback plan.',
      confidence: f.selfConfidence,
      evidenceIds: f.evidenceIds || [],
      reversible: true
    }));
  return {
    title: 'Fallback Coordinated Response Plan',
    actions,
    unresolved: ['Gemini unavailable this run — plan drafted deterministically from templated actions, not critiqued for phrasing gaps.']
  };
}

/**
 * draftPlan({ scenario, chainSummary, peerFindings, conflictsResolved, evidencePool, critique })
 * evidencePool: [{ id, data }] — every tool result + memory hit produced this run.
 * critique: string | null — set on a revision pass (Phase E2 loops back here).
 */
export async function draftPlan({ scenario, chainSummary, peerFindings, conflictsResolved, evidencePool, critique }) {
  const evidenceIdSet = new Set(evidencePool.map((e) => e.id));
  const fallback = () => buildFallbackPlan({ peerFindings });

  const prompt = buildPrompt({ chainSummary, peerFindings, conflictsResolved, evidencePool, critique });
  const result = await callGemini(prompt, PLAN_SCHEMA, { model: MODELS.STRONG, fallback });
  const raw = result.data || fallback();

  let actions = (raw.actions || [])
    .slice(0, 6)
    .map((a, i) => sanitizeAction(a, i, evidenceIdSet))
    // "A claim that cannot be cited must be removed, not softened" — enforced at the action
    // level: an action with zero surviving evidence ids doesn't make it into the plan.
    .filter((a) => a.evidenceIds.length > 0);

  if (actions.length === 0 && peerFindings.length > 0) {
    // Guard against an entirely empty plan: keep the single most-confident actionable finding, uncited.
    const candidates = peerFindings.filter((f) => ACTIONABLE_AGENTS.has(f.agent));
    const best = [...(candidates.length > 0 ? candidates : peerFindings)].sort((a, b) => (b.selfConfidence || 0) - (a.selfConfidence || 0))[0];
    const dept = AGENT_TO_DEPT[best.agent] || 'water';
    actions = [sanitizeAction({
      departmentId: dept,
      department: best.agent,
      recommendation: FALLBACK_RECOMMENDATION[best.agent] || FALLBACK_RECOMMENDATION.water,
      reason: `${best.conclusion} (No citable tool evidence survived sanitization this run.)`,
      evidenceIds: [],
      reversible: true,
      confidence: 0.3
    }, 0, evidenceIdSet)];
  }

  let unresolved = Array.isArray(raw.unresolved) ? raw.unresolved.filter(Boolean) : [];
  if (unresolved.length === 0) {
    const lowConfidenceFindings = peerFindings.filter((f) => (f.selfConfidence ?? 1) < 0.5);
    if (lowConfidenceFindings.length > 0 || actions.length < peerFindings.length) {
      unresolved = [
        'Plan draft did not explicitly flag gaps; auto-added because at least one agent finding was low-confidence or an action was dropped for lacking citable evidence.'
      ];
    }
  }

  return {
    title: raw.title || `Ward 18 Coordinated Response — ${scenario.magnitude}mm/hr`,
    actions,
    unresolved,
    geminiMeta: { fromCache: result.fromCache, fallback: result.fallback, fallbackReason: result.fallbackReason, tokenUsage: result.tokenUsage }
  };
}
