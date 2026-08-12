import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  GitMerge,
  BrainCircuit,
  FileCheck2,
  History,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const { activePage, setActivePage, currentUser, departmentTasks, setIsAiDrawerOpen } = useCity();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDeptRole = currentUser && currentUser.role === 'department';
  const deptName = currentUser?.deptName || 'Department';

  const myDeptTasks = isDeptRole 
    ? departmentTasks.filter(t => t.departmentId === currentUser.departmentId && t.status !== 'Completed')
    : departmentTasks.filter(t => t.status !== 'Completed');

  // Counselors see all pages. Department Officials see department-tailored pages.
  const counselorNavItems = [
    { id: 'command-center', label: 'Command Center', shortLabel: 'Command', icon: LayoutDashboard },
    { id: 'city-intelligence', label: 'City Intelligence', shortLabel: 'City Data', icon: Building2 },
    { id: 'incident-intelligence', label: 'Incident Intelligence', shortLabel: 'Incidents', icon: AlertTriangle },
    { id: 'agent-council', label: 'Agent Council', shortLabel: 'Agents', icon: GitMerge },
    { id: 'response-plans', label: 'Response Plans', shortLabel: 'Plans', icon: FileCheck2 },
    { id: 'department-dashboard', label: 'Dept Dashboards', shortLabel: 'Work Orders', icon: Layers },
    { id: 'city-memory', label: 'City Memory', shortLabel: 'Memory', icon: History }
  ];

  const departmentNavItems = [
    { id: 'department-dashboard', label: 'Dept Command Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'department-dashboard-tasks', label: 'Assigned Work Orders', shortLabel: 'Work Orders', icon: FileText },
    { id: 'department-dashboard-telemetry', label: 'Sensors & Telemetry', shortLabel: 'Telemetry', icon: Activity },
    { id: 'department-dashboard-protocols', label: 'Emergency Protocols', shortLabel: 'Protocols', icon: Sparkles },
    { id: 'city-intelligence', label: 'City-Wide Feed', shortLabel: 'City Feed', icon: Building2 }
  ];

  const navItems = isDeptRole ? departmentNavItems : counselorNavItems;

  return (
    <aside
      className={`relative z-30 h-screen bg-white border-r border-purple-100 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Top Header */}
      <div>
        <div className="p-4 border-b border-purple-100 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 shrink-0 shadow-sm">
              <Cpu className="w-6 h-6" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-slate-800 text-base leading-tight">
                  CivicMind <span className="text-purple-600">AI</span>
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-500 truncate max-w-[130px]" title={isDeptRole ? deptName : "Zone Counselor Console"}>
                  {isDeptRole ? deptName.split(' ')[0] + ' Terminal' : 'Zone Counselor'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-purple-50/50 hover:bg-purple-100/50 text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Mode Indicator Strip */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-purple-50/30 border-b border-purple-100/50 flex items-center justify-between text-xs font-mono text-purple-700">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>{isDeptRole ? `${currentUser.deptName.split(' ')[0]} Official` : 'Zone Counselor'}</span>
            </span>
            <span className="text-slate-400 font-bold">v2.4</span>
          </div>
        )}

        {/* Navigation Item List */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Map sub-tabs of department dashboard to department-dashboard
            const isBaseDeptPage = item.id.startsWith('department-dashboard');
            const isActive = activePage === item.id || (isBaseDeptPage && activePage === 'department-dashboard');

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id.startsWith('department-dashboard')) {
                    setActivePage('department-dashboard');
                  } else {
                    setActivePage(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 border border-purple-200/60 shadow-sm'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/30 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-500'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                      item.id.includes('tasks') || item.id === 'department-dashboard'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-purple-100 text-purple-700 border border-purple-200/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Dot */}
                {isCollapsed && isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-600 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-purple-100 bg-purple-50/10 flex flex-col gap-2">
        {!isCollapsed ? (
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer shadow-md shadow-purple-600/10 group"
          >
            <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>Ask AI Agent (Chat Bot)</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer group"
            title="Ask AI Agent (Chat Bot)"
          >
            <Sparkles className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </aside>
  );
}
