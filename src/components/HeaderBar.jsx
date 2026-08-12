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
  Sparkles,
  UserCheck,
  LogOut,
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
    setIsResponsibleAiModalOpen,
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
    <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 h-14 flex items-center justify-between gap-3">
      {/* Left: Location & System Live Status */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-white border border-purple-100/60 text-xs font-mono shadow-sm" title={`${CITY_METADATA.name}, ${CITY_METADATA.region}`}>
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-slate-800">{CITY_METADATA.name.split(' ')[0]}</span>
        </div>

        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-purple-50 border border-purple-200/60 text-xs font-mono font-bold text-purple-700 shadow-sm shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span>● Live Intelligence</span>
        </div>

        {/* Telemetry Chips */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-slate-600">
          <div className="flex items-center gap-1.5 bg-white px-2.5 h-9 rounded-md border border-purple-100/60 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-800 font-semibold">{currentTime || '07:05:22 PM'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 h-9 rounded-md border border-purple-100/60 shadow-sm" title="Weather Telemetry">
            <CloudRain className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-slate-800 font-semibold">
              {CITY_METADATA.weather.rainfall} • {CITY_METADATA.weather.temp}
            </span>
          </div>
        </div>
      </div>

      {/* Right: User Role Badge + AI Quick Command + Simulation Action + Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* CURRENT USER ROLE BADGE & SWITCH DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white hover:bg-purple-50/50 border border-purple-200/60 text-xs font-mono text-purple-700 cursor-pointer shadow-sm font-semibold"
          >
            <UserCheck className="w-4 h-4 text-purple-600" />
            <span>{currentUser?.name || 'Zone Counselor'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Quick Role Switcher Dropdown */}
          {showRoleMenu && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-purple-200/80 rounded-xl p-2 shadow-2xl z-50 space-y-1 font-mono text-xs animate-in fade-in slide-in-from-top-2 text-slate-800">
              <div className="px-2 py-1.5 border-b border-purple-100 text-[10px] text-slate-500 font-bold">
                Switch Active User Account
              </div>

              {USER_ROLES.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    loginUser(u);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    currentUser?.id === u.id
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200/60'
                      : 'hover:bg-purple-50/30 text-slate-700'
                  }`}
                >
                  <span className="truncate">{u.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                    {u.role === 'counselor' ? 'Counselor' : u.deptName?.split(' ')[0]}
                  </span>
                </button>
              ))}

              <div className="pt-1 border-t border-purple-100">
                <button
                  onClick={() => {
                    logoutUser();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out to Access Portal</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick AI Command Prompt Trigger */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex items-center gap-2 px-3 h-9 rounded-xl bg-white hover:bg-purple-50/50 border border-purple-200/60 text-xs font-semibold text-slate-700 hover:text-purple-700 transition-all cursor-pointer group shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-mono">Ask AI...</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200/40 text-[10px] font-mono">
            Ctrl+K
          </span>
        </button>

      </div>
    </header>
  );
}
