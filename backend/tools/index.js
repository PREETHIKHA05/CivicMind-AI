/**
 * Deterministic tool layer. Every tool is plain arithmetic/lookup — no LLM
 * calls happen here. Outputs are derived from the same causal engine
 * activations the scenario produces, so a Water Agent's tool reading and the
 * causal graph's drain_saturation node can never silently disagree.
 *
 * Every tool returns the same envelope: { ok, data, source, fetchedAt, confidence, notes }
 */
import { propagateRisk } from '../causal/engine.js';

let idCounter = 0;
function nextId(dept, name) {
  idCounter += 1;
  return `tool:${dept}:${name}:${String(idCounter).padStart(3, '0')}`;
}

function envelope({ dept, name, ok, data, confidence, notes, forced }) {
  return {
    id: nextId(dept, name),
    ok,
    data,
    source: forced ? 'FORCED_FAILURE' : `deterministic:${dept}:${name}`,
    fetchedAt: new Date().toISOString(),
    confidence: ok ? confidence : 0,
    notes
  };
}

function isForced(toolName, scenario) {
  return Array.isArray(scenario?.forceFailTools) && scenario.forceFailTools.includes(toolName);
}

function causalFor(scenario) {
  const seedNode = scenario?.seedNode || 'rainfall_intensity';
  const magnitude = scenario?.magnitude ?? 118;
  const horizonMin = scenario?.horizonMin ?? 180;
  const extraSeeds = scenario?.extraSeeds || [];
  return propagateRisk(seedNode, magnitude, horizonMin, undefined, extraSeeds);
}

function imdCategory(mmPerDay) {
  if (mmPerDay >= 204.5) return 'extremely heavy';
  if (mmPerDay >= 115.6) return 'very heavy';
  if (mmPerDay >= 64.5) return 'heavy';
  if (mmPerDay >= 15.6) return 'moderate';
  return 'light';
}

export function getRainfallNowcast(wardId, horizonHours, scenario = {}) {
  const name = 'rainfall_nowcast';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'weather', name, ok: false, data: null, notes: 'Forced failure: nowcast feed unreachable.', forced: true });
  }
  const magnitude = scenario.magnitude ?? 118;
  const projectedMmPerDay = magnitude * Math.min(24, horizonHours);
  return envelope({
    dept: 'weather',
    name,
    ok: true,
    data: {
      wardId,
      horizonHours,
      currentIntensityMmHr: magnitude,
      projectedAccumulationMm: Number(projectedMmPerDay.toFixed(1)),
      imdCategory: imdCategory(projectedMmPerDay)
    },
    confidence: 0.9,
    notes: 'Deterministic projection: current intensity held constant over horizon, IMD 24h categories applied to the projected total.'
  });
}

export function getDrainCapacity(wardId, scenario = {}) {
  const name = 'drain_capacity';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'water', name, ok: false, data: null, notes: 'Forced failure: SCADA drain telemetry timed out.', forced: true });
  }
  const causal = causalFor(scenario);
  const utilisation = Math.round(causal.activations.drain_saturation ?? 0);
  const debris = causal.activations.drainage_debris_blockage ?? 0;
  const blockages = debris > 66 ? 4 : debris > 33 ? 2 : debris > 0 ? 1 : 0;
  const submerged = (causal.activations.outfall_submersion ?? 0) > 50;
  return envelope({
    dept: 'water',
    name,
    ok: true,
    data: {
      wardId,
      designCapacityMmHr: 45,
      utilisationPct: utilisation,
      blockages,
      outfallStatus: submerged ? 'submerged' : 'clear'
    },
    confidence: 0.92,
    notes: 'GCC storm drain design capacity 45 mm/hr (Ward 18); utilisation/blockages/outfall derived from causal engine activations for this scenario.'
  });
}

export function computeOverflowEta(inflowMmHr, capacityMmHr, currentPct) {
  // Pure arithmetic: minutes until remaining headroom is consumed at the current inflow rate.
  const headroomPct = Math.max(0, 100 - currentPct);
  const ratio = Math.max(0.1, inflowMmHr / Math.max(1, capacityMmHr));
  const etaMinutes = Math.round((headroomPct / 100) * 60 / ratio);
  return envelope({
    dept: 'water',
    name: 'overflow_eta',
    ok: true,
    data: { inflowMmHr, capacityMmHr, currentPct, etaMinutes: Math.max(0, etaMinutes) },
    confidence: 1.0,
    notes: 'Pure arithmetic: (headroom% / 100) * 60min / (inflow/capacity ratio). No external data, no LLM.'
  });
}

export function getRouteStatus(routeIds, scenario = {}) {
  const name = 'route_status';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'traffic', name, ok: false, data: null, notes: 'Forced failure: traffic sensor network offline.', forced: true });
  }
  const causal = causalFor(scenario);
  const gridlock = causal.activations.traffic_gridlock ?? 0;
  const routes = routeIds.map((routeId, i) => {
    // Deterministic per-route variance so routes aren't all identical, still driven by the same scenario.
    const variance = ((i * 13) % 20) - 10; // -10..+9
    const saturation = Math.max(0, Math.min(100, gridlock + variance));
    const speedKmh = Math.max(4, Math.round(40 - saturation * 0.34));
    return { routeId, saturationPct: Math.round(saturation), speedKmh };
  });
  return envelope({
    dept: 'traffic',
    name,
    ok: true,
    data: { routes },
    confidence: 0.85,
    notes: 'Derived from causal engine traffic_gridlock activation; per-route saturation varies deterministically around that value.'
  });
}

export function simulateDiversion(fromRoute, toRoute, scenario = {}) {
  const name = 'simulate_diversion';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'traffic', name, ok: false, data: null, notes: 'Forced failure: routing simulator unavailable.', forced: true });
  }
  const statusRes = getRouteStatus([fromRoute, toRoute], scenario);
  if (!statusRes.ok) {
    return envelope({ dept: 'traffic', name, ok: false, data: null, notes: 'Underlying getRouteStatus() call failed — cannot compute a diversion cost.' });
  }
  const [from, to] = statusRes.data.routes;
  const transitCostMin = Math.max(1, Math.round((to.saturationPct - from.saturationPct) / 10));
  return envelope({
    dept: 'traffic',
    name,
    ok: true,
    data: {
      fromRoute,
      toRoute,
      fromSaturationPct: from.saturationPct,
      toSaturationPct: to.saturationPct,
      transitCostMin
    },
    confidence: 0.8,
    notes: 'Pure arithmetic on top of getRouteStatus() readings for both routes.'
  });
}

export function getHospitalAccess(hospitalId, scenario = {}) {
  const name = 'hospital_access';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'health', name, ok: false, data: null, notes: 'Forced failure: hospital ops feed unreachable.', forced: true });
  }
  const causal = causalFor(scenario);
  const accessLoss = Math.round(causal.activations.hospital_access_loss ?? 0);
  const erStrain = Math.round(causal.activations.hospital_er_capacity_strain ?? 0);
  return envelope({
    dept: 'health',
    name,
    ok: true,
    data: {
      hospitalId,
      accessLossPct: accessLoss,
      erCapacityStrainPct: erStrain,
      status: accessLoss > 40 ? 'access at risk' : 'nominal'
    },
    confidence: 0.88,
    notes: 'Derived from causal engine hospital_access_loss / hospital_er_capacity_strain terminal activations.'
  });
}

export function getAmbulanceFleet(zone, scenario = {}) {
  const name = 'ambulance_fleet';
  if (isForced(name, scenario)) {
    return envelope({ dept: 'emergency', name, ok: false, data: null, notes: 'Forced failure: 108 fleet telemetry offline.', forced: true });
  }
  const causal = causalFor(scenario);
  const delayMin = Math.round(causal.activations.ambulance_delay ?? 0);
  const fleetBaseline = 12;
  const delayedUnits = Math.min(fleetBaseline, Math.round((delayMin / 100) * fleetBaseline));
  return envelope({
    dept: 'emergency',
    name,
    ok: true,
    data: { zone, fleetBaseline, delayedUnits, avgDelayMin: delayMin },
    confidence: 0.87,
    notes: 'Derived from causal engine ambulance_delay activation for this scenario.'
  });
}

export const TOOLS = {
  getRainfallNowcast,
  getDrainCapacity,
  computeOverflowEta,
  getRouteStatus,
  simulateDiversion,
  getHospitalAccess,
  getAmbulanceFleet
};
