$replacements = @{
  # CityMemory.jsx
  'VECTORIZED HISTORICAL INCIDENT REPOSITORY' = 'Vectorized Historical Incident Repository'
  'URBAN MEMORY' = 'Urban Memory'
  'CONDITIONS & CAUSE' = 'Conditions & Cause'
  'IMPACT & OUTCOME' = 'Impact & Outcome'
  'ACTIONS TAKEN' = 'Actions Taken'
  'LESSON LEARNED & POLICY MEMORY' = 'Lesson Learned & Policy Memory'

  # ResponsePlans.jsx
  'HUMAN-IN-THE-LOOP DECISION MATRIX' = 'Human-in-the-Loop Decision Matrix'
  'COORDINATED RESPONSE PLAN (CRP)' = 'Coordinated Response Plan (CRP)'
  'CRITICAL TARGET RISK' = 'Critical Target Risk'
  'DYNAMIC PROJECTED RISK' = 'Dynamic Projected Risk'
  'PRE-INTERVENTION' = 'Pre-Intervention'
  'CONFIDENCE' = 'Confidence'
  'APPROVED BY ICCC OPERATOR' = 'APPROVED BY ICCC OPERATOR'  # Keep this as-is since it's a status constant
  'REVERT TO UNAPPROVED DRAFT' = 'Revert to Unapproved Draft'
  'REQUEST CHANGES' = 'Request Changes'
  'DISMISS' = 'Dismiss'
  'APPROVE & DISPATCH WORK ORDERS' = 'Approve & Dispatch Work Orders'
  'LIVE FIELD EXECUTION PROGRESS' = 'Live Field Execution Progress'
  'SYNTHESIZED DEPARTMENTAL ACTIONS' = 'Synthesized Departmental Actions'
  'SAVE' = 'Save'
  'CANCEL' = 'Cancel'
  'EDIT ACTION' = 'Edit Action'
  'CONFIRM & DISPATCH WORK ORDERS' = 'Confirm & Dispatch Work Orders'
  'SUBMIT REQUEST' = 'Submit Request'

  # DepartmentDashboard.jsx
  'DEPARTMENT OVERVIEW' = 'Department Overview'
  'ASSIGNED WORK ORDERS' = 'Assigned Work Orders'
  'TELEMETRY & DATA ANALYTICS' = 'Telemetry & Data Analytics'
  'EMERGENCY PROTOCOLS' = 'Emergency Protocols'
  'RECOMMENDED ACTION INSTRUCTION' = 'Recommended Action Instruction'
  'EXPECTED CASCADING IMPACT' = 'Expected Cascading Impact'
  'FIELD OPERATIONAL LOGS' = 'Field Operational Logs'
  'DIRECT DEPARTMENT EMERGENCY PROTOCOLS' = 'Direct Department Emergency Protocols'
  'START EXECUTION' = 'Start Execution'
  'MARK COMPLETED' = 'Mark Completed'

  # CommandCenter.jsx
  'CROSS-DEPARTMENT CAUSAL RELATIONSHIPS' = 'Cross-Department Causal Relationships'
  'LIVE CITY RISK OVERVIEW' = 'Live City Risk Overview'
  'AGGREGATE RISK INDEX' = 'Aggregate Risk Index'
  'OVERALL READINESS' = 'Overall Readiness'
  'DEPARTMENT READINESS' = 'Department Readiness'
  'CURRENT ACTIVE INCIDENTS' = 'Current Active Incidents'
  'LIVE RISK SCORE' = 'Live Risk Score'
  'DEPARTMENT STATUS' = 'Department Status'

  # IncidentIntelligence.jsx
  'DIAGNOSTICS & CASCADE DETECTOR' = 'Diagnostics & Cascade Detector'
  'INCIDENT INTELLIGENCE' = 'Incident Intelligence'
  'ACTIVE INCIDENTS IN ZONE' = 'Active Incidents in Zone'
  'AFFECTED DEPTS' = 'Affected Depts'

  # CityIntelligence.jsx
  'MULTI-DEPARTMENT REAL-TIME SENSOR TELEMETRY' = 'Multi-Department Real-Time Sensor Telemetry'
  'CITY INTELLIGENCE' = 'City Intelligence'

  # CausalIntelligence.jsx
  'CAUSAL INTELLIGENCE NETWORK' = 'Causal Intelligence Network'

  # AgentCouncil.jsx
  'MULTI-AGENT AI ORCHESTRATION COUNCIL' = 'Multi-Agent AI Orchestration Council'
  'AGENT COUNCIL' = 'Agent Council'
}

$files = Get-ChildItem -Path 'src/pages/*.jsx','src/components/*.jsx'
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
  }
  Set-Content -Path $f.FullName -Value $content -NoNewline
}
Write-Host "Done converting hardcoded uppercase strings to title case."
