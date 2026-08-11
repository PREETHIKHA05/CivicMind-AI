import assert from 'node:assert/strict';
import { propagateRisk, simulateIntervention } from './engine.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  - ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL - ${name}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

// Small, isolated 3-node chain so threshold/cascade behaviour can be asserted
// precisely without interference from the full 22-node production graph.
const chainGraph = {
  nodes: [
    { id: 'A', label: 'A', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
    { id: 'B', label: 'B', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
    { id: 'C', label: 'C', dept: 'test', unit: 'pct', is_terminal: true, severity_multiplier: 1.0 }
  ],
  edges: [
    { from: 'A', to: 'B', weight: 0.8, threshold: 50, lag_min: 10, evidence: 'test fixture' },
    { from: 'B', to: 'C', weight: 0.9, threshold: 30, lag_min: 5, evidence: 'test fixture' }
  ]
};

// Cyclic graph: X <-> Y, Y -> Z (terminal). Guards against infinite loops.
const cyclicGraph = {
  nodes: [
    { id: 'X', label: 'X', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
    { id: 'Y', label: 'Y', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
    { id: 'Z', label: 'Z', dept: 'test', unit: 'pct', is_terminal: true, severity_multiplier: 1.0 }
  ],
  edges: [
    { from: 'X', to: 'Y', weight: 0.9, threshold: 0, lag_min: 5, evidence: 'test fixture' },
    { from: 'Y', to: 'X', weight: 0.9, threshold: 0, lag_min: 5, evidence: 'test fixture' },
    { from: 'Y', to: 'Z', weight: 0.9, threshold: 0, lag_min: 5, evidence: 'test fixture' }
  ]
};

test('below threshold produces no cascade', () => {
  const result = propagateRisk('A', 40, 180, chainGraph);
  assert.equal(result.firedEdges.length, 0);
  assert.equal(result.terminals.length, 0);
  assert.equal(result.activations.B, undefined);
});

test('activation exactly at threshold does not fire (must strictly exceed)', () => {
  const result = propagateRisk('A', 50, 180, chainGraph);
  assert.equal(result.firedEdges.length, 0);
  assert.equal(result.activations.B, undefined);
});

test('full cascade reaches terminal above threshold', () => {
  const result = propagateRisk('A', 100, 180, chainGraph);
  assert.equal(result.firedEdges.length, 2);
  assert.equal(result.activations.B, 80); // 100 * 0.8
  assert.equal(result.activations.C, 72); // 80 * 0.9
  assert.equal(result.terminals.length, 1);
  assert.equal(result.terminals[0].id, 'C');
  assert.equal(result.terminals[0].arrivalMin, 15); // 10 + 5
  assert.equal(result.riskIndex, 72);
});

test('horizon cutoff drops paths that arrive too late', () => {
  const result = propagateRisk('A', 100, 12, chainGraph); // B arrives at 10 (ok), C at 15 (cut)
  assert.notEqual(result.activations.B, undefined);
  assert.equal(result.activations.C, undefined);
  assert.equal(result.terminals.length, 0);
});

test('intervention damping suppresses downstream cascade', () => {
  const scenario = { seedNode: 'A', magnitude: 100, horizonMin: 180, graph: chainGraph };
  const { baseline, intervened } = simulateIntervention(scenario, 'A', 100);
  assert.equal(baseline.terminals.length, 1);
  assert.equal(intervened.terminals.length, 0);
  assert.equal(intervened.activations.B, 0);
});

test('cycle in graph does not cause infinite loop', () => {
  const result = propagateRisk('X', 100, 1000, cyclicGraph);
  assert.equal(result.terminals.length, 1);
  assert.equal(result.terminals[0].id, 'Z');
});

test('converging causes compound via noisy-OR, not "strongest path wins"', () => {
  // P1 -> C and P2 -> C: two independent upstream causes feeding the same node.
  const convergingGraph = {
    nodes: [
      { id: 'P1', label: 'P1', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
      { id: 'P2', label: 'P2', dept: 'test', unit: 'pct', is_terminal: false, severity_multiplier: 1.0 },
      { id: 'C', label: 'C', dept: 'test', unit: 'pct', is_terminal: true, severity_multiplier: 1.0 }
    ],
    edges: [
      { from: 'P1', to: 'C', weight: 0.6, threshold: 10, lag_min: 5, evidence: 'test fixture' },
      { from: 'P2', to: 'C', weight: 0.5, threshold: 10, lag_min: 5, evidence: 'test fixture' }
    ]
  };

  const p1Only = propagateRisk('P1', 100, 180, convergingGraph);
  const p2Only = propagateRisk('P2', 100, 180, convergingGraph);
  const both = propagateRisk('P1', 100, 180, convergingGraph, [{ nodeId: 'P2', magnitude: 100 }]);

  // contribution P1 = min(1, 100*0.6/100) = 0.6, contribution P2 = min(1, 100*0.5/100) = 0.5
  // noisy-OR: 1 - (1-0.6)*(1-0.5) = 1 - 0.2 = 0.8 -> 80
  assert.equal(p1Only.activations.C, 60);
  assert.equal(p2Only.activations.C, 50);
  assert.ok(Math.abs(both.activations.C - 80) < 1e-9);
  // Both causes present must score strictly higher than either alone — that's the compounding property.
  assert.ok(both.activations.C > p1Only.activations.C);
  assert.ok(both.activations.C > p2Only.activations.C);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
