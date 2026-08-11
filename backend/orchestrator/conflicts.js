/**
 * Plain JavaScript, no LLM. If Traffic proposes diverting to a route Water
 * flagged as saturated, that's a conflict — this is an if-statement over two
 * agents' structured output, not a model call.
 */
import { simulateDiversion } from '../tools/index.js';

export function detectConflicts(peerFindings) {
  const conflicts = [];
  const water = peerFindings.find((f) => f.agent === 'water');
  const traffic = peerFindings.find((f) => f.agent === 'traffic');

  if (water && traffic && traffic.proposedRoute) {
    const satFlag = (water.flags || []).find((f) => f.startsWith('saturated_route:'));
    if (satFlag) {
      const [, route, pct] = satFlag.split(':');
      if (route === traffic.proposedRoute) {
        conflicts.push({
          type: 'route_saturation_conflict',
          agentA: 'traffic',
          agentB: 'water',
          route,
          saturationPct: Number(pct),
          alternativeRoute: traffic.alternativeRoute || null,
          detail: `Traffic proposes ${route} · Water flagged ${route} saturation ${pct}%`
        });
      }
    }
  }

  return conflicts;
}

export function resolveConflict(conflict, scenario) {
  if (!conflict.alternativeRoute) {
    return {
      rejectedRoute: conflict.route,
      adoptedRoute: null,
      transitCostMin: null,
      resolution: `rejected ${conflict.route} (saturated) — no alternative route was proposed, escalating to human review.`
    };
  }

  const diversion = simulateDiversion(conflict.route, conflict.alternativeRoute, scenario);
  const cost = diversion.ok ? diversion.data.transitCostMin : null;

  return {
    rejectedRoute: conflict.route,
    adoptedRoute: conflict.alternativeRoute,
    transitCostMin: cost,
    resolution: `rejected ${conflict.route}, adopted ${conflict.alternativeRoute} (+${cost ?? '?'} min transit cost)`
  };
}
