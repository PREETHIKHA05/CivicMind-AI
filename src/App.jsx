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

import { X, AlertTriangle, CheckCircle2, Info, AlertCircle, UserCheck, Sparkles } from 'lucide-react';

function MainLayout() {
  const { activePage, hasLaunched, toasts, removeToast, setIsAiDrawerOpen } = useCity();

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
    <div className="flex h-screen bg-[#f6f5f9] text-slate-800 overflow-hidden font-sans select-none">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Simulation Progress Timeline Bar */}
        <SimulationBar />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f6f5f9] relative">
          {/* Subtle Ambient Background Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#f6f5f9]">
            <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-purple-500/4 blur-[120px] animate-ambient-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-violet-500/4 blur-[120px] animate-ambient-glow-delayed" />
          </div>
          <div className="max-w-7xl mx-auto relative z-10">
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
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 transition-all animate-slide-in ${
              toast.type === 'critical'
                ? 'border-red-200 bg-red-50 text-red-950'
                : toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : toast.type === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-purple-200 bg-purple-50 text-purple-950'
            }`}
          >
            {toast.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span>{toast.title}</span>
                <span className="text-[10px] opacity-70">{toast.time}</span>
              </div>
              <p className="text-xs mt-0.5 leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
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
