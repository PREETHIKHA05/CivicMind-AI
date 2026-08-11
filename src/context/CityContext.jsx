import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CITY_METADATA, AI_AGENTS, INCIDENTS_LIST, COORDINATED_RESPONSE_PLAN, MAP_MARKERS, USER_ROLES, DEPARTMENTS } from '../data/mockData';

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
  const [selectedIncident, setSelectedIncident] = useState(INCIDENTS_LIST[0]);
  const [selectedAgent, setSelectedAgent] = useState(AI_AGENTS[0]);
  const [selectedMarker, setSelectedMarker] = useState(MAP_MARKERS[0]);

  // Response Plan State & Dynamic Action Editing
  const [planStatus, setPlanStatus] = useState(COORDINATED_RESPONSE_PLAN.status);
  const [operatorNote, setOperatorNote] = useState('');
  const [approvalTime, setApprovalTime] = useState(null);
  
  // Editable Response Plan Actions
  const [planActions, setPlanActions] = useState(COORDINATED_RESPONSE_PLAN.actions);

  // Department Assigned Work Orders (Tasks) — Initialized EMPTY until assigned by Zone Counselor!
  const [departmentTasks, setDepartmentTasks] = useState([]);

  // Toasts / Notifications
  const [toasts, setToasts] = useState([
    { id: 1, type: 'critical', title: 'Critical Risk Alert', message: 'Ward 18 Hospital Access endangered by 32cm water stagnation.', time: '07:05 AM' }
  ]);

  const addToast = (type, title, message) => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToasts(prev => [ { id, type, title, message, time }, ...prev.slice(0, 4) ]);
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

      socket.on('planReset', ({ plan, workOrders }) => {
        setPlanStatus('Awaiting Human Review');
        setOperatorNote('');
        setApprovalTime(null);
        setDepartmentTasks([]);
        addToast('warning', 'Plan Reverted', 'Plan reset to unapproved draft by Zone Counselor. Work orders cleared.');
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

  // Simulation Stage Auto-Advance
  useEffect(() => {
    let timer;
    if (isSimulating && simStage > 0 && simStage <= 10) {
      timer = setTimeout(() => {
        const stageMessages = {
          1: 'Stage 1: Weather Agent detects Doppler rain cell (120 mm/hr) stationary over Ward 18.',
          2: 'Stage 2: Water Agent detects secondary drain outflow capacity drops to 28%.',
          3: 'Stage 3: Traffic Agent reports Hospital Road speed down to 6 km/h (1.8km tailback).',
          4: 'Stage 4: Emergency Agent flags Ambulance #108-B4 delayed carrying critical patient.',
          5: 'Stage 5: Memory Agent matches 91% vector similarity with Nov 2024 flood incident.',
          6: 'Stage 6: Planner Agent calculates cascading risk: 92/100 (Hospital Access Lockout).',
          7: 'Stage 7: CivicMind synthesizes 4-point Coordinated Response Plan across departments.',
          8: 'Stage 8: Plan presented to Zone Counselor for Human Review & Editing.',
          9: 'Stage 9: Zone Counselor reviews and approves Coordinated Response Plan.',
          10: 'Stage 10: Department work orders executed. Mobile pumps and traffic diversion clear corridor. Risk drops.'
        };

        const msg = stageMessages[simStage];
        if (msg) {
          setSimLogs(prev => [...prev, `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - ${msg}`]);
        }

        if (simStage === 9) {
          approvePlan('Auto-approved via End-to-End Simulation Run.');
        }

        if (simStage < 10) {
          setSimStage(prev => prev + 1);
        } else {
          setIsSimulating(false);
          const finalRisk = calculateProjectedRisk(planActions);
          addToast('success', 'Simulation Complete', `Projected Risk Score successfully lowered from 92 to ${finalRisk}.`);
        }
      }, simSpeed);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, simStage, simSpeed]);

  const [isAgentReasoning, setIsAgentReasoning] = useState(false);
  const [activeReasoningAgentIndex, setActiveReasoningAgentIndex] = useState(-1);

  const runAgentReasoning = () => {
    setIsAgentReasoning(true);
    setActiveReasoningAgentIndex(0);

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < AI_AGENTS.length) {
        setActiveReasoningAgentIndex(idx);
      } else {
        clearInterval(interval);
        setIsAgentReasoning(false);
        setActiveReasoningAgentIndex(-1);
        addToast('purple', 'Agent Council Consensus', '7/7 AI Agents reached 95% consensus on response recommendations.');
      }
    }, 1200);
  };

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
        isAgentReasoning,
        activeReasoningAgentIndex,
        runAgentReasoning,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiMessages,
        setAiMessages,
        toasts,
        addToast,
        removeToast,
        isResponsibleAiModalOpen,
        setIsResponsibleAiModalOpen
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
