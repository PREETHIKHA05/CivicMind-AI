import React from 'react';
import { CityProvider, useCity } from './context/CityContext';
import LaunchScreen from './components/LaunchScreen';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import SimulationBar from './components/SimulationBar';
import AiChatDrawer from './components/AiChatDrawer';
import ResponsibleAiModal from './components/ResponsibleAiModal';

import CommandCenter from './pages/CommandCenter';
import CityIntelligence from './pages/CityIntelligence';
import IncidentIntelligence from './pages/IncidentIntelligence';
import AgentCouncil from './pages/AgentCouncil';
import CausalIntelligence from './pages/CausalIntelligence';
import ResponsePlans from './pages/ResponsePlans';
import DepartmentDashboard from './pages/DepartmentDashboard';
import CityMemory from './pages/CityMemory';

import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

function MainLayout() {
  const { activePage, hasLaunched, toasts, removeToast } = useCity();

  if (!hasLaunched) {
    return <LaunchScreen />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'command-center':
        return <CommandCenter />;
      case 'city-intelligence':
        return <CityIntelligence />;
      case 'incident-intelligence':
        return <IncidentIntelligence />;
      case 'agent-council':
        return <AgentCouncil />;
      case 'causal-intelligence':
        return <CausalIntelligence />;
      case 'response-plans':
        return <ResponsePlans />;
      case 'department-dashboard':
        return <DepartmentDashboard />;
      case 'city-memory':
        return <CityMemory />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 overflow-hidden font-sans select-none">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Simulation Progress Timeline Bar */}
        <SimulationBar />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#080c14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.08),rgba(255,255,255,0))]">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* AI Assistant Command Drawer */}
      <AiChatDrawer />

      {/* Responsible AI Governance Modal */}
      <ResponsibleAiModal />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl glass-panel border shadow-2xl flex items-start gap-3 transition-all animate-slide-in ${
              toast.type === 'critical'
                ? 'border-red-500/50 bg-red-950/80 text-red-200'
                : toast.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200'
                : toast.type === 'warning'
                ? 'border-amber-500/50 bg-amber-950/80 text-amber-200'
                : 'border-cyan-500/50 bg-cyan-950/80 text-cyan-200'
            }`}
          >
            {toast.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span>{toast.title}</span>
                <span className="text-[10px] opacity-70">{toast.time}</span>
              </div>
              <p className="text-xs mt-0.5 leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CityProvider>
      <MainLayout />
    </CityProvider>
  );
}
