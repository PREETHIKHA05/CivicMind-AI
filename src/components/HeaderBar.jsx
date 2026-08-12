import React, { useState, useEffect } from 'react';
import { useCity } from '../context/CityContext';
import { CITY_METADATA, USER_ROLES } from '../data/mockData';
import {
  MapPin,
  Clock,
  CloudRain,
  Thermometer,
  ShieldCheck,
  Play,
  RotateCcw,
  Bot,
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  Activity,
  UserCheck,
  LogOut,
  Building2,
  ChevronDown
} from 'lucide-react';

export default function HeaderBar() {
  const {
    currentUser,
    loginUser,
    logoutUser,
    setIsAiDrawerOpen,
    isSimulating,
    resetSimulation,
    currentRiskScore,
    planStatus,
    setIsResponsibleAiModalOpen,
    toasts,
    runStatus,
    startAgentRun
  } = useCity();

  const [currentTime, setCurrentTime] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-purple-100 px-6 py-[17px] flex flex-wrap items-center justify-between gap-4">
      {/* Left: Location & System Live Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-purple-100/60 text-sm shadow-sm font-medium">
          <MapPin className="w-5 h-5 text-purple-600" />
          <span className="text-black">{CITY_METADATA.name}</span>
          <span className="text-slate-300">|</span>
          <span className="text-black font-medium">{CITY_METADATA.region}</span>
        </div>

        {/* Telemetry Chips */}
        <div className="hidden lg:flex items-center gap-3 text-sm text-black">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-purple-100/60 shadow-sm font-medium">
            <Clock className="w-4.5 h-4.5 text-purple-600" />
            <span className="text-black">{currentTime || '07:05:22 AM'}</span>
          </div>
        </div>
      </div>

      {/* Right: Exit button only */}
      <div className="flex items-center gap-3">
        <button
          onClick={logoutUser}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 border border-red-200/60 text-sm font-medium text-red-600 transition-colors shadow-sm cursor-pointer"
          title="Log Out"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
