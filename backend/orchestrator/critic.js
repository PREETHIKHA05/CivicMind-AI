/**
 * Adversarial critic. All five checks are plain code against the plan's own
 * structured state — no LLM call needed to catch any of these, which is
 * exactly why they're trustworthy. Checks run in order; any failure means REVISE.
 */
const DEPT_KEYWORDS = {
  water: ['pump', 'drain', 'sump', 'outfall', 'canal', 'sluice', 'water', 'flood'],
  traffic: ['signal', 'route', 'traffic', 'diversion', 'corridor', 'lane', 'green-wave', 'road'],
  emergency: ['ambulance', 'hospital', 'er ', 'trauma', '108', 'medical', 'evacuat'],
  public: ['sms', 'advisory', 'broadcast', 'alert', 'notify', 'citizen', 'public']
};

function parseConfidencePct(confidenceStr) {
  const n = parseInt(String(confidenceStr).replace('%', ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

// Check 1: every evidenceId on every action must resolve in this run's evidence pool.
function checkEvidenceTraceability(plan, evidenceIdSet) {
  const violations = [];
  for (const action of plan.actions) {
    const bad = (action.evidenceIds || []).filter((id) => !evidenceIdSet.has(id));
    if (bad.length > 0) violations.push(`Action "${action.recommendation}" cites unknown evidence id(s): ${bad.join(', ')}`);
    if ((action.evidenceIds || []).length === 0) violations.push(`Action "${action.recommendation}" has no evidence id at all.`);
  }
  return violations;
}

// Check 2: does an action contradict a peer finding's unresolved flag (e.g. a saturated-route
// flag that never made it into conflictsResolved)?
function checkContradictions(plan, peerFindings, conflictsResolved) {
  const violations = [];
  const resolvedRoutes = new Set(conflictsResolved.map((c) => c.conflict?.route));
  for (const finding of peerFindings) {
    for (const flag of finding.flags || []) {
      if (flag.startsWith('saturated_route:')) {
        const [, route] = flag.split(':');
        if (!resolvedRoutes.has(route)) {
          const stillProposesIt = plan.actions.some((a) => (a.recommendation || '').includes(route));
          if (stillProposesIt) violations.push(`An action still references route ${route}, which Water flagged as saturated and no conflict resolution addressed.`);
        }
      }
    }
  }
  return violations;
}

// Check 3: irreversible actions need confidence >= 85%.
function checkIrreversibleConfidence(plan) {
  const violations = [];
  for (const action of plan.actions) {
    if (action.reversible === false && parseConfidencePct(action.confidence) < 85) {
      violations.push(`Irreversible action "${action.recommendation}" has confidence ${action.confidence}, below the 85% bar irreversible actions require.`);
    }
  }
  return violations;
}

// Check 4: department assigned work outside its keyword remit.
function checkDepartmentRemit(plan) {
  const violations = [];
  for (const action of plan.actions) {
    const keywords = DEPT_KEYWORDS[action.departmentId];
    if (!keywords) continue;
    const text = `${action.recommendation} ${action.reason}`.toLowerCase();
    const inRemit = keywords.some((kw) => text.includes(kw));
    if (!inRemit) {
      violations.push(`Action assigned to ${action.department} doesn't mention any ${action.departmentId}-remit keyword: "${action.recommendation}"`);
    }
  }
  return violations;
}

// Check 5: any terminal above 60 activation with no action addressing its department.
function checkTerminalCoverage(plan, causal, deptToAgentDept) {
  const violations = [];
  const highTerminals = causal.terminals.filter((t) => t.activation > 60);
  for (const terminal of highTerminals) {
    const dept = deptToAgentDept(terminal.id);
    const covered = dept && plan.actions.some((a) => a.departmentId === dept);
    if (!covered) {
      violations.push(`Terminal "${terminal.id}" is at ${terminal.activation.toFixed(0)}/100 activation but no action addresses it.`);
    }
  }
  return violations;
}

const TERMINAL_DEPT = {
  hospital_access_loss: 'emergency',
  hospital_er_capacity_strain: 'emergency',
  citizen_evacuation_trigger: 'public',
  power_outage_risk: 'traffic',
  water_supply_contamination: 'water'
};

/**
 * critiquePlan(plan, { peerFindings, conflictsResolved, evidencePool, causal })
 * Returns { verdict: 'APPROVE' | 'REVISE', reasons: string[] }
 */
export function critiquePlan(plan, { peerFindings, conflictsResolved, evidencePool, causal }) {
  const evidenceIdSet = new Set(evidencePool.map((e) => e.id));

  const checks = [
    checkEvidenceTraceability(plan, evidenceIdSet),
    checkContradictions(plan, peerFindings, conflictsResolved),
    checkIrreversibleConfidence(plan),
    checkDepartmentRemit(plan),
    checkTerminalCoverage(plan, causal, (terminalId) => TERMINAL_DEPT[terminalId])
  ];

  const reasons = checks.flat();
  return { verdict: reasons.length === 0 ? 'APPROVE' : 'REVISE', reasons };
}
