import { callGemini, MODELS } from '../llm/gemini.js';
import { loadGraph } from '../causal/engine.js';

const SUPERVISOR_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['INVOKE_AGENTS', 'PLAN', 'NEED_MORE_DATA', 'ABORT'] },
    agents: { type: 'array', items: { type: 'string' } },
    reason: { type: 'string' }
  },
  required: ['action', 'agents', 'reason']
};

const KNOWN_AGENTS = ['weather', 'water', 'traffic', 'emergency', 'citizen', 'memory'];
const AGENT_PRIORITY = ['water', 'traffic', 'memory', 'weather', 'emergency', 'citizen'];
const DEPT_TO_AGENT = {
  weather: 'weather',
  water: 'water',
  infrastructure: 'water',
  traffic: 'traffic',
  power: 'traffic',
  emergency: 'emergency',
  health: 'emergency',
  citizen: 'citizen',
  public: 'citizen'
};

function depsFromActivatedNodes(causal, graph) {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const depts = new Set();
  for (const nodeId of Object.keys(causal.activations)) {
    const node = nodeById.get(nodeId);
    if (node) depts.add(node.dept);
  }
  return depts;
}

function healthOrEmergencyAboveThreshold(causal, graph, threshold = 60) {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  for (const [nodeId, activation] of Object.entries(causal.activations)) {
    const node = nodeById.get(nodeId);
    if (node && (node.dept === 'health' || node.dept === 'emergency') && activation > threshold) {
      return { nodeId, activation };
    }
  }
  return null;
}

function buildPrompt(causal, scenario) {
  const terminalSummary = causal.terminals.map((t) => `${t.id}=${t.activation.toFixed(0)}`).join(', ') || 'none';
  return `You are the Supervisor of a multi-agent urban risk system for Chennai. Decide which domain agents to invoke this run.
Available agents: ${KNOWN_AGENTS.join(', ')}.

Causal engine output for this run:
- rainfall: ${scenario.magnitude}mm/hr
- riskIndex: ${causal.riskIndex.toFixed(0)}/100
- terminal nodes reached: ${terminalSummary}
- fired edges: ${causal.firedEdges.length}

Rules:
- Only invoke agents whose domain is actually implicated by the fired causal chain.
- reason must be <= 200 characters and must state WHY, referencing the actual numbers above.
- For a fresh run with a computed causal chain, action should normally be INVOKE_AGENTS.

Return JSON: { action, agents, reason }`;
}

/**
 * decideRouting(causal, scenario, hopCount)
 * Gemini proposes; the rules below are enforced in code, not the prompt, so
 * they hold even if the model ignores an instruction:
 *  - hopCount > 12 -> ABORT
 *  - any health/emergency-dept node above 60 activation -> 'emergency' forced in
 *  - fewer than 3 agents -> padded deterministically (blocks PLAN otherwise)
 */
export async function decideRouting(causal, scenario, hopCount = 1) {
  if (hopCount > 12) {
    return { action: 'ABORT', agents: [], reason: 'hopCount exceeded 12 — aborting to avoid a runaway loop.', enforced: ['hopCount_exceeded'], geminiFallback: false };
  }

  const graph = loadGraph();
  const activatedDepts = depsFromActivatedNodes(causal, graph);
  const deptBasedAgents = [...activatedDepts].map((d) => DEPT_TO_AGENT[d]).filter(Boolean);

  const fallback = () => ({
    action: 'INVOKE_AGENTS',
    // 'memory' has no corresponding causal dept, so dept-based routing alone would
    // never select it — always include it: historical precedent is what keeps
    // this from being a hollow parallel-agents demo (see memoryAgent.js).
    agents: [...new Set([...(deptBasedAgents.length > 0 ? deptBasedAgents : ['water']), 'memory'])],
    reason: `Fallback routing from activated depts: rainfall ${scenario.magnitude}mm/hr, riskIndex ${causal.riskIndex.toFixed(0)}.`
  });

  const prompt = buildPrompt(causal, scenario);
  const result = await callGemini(prompt, SUPERVISOR_SCHEMA, { model: MODELS.FAST, fallback });
  const decision = result.data || fallback();

  const enforced = [];
  let agents = Array.isArray(decision.agents)
    ? [...new Set(decision.agents.filter((a) => KNOWN_AGENTS.includes(a)))]
    : [];

  const healthHit = healthOrEmergencyAboveThreshold(causal, graph, 60);
  if (healthHit && !agents.includes('emergency')) {
    agents.push('emergency');
    enforced.push(`emergency_forced:${healthHit.nodeId}=${healthHit.activation.toFixed(0)}`);
  }

  if (agents.length < 3) {
    for (const candidate of AGENT_PRIORITY) {
      if (agents.length >= 3) break;
      if (!agents.includes(candidate)) {
        agents.push(candidate);
        enforced.push(`padded_min3:${candidate}`);
      }
    }
  }

  const action = decision.action === 'ABORT' ? 'ABORT' : 'INVOKE_AGENTS';
  const reason = String(decision.reason || 'No reason provided.').slice(0, 200);

  return {
    action,
    agents,
    reason,
    enforced,
    geminiFallback: result.fallback,
    geminiFallbackReason: result.fallbackReason
  };
}
