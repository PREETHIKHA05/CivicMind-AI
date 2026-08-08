import React, { createContext, useContext, useState, useEffect } from 'react';
import { CITY_METADATA, AI_AGENTS, INCIDENTS_LIST, COORDINATED_RESPONSE_PLAN, MAP_MARKERS } from '../data/mockData';

const CityContext = createContext();

export function CityProvider({ children }) {
  // Navigation State
  const [activePage, setActivePage] = useState('command-center'); // 'command-center' | 'city-intelligence' | 'incident-intelligence' | 'agent-council' | 'causal-intelligence' | 'response-plans' | 'city-memory' | 'analytics'
  
  // Launch Screen / Enter App Overlay
  const [hasLaunched, setHasLaunched] = useState(false);

  // Selected Items State
  const [selectedIncident, setSelectedIncident] = useState(INCIDENTS_LIST[0]);
  const [selectedAgent, setSelectedAgent] = useState(AI_AGENTS[0]);
  const [selectedMarker, setSelectedMarker] = useState(MAP_MARKERS[0]);

  // Response Plan Approval State
  const [planStatus, setPlanStatus] = useState(COORDINATED_RESPONSE_PLAN.status); // 'Awaiting Human Review' | 'APPROVED BY ICCC OPERATOR' | 'Changes Requested' | 'Dismissed'
  const [operatorNote, setOperatorNote] = useState('');
  const [approvalTime, setApprovalTime] = useState(null);

  // Simulation Engine State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStage, setSimStage] = useState(0); // 0 to 10
  const [simSpeed, setSimSpeed] = useState(1000); // ms per step
  const [simLogs, setSimLogs] = useState([]);
  const [currentRiskScore, setCurrentRiskScore] = useState(CITY_METADATA.stats.preInterventionRisk);

  // Agent Council Active Reasoning State
  const [isAgentReasoning, setIsAgentReasoning] = useState(false);
  const [activeReasoningAgentIndex, setActiveReasoningAgentIndex] = useState(-1);

  // AI Command Drawer & Chat State
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: 'Greetings ICCC Operator. CivicMind AI is monitoring 7 urban sectors in Chennai. How can I assist your command decisions today?',
      time: '07:00 AM'
    }
  ]);

  // Toasts / Notifications
  const [toasts, setToasts] = useState([
    { id: 1, type: 'critical', title: 'Critical Risk Alert', message: 'Ward 18 Hospital Access endangered by 32cm water stagnation.', time: '07:05 AM' }
  ]);

  // Responsible AI Info Modal
  const [isResponsibleAiModalOpen, setIsResponsibleAiModalOpen] = useState(false);

  // Toast Helper
  const addToast = (type, title, message) => {
    const id = Date.now();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setToasts(prev => [ { id, type, title, message, time }, ...prev.slice(0, 4) ]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Plan Approval Action
  const approvePlan = (note = '') => {
    setPlanStatus('APPROVED BY ICCC OPERATOR');
    setOperatorNote(note || 'Approved for immediate multi-department dispatch by ICCC Senior Operator.');
    setApprovalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setCurrentRiskScore(CITY_METADATA.stats.postInterventionRisk);
    addToast('success', 'Plan Approved', 'Coordinated Response Plan approved! Simulated risk reduced to 41/100.');
  };

  const requestPlanChanges = (note) => {
    setPlanStatus('Changes Requested');
    setOperatorNote(note);
    addToast('warning', 'Changes Requested', 'Plan flagged for adjustments by Operator.');
  };

  const dismissPlan = () => {
    setPlanStatus('Dismissed');
    addToast('info', 'Plan Dismissed', 'Coordinated Response Plan dismissed by Operator.');
  };

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
    setCurrentRiskScore(planStatus === 'APPROVED BY ICCC OPERATOR' ? 41 : 92);
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
          8: 'Stage 8: Plan presented to ICCC Operator for Human Review.',
          9: 'Stage 9: Operator approves Coordinated Response Plan.',
          10: 'Stage 10: Simulated mobile pumps and traffic diversion clear corridor. Risk drops to 41/100.'
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
          addToast('success', 'Simulation Complete', 'Projected Risk Score successfully lowered from 92 to 41.');
        }
      }, simSpeed);
    }
    return () => clearTimeout(timer);
  }, [isSimulating, simStage, simSpeed]);

  // Agent Reasoning Animation Trigger
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
        approvePlan,
        requestPlanChanges,
        dismissPlan,
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
