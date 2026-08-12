/**
 * Runs each scenario preset directly against the orchestrator (no HTTP
 * server needed) and asserts it lands on its expected gate/conflict/agent
 * count. Catches the case where someone tweaks a causal edge weight and
 * silently kills the conflict beat or collapses the three-way gate split.
 *
 * Usage: node backend/scenarios/verify.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'node:assert/strict';
import { runAgents } from '../orchestrator/run.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRESET_FILES = ['normal.json', 'heavy_rain.json', 'extreme_pump_failure.json'];

// runAgents emits over an `io`-shaped object; assertions don't need the
// events broadcast anywhere, so this just swallows them.
const nullIo = { emit: () => {} };

let passed = 0;
let failed = 0;

async function verifyPreset(fileName) {
  const filePath = path.join(__dirname, fileName);
  const preset = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const runId = `verify-${fileName}-${Date.now()}`;

  console.log(`\n--- ${preset.name} (${fileName}) ---`);

  try {
    const result = await runAgents(preset.scenario, nullIo, runId);

    assert.equal(result.gate, preset.expected.gate, `gate: expected ${preset.expected.gate}, got ${result.gate}`);
    console.log(`  ok  - gate is ${result.gate}`);

    const conflictFired = (result.conflictsResolved || []).length > 0;
    assert.equal(conflictFired, preset.expected.conflictExpected, `conflictExpected: expected ${preset.expected.conflictExpected}, got ${conflictFired}`);
    console.log(`  ok  - conflict fired: ${conflictFired}`);

    const agentCount = (result.agentsInvoked || []).length;
    assert.ok(
      agentCount >= preset.expected.minAgentsInvoked && agentCount <= preset.expected.maxAgentsInvoked,
      `agentsInvoked count ${agentCount} outside expected range [${preset.expected.minAgentsInvoked}, ${preset.expected.maxAgentsInvoked}]`
    );
    console.log(`  ok  - agents invoked: ${agentCount} (${result.agentsInvoked.join(', ')})`);

    passed += 3;
  } catch (err) {
    console.error(`FAIL - ${err.message}`);
    failed += 1;
  }
}

for (const fileName of PRESET_FILES) {
  await verifyPreset(fileName);
}

console.log(`\n${passed} checks passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
