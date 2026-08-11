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
  BarChart3,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Server,
  UserCheck,
  Bot,
  Layers,
  FileText,
  Activity,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { activePage, setActivePage, currentUser, departmentTasks } = useCity();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDeptRole = currentUser && currentUser.role === 'department';
  const deptName = currentUser?.deptName || 'Department';

  const myDeptTasks = isDeptRole 
    ? departmentTasks.filter(t => t.departmentId === currentUser.departmentId && t.status !== 'Completed')
    : departmentTasks.filter(t => t.status !== 'Completed');

  // Counselors see all 9 pages. Department Officials see department-tailored pages.
  const counselorNavItems = [
    { id: 'command-center', label: '1. Command Center', shortLabel: 'Command', icon: LayoutDashboard },
    { id: 'city-intelligence', label: '2. City Intelligence', shortLabel: 'City Data', icon: Building2 },
    { id: 'incident-intelligence', label: '3. Incident Intelligence', shortLabel: 'Incidents', icon: AlertTriangle, badge: '7 Active' },
    { id: 'agent-council', label: '4. Agent Council', shortLabel: 'Agents', icon: GitMerge, badge: '7 Online' },
    { id: 'causal-intelligence', label: '5. Causal Intelligence', shortLabel: 'Causal Graph', icon: BrainCircuit },
    { id: 'response-plans', label: '6. Response Plans', shortLabel: 'Plans', icon: FileCheck2, badge: 'Editable' },
    { id: 'department-dashboard', label: '7. Dept Dashboards', shortLabel: 'Work Orders', icon: Layers, badge: `${myDeptTasks.length} Tasks` },
    { id: 'city-memory', label: '8. City Memory', shortLabel: 'Memory', icon: History },
    { id: 'analytics', label: '9. Analytics', shortLabel: 'Analytics', icon: BarChart3 }
  ];

  const departmentNavItems = [
    { id: 'department-dashboard', label: '1. Dept Command Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'department-dashboard-tasks', label: '2. Assigned Work Orders', shortLabel: 'Work Orders', icon: FileText, badge: `${myDeptTasks.length} Active` },
    { id: 'department-dashboard-telemetry', label: '3. Sensors & Telemetry', shortLabel: 'Telemetry', icon: Activity },
    { id: 'causal-intelligence', label: '4. City Causal Impact', shortLabel: 'Causal Graph', icon: BrainCircuit },
    { id: 'department-dashboard-protocols', label: '5. Emergency Protocols', shortLabel: 'Protocols', icon: Sparkles },
    { id: 'city-intelligence', label: '6. City-Wide Feed', shortLabel: 'City Feed', icon: Building2 }
  ];

  const navItems = isDeptRole ? departmentNavItems : counselorNavItems;

  return (
    <aside
      className={`relative z-30 h-screen bg-[#090e1a] border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Top Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0 shadow-md">
              <Cpu className="w-6 h-6" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-base leading-tight">
                  CIVICMIND <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] font-mono font-medium text-slate-400 tracking-wider uppercase truncate max-w-[130px]" title={isDeptRole ? deptName : "Zone Counselor Console"}>
                  {isDeptRole ? deptName.split(' ')[0] + ' Terminal' : 'Zone Counselor'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Mode Indicator Strip */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono text-cyan-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>{isDeptRole ? `${currentUser.deptName.split(' ')[0]} Official` : 'ZONE COUNSELOR'}</span>
            </span>
            <span className="text-slate-500">v2.4</span>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-cyan-500/40 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                      item.id.includes('tasks') || item.id === 'department-dashboard'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Active Indicator Dot */}
                {isCollapsed && isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400 rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Server className="w-4 h-4 text-emerald-400" title="All Systems Operational" />
            <Bot className="w-4 h-4 text-purple-400" title="7 Agents Active" />
            <UserCheck className="w-4 h-4 text-cyan-400" title={currentUser?.name || "Zone Counselor"} />
          </div>
        ) : (
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                System Status
              </span>
              <span className="text-emerald-400 font-semibold">Operational</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                AI Consensus
              </span>
              <span className="text-purple-300 font-semibold">95% Sync</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-300">
              <span className="text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Logged User
              </span>
              <span className="text-cyan-300 font-semibold truncate max-w-[100px]" title={currentUser?.name}>
                {currentUser?.name?.split(' ')[0] || 'Counselor'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
