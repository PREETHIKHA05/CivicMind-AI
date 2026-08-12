import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CITY_METADATA, AI_AGENTS, INCIDENTS_LIST, MAP_MARKERS, USER_ROLES, DEPARTMENTS } from '../data/mockData';

const CityContext = createContext();

export function CityProvider({ children }) {
  // Backend Host Configuration for Hackathon Cross-Laptop Network Connection
  const defaultHost = typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000';
  const [backendUrl, setBackendUrl] = useState(defaultHost);
  const [socketConnected, setSocketConnected] = useState(false);

  // Authentication & Role Management State
  const [currentUser, setCurrentUser] = useState(USER_ROLES[0]); // Default to Zone Counselor
  const [hasLaunched, setHasLaunched] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('water'); // For department dashboard view

  // Navigation State
  const [activePage, setActivePage] = useState('command-center');

  // Selected Items State
  const [selectedIncident, setSelectedIncident] = useState(null); // Start with null instead of mock data
  const [selectedAgent, setSelectedAgent] = useState(AI_AGENTS[0]);
  const [selectedMarker, setSelectedMarker] = useState(MAP_MARKERS[0]);

  // Active Incidents List (populated by Agent Council synthesis)
  const [incidents, setIncidents] = useState([]);

  // Response Plan State & Dynamic Action Editing — starts empty; the backend is
  // authoritative (see 'initialData'/'planGenerated' socket handlers below).
  // Never seed this from mockData: pre-connection state must be the honest
  // empty state, not a fabricated plan.
  const [planStatus, setPlanStatus] = useState('no_run_yet');
  const [operatorNote, setOperatorNote] = useState('');
  const [approvalTime, setApprovalTime] = useState(null);

  // Editable Response Plan Actions
  const [planActions, setPlanActions] = useState([]);

  // Fields populated by a real orchestrator run (backend/orchestrator/run.js) — additive,
  // null/empty until the first live run completes.
  const [planRunId, setPlanRunId] = useState(null);
  const [planConfidenceBreakdown, setPlanConfidenceBreakdown] = useState(null);
  const [planGate, setPlanGate] = useState(null);
  const [planGateReason, setPlanGateReason] = useState('');
  const [planUnresolved, setPlanUnresolved] = useState([]);
  const [planConflictsResolved, setPlanConflictsResolved] = useState([]);
  const [planCausalRiskIndex, setPlanCausalRiskIndex] = useState(null);

  // Department Assigned Work Orders (Tasks) — Initialized EMPTY until assigned by Zone Counselor!
  const [departmentTasks, setDepartmentTasks] = useState([]);

  // Toasts / Notifications
  const [toasts, setToasts] = useState([
    { id: 1, type: 'critical', title: 'Critical Risk Alert', message: 'Ward 18 Hospital Access endangered by 32cm water stagnation.', time: '07:05 AM' }
  ]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToasts(prev => [{ id, type, title, message, time }, ...prev.slice(0, 4)]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Dynamic Risk Score Calculation based on current planActions
  const calculateProjectedRisk = (actions = planActions) => {
    const baseRisk = CITY_METADATA.stats.preInterventionRisk; // 92

    const priorityMultipliers = {
      CRITICAL: 1.25,
      HIGH: 1.0,
      MEDIUM: 0.7,
      LOW: 0.4
    };

    let totalReduction = 0;
    actions.forEach(act => {
      if (act.enabled) {
        const mult = priorityMultipliers[act.priority] || 1.0;
        const countBonus = act.resourceCount ? Math.min(1.3, 0.7 + act.resourceCount * 0.15) : 1.0;
        totalReduction += (act.baseRiskImpact || 15) * mult * countBonus;
      }
    });

    const calculatedRisk = Math.max(15, Math.min(92, Math.round(baseRisk - totalReduction)));
    return calculatedRisk;
  };

  const [currentRiskScore, setCurrentRiskScore] = useState(CITY_METADATA.stats.preInterventionRisk);

  // ---------------- Agent Orchestrator Run State ----------------
  const [agentTrace, setAgentTrace] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [currentRun, setCurrentRun] = useState(null); // { runId, riskIndex, terminals, gate, agentsInvoked, totalAgents }
  const [runStatus, setRunStatus] = useState('idle'); // idle | running | completed | aborted

  const startAgentRun = (scenario) => {
    setRunStatus('running');
    fetch(`${backendUrl}/api/runs/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario)
    }).catch(() => {
      setRunStatus('idle');
      addToast('warning', 'Run Failed to Start', 'Could not reach the orchestrator backend.');
    });
  };

  // Trace replay — loads a previously completed run's stored events without starting a new run.
  const loadTraceReplay = (runId) => {
    fetch(`${backendUrl}/api/runs/${runId}/trace`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.events || data.events.length === 0) {
          addToast('warning', 'No Trace Found', `No stored events for run ${runId}.`);
          return;
        }
        setAgentTrace(data.events);
        setActiveAgents([]);
        setCurrentRun({ runId });
        setRunStatus('completed');
        addToast('info', 'Trace Replay Loaded', `Replaying ${data.events.length} events from ${runId}.`);
      })
      .catch(() => addToast('warning', 'Replay Failed', 'Could not fetch that trace from the backend.'));
  };

  // ---------------- WebSocket Real-Time Listener ----------------
  useEffect(() => {
    let socket;
    try {
      socket = io(backendUrl, { reconnectionAttempts: 5, timeout: 3000 });

      socket.on('connect', () => {
        setSocketConnected(true);
        console.log('⚡ Connected to CivicMind Backend Socket.io server!');
      });

      socket.on('disconnect', () => {
        setSocketConnected(false);
      });

      // Initial Data from Backend (Only assigned tasks are returned)
      socket.on('initialData', (data) => {
        if (data.plan) {
          if (data.plan.actions) setPlanActions(data.plan.actions);
          if (data.plan.status) setPlanStatus(data.plan.status);
          if (data.plan.operatorNote) setOperatorNote(data.plan.operatorNote);
          if (data.plan.approvalTime) setApprovalTime(data.plan.approvalTime);
        }
        if (data.workOrders) {
          const mapped = data.workOrders.map(w => ({ ...w, id: w.taskId || w.id }));
          setDepartmentTasks(mapped);
        }
      });

      // Live Plan Approved Event from Zone Counselor Laptop A
      socket.on('planApproved', (plan) => {
        setPlanStatus(plan.status);
        if (plan.operatorNote) setOperatorNote(plan.operatorNote);
        if (plan.approvalTime) setApprovalTime(plan.approvalTime);
        if (plan.actions) setPlanActions(plan.actions);
        const newRisk = calculateProjectedRisk(plan.actions);
        setCurrentRiskScore(newRisk);
        addToast('success', 'Plan Approved & Dispatched', `Plan approved by Zone Counselor! Work orders dispatched to department dashboards.`);
      });

      // Live Work Orders Dispatched Event
      socket.on('workOrdersDispatched', (orders) => {
        const mapped = orders.map(w => ({ ...w, id: w.taskId || w.id }));
        setDepartmentTasks(mapped);
        addToast('info', 'New Work Orders Received', `Department terminals updated with ${orders.length} active work orders.`);
      });

      // Live Work Order Status Update from Department Laptop B!
      socket.on('workOrderUpdated', ({ taskId, updatedOrder, allWorkOrders }) => {
        if (allWorkOrders) {
          const mapped = allWorkOrders.map(w => ({ ...w, id: w.taskId || w.id }));
          setDepartmentTasks(mapped);
        } else if (updatedOrder) {
          setDepartmentTasks(prev => prev.map(t => (t.id === taskId || t.taskId === taskId) ? { ...updatedOrder, id: taskId } : t));
        }
        addToast('success', 'Work Order Updated', `Work Order ${taskId} status changed to ${updatedOrder?.status || 'Updated'} by Department Official.`);
      });

      // Live Log Added Event
      socket.on('workOrderLogAdded', ({ taskId, updatedOrder, allWorkOrders }) => {
        if (allWorkOrders) {
          const mapped = allWorkOrders.map(w => ({ ...w, id: w.taskId || w.id }));
          setDepartmentTasks(mapped);
        }
        addToast('info', 'Field Log Updated', `New field log added for Work Order.`);
      });

      socket.on('databaseSeeded', ({ plan, workOrders }) => {
        setPlanStatus(plan.status);
        setPlanActions(plan.actions);
        setDepartmentTasks(workOrders || []);
        addToast('info', 'System Reset', 'Plan reset to unapproved initial state.');
      });

      // A completed orchestrator run replaces the draft plan — same shape the
      // existing approve/modify/dismiss flow already reads from, extended.
      socket.on('planGenerated', (plan) => {
        setPlanStatus(plan.status);
        setPlanActions(plan.actions);
        setOperatorNote('');
        setApprovalTime(null);
        setPlanRunId(plan.runId || null);
        setPlanConfidenceBreakdown(plan.confidenceBreakdown || null);
        setPlanGate(plan.gate || null);
        setPlanGateReason(plan.gateReason || '');
        setPlanUnresolved(plan.unresolved || []);
        setPlanConflictsResolved(plan.conflictsResolved || []);
        setPlanCausalRiskIndex(plan.causalRiskIndex ?? null);
        setCurrentRiskScore(plan.riskScorePre ?? plan.causalRiskIndex ?? currentRiskScore);

        // If incidents are included in the plan, update incidents state
        if (plan.incidents && plan.incidents.length > 0) {
          setIncidents(plan.incidents);
          // Auto-select the first incident if none selected
          if (!selectedIncident) {
            setSelectedIncident(plan.incidents[0]);
          }
        }

        addToast('info', 'New Plan Generated', `Orchestrator run complete — gate: ${plan.gate || 'n/a'}, confidence ${plan.confidence ?? '?'}%.`);
      });

      socket.on('planReset', ({ plan, workOrders }) => {
        setPlanStatus('Awaiting Human Review');
        setOperatorNote('');
        setApprovalTime(null);
        setDepartmentTasks([]);
        addToast('warning', 'Plan Reverted', 'Plan reset to unapproved draft by Zone Counselor. Work orders cleared.');
      });

      // Live Agent Orchestrator Trace — one event per emitted step, seq-ordered
      socket.on('agent:event', (event) => {
        if (event.type === 'run_started') {
          setAgentTrace([event]);
          setActiveAgents([]);
          setCurrentRun({ runId: event.runId });
          setRunStatus('running');
          return;
        }

        setAgentTrace(prev => {
          if (prev.length > 0 && prev[0].runId !== event.runId) return prev; // stale event from a prior run
          return [...prev, event].sort((a, b) => a.seq - b.seq);
        });

        if (event.type === 'routing_decision') {
          setActiveAgents(event.payload.agents || []);
        }
        if (event.type === 'causal_computed') {
          setCurrentRun(prev => ({ ...prev, riskIndex: event.payload.riskIndex, terminals: event.payload.terminals }));
        }
        if (event.type === 'gate_decision') {
          setCurrentRun(prev => ({ ...prev, gate: event.payload.gate }));
        }
        if (event.type === 'run_completed') {
          setCurrentRun(prev => ({ ...prev, ...event.payload }));
          setRunStatus('completed');
        }
        if (event.type === 'run_aborted') {
          setRunStatus('aborted');
          addToast('warning', 'Run Aborted', event.payload?.error || 'The agent run was aborted.');
        }
      });

    } catch (err) {
      console.warn("Socket.io client error:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [backendUrl]);

  // Update Plan Actions
  const updatePlanAction = (actionId, updatedFields) => {
    const nextActions = planActions.map(act => act.id === actionId ? { ...act, ...updatedFields } : act);
    setPlanActions(nextActions);
    const newRisk = calculateProjectedRisk(nextActions);
    if (planStatus === 'APPROVED BY ICCC OPERATOR') {
      setCurrentRiskScore(newRisk);
    }

    fetch(`${backendUrl}/api/plan/action`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, updatedFields })
    }).catch(err => console.log('Backend sync offline, updated locally'));
  };

  const togglePlanAction = (actionId) => {
    const nextActions = planActions.map(act => act.id === actionId ? { ...act, enabled: !act.enabled } : act);
    setPlanActions(nextActions);

    fetch(`${backendUrl}/api/plan/action`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId, updatedFields: { enabled: !planActions.find(a => a.id === actionId)?.enabled } })
    }).catch(err => console.log('Backend sync offline, toggled locally'));
  };

  // Login / Logout Handler
  const loginUser = (userRoleObj) => {
    setCurrentUser(userRoleObj);
    setHasLaunched(true);
    if (userRoleObj.role === 'department') {
      setSelectedDeptId(userRoleObj.departmentId);
      setActivePage('department-dashboard');
      addToast('info', `Welcome ${userRoleObj.name}`, `Logged into ${userRoleObj.deptName} Dashboard`);
    } else {
      setActivePage('command-center');
      addToast('info', `Welcome ${userRoleObj.name}`, `Logged in as Zone Counselor (Ward 18 Admin)`);
    }
  };

  const logoutUser = () => {
    setHasLaunched(false);
  };

  // Plan Approval Action — Saves to MongoDB Atlas & Broadcasts via WebSockets!
  const broadcastCitizenMessage = async (message, recipients = []) => {
    const safeRecipients = recipients.length > 0 ? recipients.slice(0, 4) : [
      '+919360198178'
    ];

    const payload = {
      message: message || 'Ward 18 emergency advisory: follow the official diversion route and stay alert for on-ground updates.',
      recipients: safeRecipients
    };

    try {
      const response = await fetch(`${backendUrl}/api/plan/broadcast-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data && data.success) {
        addToast('success', 'Broadcast Sent', `Email sent to ${data.sentCount} recipients.`);
      } else {
        addToast('warning', 'Broadcast Failed', data?.summary || 'Email broadcast was rejected by the backend.');
      }

      return data;
    } catch (error) {
      addToast('warning', 'Broadcast Failed', 'Could not reach the backend demo SMS service.');
      return null;
    }
  };

  const approvePlan = (note = '') => {
    const newRisk = calculateProjectedRisk(planActions);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setPlanStatus('APPROVED BY ICCC OPERATOR');
    setOperatorNote(note || 'Approved for immediate multi-department dispatch by Zone Counselor.');
    setApprovalTime(nowTime);
    setCurrentRiskScore(newRisk);

    const updatedTasks = planActions
      .filter(act => act.enabled)
      .map((act, index) => {
        const existing = departmentTasks.find(t => t.actionId === act.id);
        return {
          id: existing ? existing.id : `task-${Date.now()}-${index}`,
          taskId: existing ? existing.taskId : `task-${Date.now()}-${index}`,
          actionId: act.id,
          departmentId: act.departmentId,
          departmentName: act.department,
          title: `${act.department} Action: ${act.resourceUnits || 'Emergency Mitigation'}`,
          recommendation: act.recommendation,
          priority: act.priority,
          assignedBy: currentUser?.name || 'Zone Counselor',
          assignedTime: nowTime,
          status: existing ? existing.status : 'Assigned',
          expectedImpact: act.expectedImpact,
          logs: existing ? existing.logs : [
            { time: nowTime, author: currentUser?.name || 'Zone Counselor', note: `Work Order issued by Zone Counselor via Approved Plan.` }
          ]
        };
      });

    setDepartmentTasks(updatedTasks);

    // Call REST API to dispatch to Backend & notify all laptops
    fetch(`${backendUrl}/api/plan/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operatorNote: note || 'Approved for immediate multi-department dispatch by Zone Counselor.',
        actions: planActions,
        riskScore: newRisk
      })
    }).then(res => res.json())
      .then(data => {
        addToast('success', 'Plan Approved & Dispatched', `Work orders dispatched to all department dashboards!`);
      })
      .catch(err => {
        addToast('success', 'Plan Approved', `Approved locally! Dynamic risk reduced to ${newRisk}/100.`);
      });
  };

  const requestPlanChanges = (note) => {
    setPlanStatus('Changes Requested');
    setOperatorNote(note);
    addToast('warning', 'Changes Requested', 'Plan flagged for adjustments by Zone Counselor.');
  };

  const dismissPlan = () => {
    setPlanStatus('Dismissed');
    addToast('info', 'Plan Dismissed', 'Coordinated Response Plan dismissed by Zone Counselor.');
  };

  const resetPlanToUnapproved = () => {
    setPlanStatus('Awaiting Human Review');
    setOperatorNote('');
    setApprovalTime(null);
    setDepartmentTasks([]);
    const initialRisk = calculateProjectedRisk(planActions);
    setCurrentRiskScore(initialRisk);

    fetch(`${backendUrl}/api/plan/reset`, { method: 'POST' })
      .catch(err => console.log('Backend sync offline, reset locally'));

    addToast('warning', 'Plan Reverted', 'Coordinated Response Plan reverted to unapproved draft. Department work orders cleared.');
  };

  // Department Task Status Update (Laptop B Official action)
  const updateTaskStatus = (taskId, newStatus, noteText = '') => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser?.name || 'Department Official';

    setDepartmentTasks(prev => prev.map(t => {
      if (t.id === taskId || t.taskId === taskId) {
        const newLogs = noteText
          ? [...t.logs, { time: nowTime, author: authorName, note: noteText }]
          : [...t.logs, { time: nowTime, author: authorName, note: `Task status updated to ${newStatus}.` }];
        return { ...t, status: newStatus, logs: newLogs };
      }
      return t;
    }));

    fetch(`${backendUrl}/api/work-orders/${taskId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        author: authorName,
        note: noteText
      })
    }).catch(err => console.log('Backend sync offline, updated locally'));

    addToast('success', 'Work Order Updated', `Task status changed to ${newStatus}`);
  };

  // Add Log to Task
  const addTaskLog = (taskId, noteText) => {
    if (!noteText.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const authorName = currentUser?.name || 'Official';

    setDepartmentTasks(prev => prev.map(t => {
      if (t.id === taskId || t.taskId === taskId) {
        return { ...t, logs: [...t.logs, { time: nowTime, author: authorName, note: noteText }] };
      }
      return t;
    }));

    fetch(`${backendUrl}/api/work-orders/${taskId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: authorName,
        note: noteText
      })
    }).catch(err => console.log('Backend sync offline, logged locally'));

    addToast('info', 'Progress Logged', 'Field operational log added to task.');
  };

  // Simulation Engine State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStage, setSimStage] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1000);
  const [simLogs, setSimLogs] = useState([]);

  // AI Command Drawer State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: 'Greetings. CivicMind AI is monitoring 7 urban sectors in Chennai. How can I assist your command decisions today?',
      time: '07:00 AM'
    }
  ]);

  const [isResponsibleAiModalOpen, setIsResponsibleAiModalOpen] = useState(false);

  // Simulation Logic
  const startSimulation = () => {
    setIsSimulating(true);
    setSimStage(1);
    setSimLogs(['07:01 AM - Scenario Started: Heavy Rainfall Emergency (Ward 18)']);
    setCurrentRiskScore(92);
    addToast('info', 'Simulation Started', 'Running 10-stage urban cascade simulation...');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimStage(0);
    setSimLogs([]);
    const projected = calculateProjectedRisk(planActions);
    setCurrentRiskScore(planStatus === 'APPROVED BY ICCC OPERATOR' ? projected : 92);
  };

  // Generate Plan from Agent Council Synthesis
  const generatePlanFromRisks = (risks) => {
    if (!risks || risks.length === 0) return;

    // Transform risks into incidents
    const newIncidents = risks.map((risk, index) => ({
      id: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}-${index + 1}`,
      title: risk.title,
      summary: risk.cascade || 'Multi-system cascade detected by agent synthesis.',
      severity: risk.severity || 'HIGH',
      confidence: typeof risk.confidence === 'number' ? Math.round(risk.confidence * 100) : 85,
      ward: 'Ward 18',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riskScore: 92,
      affectedDepartments: risk.affectedDepartments || ['Water Management', 'Traffic Control'],
      contributingAgents: risk.contributingAgents || [],
      evidenceIds: risk.evidenceIds || [],
      recommendedAction: risk.recommendedAction,
      estimatedOnsetMinutes: risk.estimatedOnsetMinutes,
      rootCauses: [risk.cascade || 'Multi-agent consensus identified cascading failure pattern'],
      cascadingEffects: [
        `Primary impact: ${risk.title}`,
        risk.recommendedAction ? `Mitigation required: ${risk.recommendedAction}` : 'Immediate response required',
        `Estimated onset: ${risk.estimatedOnsetMinutes || 'Unknown'} minutes`
      ],
      aiAssessment: `${risk.contributingAgents?.length || 0} agents reached consensus. ${risk.cascade || 'Critical infrastructure cascade detected.'}`,
      affectedSensors: ['Rainfall Monitor', 'Sump Level Sensor', 'Traffic Loop Detectors'],
      causalNodes: ['rainfall_intensity', 'sump_water_level', 'hospital_road_congestion']
    }));

    setIncidents(newIncidents);
    if (newIncidents.length > 0) {
      setSelectedIncident(newIncidents[0]);
    }

    // Generate response plan actions from risks
    const departmentMapping = {
      'Water': 'water',
      'Water Management': 'water',
      'Traffic': 'traffic',
      'Traffic Control': 'traffic',
      'Emergency': 'emergency',
      'Emergency Services': 'emergency',
      'Public Info': 'public',
      'Public Information': 'public',
      'Health': 'health'
    };

    const iconMapping = {
      'water': 'Droplets',
      'traffic': 'Car',
      'emergency': 'Ambulance',
      'public': 'Radio',
      'health': 'HeartPulse'
    };

    const departmentNames = {
      'water': 'Water Resources & Drainage',
      'traffic': 'Traffic Management Bureau',
      'emergency': 'Emergency Services (108)',
      'public': 'Public Information & Advisory',
      'health': 'Municipal Public Health'
    };

    const newPlanActions = risks.map((risk, index) => {
      const affectedDept = risk.affectedDepartments?.[0] || 'Water Management';
      const deptId = departmentMapping[affectedDept] || 'water';

      return {
        id: `action-${Date.now()}-${index}`,
        department: departmentNames[deptId],
        departmentId: deptId,
        deptIcon: iconMapping[deptId],
        recommendation: risk.recommendedAction || 'Deploy emergency response team',
        priority: risk.severity || 'HIGH',
        resourceUnits: 'Emergency Mitigation',
        resourceCount: 2,
        baseRiskImpact: 15,
        enabled: true,
        reason: risk.cascade || 'Agent synthesis identified critical risk',
        expectedImpact: `Mitigate ${risk.title}`,
        reversible: true,
        evidenceIds: risk.evidenceIds || []
      };
    });

    setPlanActions(newPlanActions);
    setPlanStatus('Awaiting Human Review');

    addToast('success', 'Incidents & Plan Generated', `${newIncidents.length} incidents detected and response plan created.`);
  };

  // Simulation stage auto-advance and fake agent reasoning were removed here.
  // They are being replaced by the real orchestrator's agent:event stream
  // (Phase 2+). The human approval gate must never be triggered by a timer —
  // approvePlan() is only ever called from an explicit operator click.

  return (
    <CityContext.Provider
      value={{
        backendUrl,
        setBackendUrl,
        socketConnected,
        currentUser,
        setCurrentUser,
        loginUser,
        logoutUser,
        selectedDeptId,
        setSelectedDeptId,
        activePage,
        setActivePage,
        hasLaunched,
        setHasLaunched,
        selectedIncident,
        setSelectedIncident,
        selectedAgent,
        setSelectedAgent,
        selectedMarker,
        setSelectedMarker,
        planStatus,
        setPlanStatus,
        operatorNote,
        setOperatorNote,
        approvalTime,
        planActions,
        updatePlanAction,
        togglePlanAction,
        calculateProjectedRisk,
        departmentTasks,
        updateTaskStatus,
        addTaskLog,
        approvePlan,
        broadcastCitizenMessage,
        requestPlanChanges,
        dismissPlan,
        resetPlanToUnapproved,
        isSimulating,
        simStage,
        simLogs,
        currentRiskScore,
        startSimulation,
        stopSimulation,
        resetSimulation,
        agentTrace,
        activeAgents,
        currentRun,
        runStatus,
        startAgentRun,
        loadTraceReplay,
        planRunId,
        planConfidenceBreakdown,
        planGate,
        planGateReason,
        planUnresolved,
        planConflictsResolved,
        planCausalRiskIndex,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiMessages,
        setAiMessages,
        toasts,
        addToast,
        removeToast,
        isResponsibleAiModalOpen,
        setIsResponsibleAiModalOpen,
        incidents,
        setIncidents,
        generatePlanFromRisks
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
