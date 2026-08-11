import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRAPH_PATH = path.join(__dirname, 'causal_graph.json');

export function loadGraph() {
  return JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf-8'));
}

const defaultGraph = loadGraph();

function buildAdjacency(edges) {
  const adj = new Map();
  for (const edge of edges) {
    if (!adj.has(edge.from)) adj.set(edge.from, []);
    adj.get(edge.from).push(edge);
  }
  return adj;
}

function buildInbound(edges) {
  const inbound = new Map();
  for (const edge of edges) {
    if (!inbound.has(edge.to)) inbound.set(edge.to, []);
    inbound.get(edge.to).push(edge);
  }
  return inbound;
}

/**
 * Propagates one or more seed activations through the causal graph in
 * topological order (Kahn's algorithm, with seeds pre-resolved regardless of
 * their own in-degree). Processing each node only after all of its
 * predecessors are resolved means every node is computed exactly once and
 * every edge fires at most once — that's what gives us the cycle guard: a
 * node that sits inside a cycle with no seed can never reach in-degree 0, so
 * it's simply never processed (no crash, no infinite loop, deterministic).
 *
 * An edge only fires when the upstream activation strictly exceeds
 * edge.threshold — this non-linear onset is deliberate: crossing a threshold
 * changes the cascade discontinuously rather than smoothly scaling it.
 *
 * When a node has multiple firing inbound edges (converging causes — e.g.
 * both rainfall-driven drain saturation AND a maintenance-deficit pump
 * failure feeding road_waterlogging), their contributions combine via
 * noisy-OR: activation = 1 - Π(1 - contribution_i). This is the standard
 * Bayesian-network way to combine independent causes: it saturates toward
 * 100 but never lets a second cause leave the result unchanged, which a
 * "take the strongest single path" rule would. For a single firing edge,
 * noisy-OR of one term reduces to exactly the old multiplicative value.
 */
export function propagateRisk(seedNode, magnitude, horizonMin = 180, graph = defaultGraph, extraSeeds = []) {
  const nodesById = new Map(graph.nodes.map(n => [n.id, n]));
  const seeds = [{ nodeId: seedNode, magnitude }, ...extraSeeds];
  for (const s of seeds) {
    if (!nodesById.has(s.nodeId)) {
      throw new Error(`Unknown seed node: ${s.nodeId}`);
    }
  }

  const adj = buildAdjacency(graph.edges);
  const inbound = buildInbound(graph.edges);

  const resolved = new Map();
  const inDegree = new Map(graph.nodes.map(n => [n.id, (inbound.get(n.id) || []).length]));
  const firedEdges = [];
  const queue = [];

  // Seeds are resolved immediately, regardless of their own in-degree —
  // they represent externally-supplied starting conditions, not derived values.
  for (const s of seeds) {
    resolved.set(s.nodeId, { activation: Math.max(0, s.magnitude), arrival: 0, pathStrength: 1 });
  }
  for (const s of seeds) {
    for (const edge of (adj.get(s.nodeId) || [])) {
      inDegree.set(edge.to, inDegree.get(edge.to) - 1);
    }
  }
  for (const [nodeId, deg] of inDegree) {
    if (deg === 0 && !resolved.has(nodeId)) queue.push(nodeId);
  }

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (resolved.has(nodeId)) continue;

    const incoming = inbound.get(nodeId) || [];
    const contributions = [];
    let bestArrival = Infinity;
    let bestPathStrength = 0;

    for (const edge of incoming) {
      const upstream = resolved.get(edge.from);
      if (!upstream) continue; // predecessor never activated
      if (upstream.activation <= edge.threshold) continue; // below/at threshold: no cascade

      const arrival = upstream.arrival + edge.lag_min;
      if (arrival > horizonMin) continue; // horizon cutoff

      const contribution = Math.min(1, (upstream.activation * edge.weight) / 100);
      contributions.push(contribution);
      firedEdges.push({ from: edge.from, to: edge.to, weight: edge.weight, arrivalMin: arrival });

      if (arrival < bestArrival) bestArrival = arrival;
      const pathStrength = upstream.pathStrength * edge.weight;
      if (pathStrength > bestPathStrength) bestPathStrength = pathStrength;
    }

    if (contributions.length > 0) {
      const combined = 1 - contributions.reduce((acc, c) => acc * (1 - c), 1);
      resolved.set(nodeId, {
        activation: Math.min(100, combined * 100),
        arrival: bestArrival,
        pathStrength: bestPathStrength
      });
    }
    // else: no inbound edge fired — node stays unresolved (not activated) at this magnitude

    for (const edge of (adj.get(nodeId) || [])) {
      inDegree.set(edge.to, inDegree.get(edge.to) - 1);
      if (inDegree.get(edge.to) === 0 && !resolved.has(edge.to) && !queue.includes(edge.to)) {
        queue.push(edge.to);
      }
    }
  }

  const activations = {};
  const arrivalTimes = {};
  const pathStrengths = {};
  for (const [nodeId, val] of resolved) {
    activations[nodeId] = val.activation;
    arrivalTimes[nodeId] = val.arrival;
    pathStrengths[nodeId] = val.pathStrength;
  }

  const terminals = graph.nodes
    .filter(n => n.is_terminal && activations[n.id] !== undefined)
    .map(n => ({ id: n.id, label: n.label, activation: activations[n.id], arrivalMin: arrivalTimes[n.id] }))
    .sort((a, b) => b.activation - a.activation);

  let pathStrength = 0;
  let riskIndex = 0;
  if (terminals.length > 0) {
    pathStrength = pathStrengths[terminals[0].id] || 0;
    const weighted = terminals.map(t => t.activation * (nodesById.get(t.id)?.severity_multiplier || 1));
    riskIndex = Math.min(100, Math.max(...weighted));
  }

  return { activations, arrivalTimes, firedEdges, terminals, pathStrength, riskIndex };
}

/**
 * Re-runs propagation with every outgoing edge of `nodeId` damped by dampingPct
 * (0-100), simulating an intervention at that node (e.g. deploying mobile pumps
 * to reduce how much drain_saturation cascades into road_waterlogging).
 */
export function simulateIntervention(scenario, nodeId, dampingPct) {
  const { seedNode, magnitude, horizonMin = 180, graph = defaultGraph, extraSeeds = [] } = scenario;

  const baseline = propagateRisk(seedNode, magnitude, horizonMin, graph, extraSeeds);

  const dampedGraph = {
    nodes: graph.nodes,
    edges: graph.edges.map(edge =>
      edge.from === nodeId
        ? { ...edge, weight: edge.weight * (1 - dampingPct / 100) }
        : edge
    )
  };

  const intervened = propagateRisk(seedNode, magnitude, horizonMin, dampedGraph, extraSeeds);

  return { baseline, intervened, nodeId, dampingPct };
}
