import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { DEPARTMENTS, CAUSAL_GRAPH_NODES } from '../data/mockData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import {
  Droplets,
  Car,
  Ambulance,
  Radio,
  HeartPulse,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  User,
  ShieldCheck,
  Activity,
  FileText,
  Building2,
  Layers,
  Sparkles,
  BarChart3,
  BrainCircuit,
  PlusCircle,
  TrendingDown,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export default function DepartmentDashboard() {
  const {
    currentUser,
    selectedDeptId,
    setSelectedDeptId,
    departmentTasks,
    updateTaskStatus,
    addTaskLog,
    planStatus,
    currentRiskScore
  } = useCity();

  // If logged in as a department official, default to their department
  const isDeptOfficial = currentUser && currentUser.role === 'department';
  const activeDeptId = (isDeptOfficial && currentUser.departmentId)
    ? currentUser.departmentId
    : selectedDeptId;

  const currentDept = DEPARTMENTS.find(d => d.id === activeDeptId) || DEPARTMENTS[0];

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'analytics' | 'protocols'
  const [logInputMap, setLogInputMap] = useState({});

  const iconMap = {
    Droplets,
    Car,
    Ambulance,
    Radio,
    HeartPulse
  };

  const DeptIcon = iconMap[currentDept.icon] || Building2;

  // Filter tasks for this department
  const assignedTasks = departmentTasks.filter(t => t.departmentId === activeDeptId);

  const handleAddLog = (taskId) => {
    const text = logInputMap[taskId];
    if (text && text.trim()) {
      addTaskLog(taskId, text);
      setLogInputMap(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  // Telemetry Metrics per Department
  const deptTelemetry = {
    water: [
      { label: "Station 4B Mobile Pump #1", status: "OPERATIONAL", val: "450 m³/h", color: "emerald" },
      { label: "Station 4B Mobile Pump #2", status: "STANDBY", val: "Ready", color: "cyan" },
      { label: "Secondary Drain Water Level", status: "HIGH", val: "+32 cm", color: "amber" },
      { label: "Sluice Gate Outflow Efficiency", status: "CRITICAL", val: "28%", color: "red" }
    ],
    traffic: [
      { label: "Hospital Road Corridor Speed", status: "CONGESTED", val: "6 km/h", color: "red" },
      { label: "Route B EVR Periyar Speed", status: "CLEAR", val: "38 km/h", color: "emerald" },
      { label: "Adaptive Signal Green-Wave", status: "ACTIVE", val: "Sync 85%", color: "cyan" },
      { label: "Gate 1 Emergency Override", status: "LOCKED", val: "ACTIVE", color: "amber" }
    ],
    emergency: [
      { label: "Ambulance #108-B4 Route", status: "REROUTED", val: "Route B (11 mins)", color: "emerald" },
      { label: "City General Hospital ER Beds", status: "OPEN", val: "17 / 100 Free", color: "cyan" },
      { label: "Active 108 Fleet Units", status: "DISPATCHED", val: "12 Vehicles", color: "blue" },
      { label: "Corridor Access Risk Index", status: "MIGRATED", val: `${currentRiskScore}/100`, color: "amber" }
    ],
    public: [
      { label: "Ward 18 SMS Broadcast Reach", status: "DELIVERED", val: "14,200 Alerts", color: "emerald" },
      { label: "Citizen App Flood Reports", status: "VERIFIED", val: "38 Geo-Reports", color: "cyan" },
      { label: "Radio FM 102.8 Advisory", status: "BROADCASTING", val: "Every 5 mins", color: "purple" },
      { label: "Public Sentiment Index", status: "ELEVATED", val: "72% Urgent", color: "amber" }
    ],
    health: [
      { label: "Trauma Center ICU Preparedness", status: "READY", val: "Level 1 Standby", color: "emerald" },
      { label: "Emergency Mobile Medical Squads", status: "STATIONED", val: "2 Squads", color: "cyan" },
      { label: "Waterborne Disease Surveillance", status: "MONITORING", val: "0 Outbreaks", color: "blue" },
      { label: "Medical Emergency Supplies", status: "ADEQUATE", val: "94% Stocked", color: "emerald" }
    ]
  };

  // Department Tailored Recharts Data
  const deptAnalyticsData = {
    water: [
      { time: "06:00", pumpOutput: 120, drainCapacity: 75, waterLevel: 10 },
      { time: "06:15", pumpOutput: 180, drainCapacity: 58, waterLevel: 18 },
      { time: "06:30", pumpOutput: 250, drainCapacity: 42, waterLevel: 25 },
      { time: "06:45", pumpOutput: 310, drainCapacity: 31, waterLevel: 30 },
      { time: "07:00", pumpOutput: 380, drainCapacity: 28, waterLevel: 32 },
      { time: "07:15 (Simulated)", pumpOutput: 650, drainCapacity: 72, waterLevel: 14 }
    ],
    traffic: [
      { time: "06:00", speed: 42, delayMins: 4, queueKm: 0.3 },
      { time: "06:15", speed: 30, delayMins: 8, queueKm: 0.7 },
      { time: "06:30", speed: 18, delayMins: 14, queueKm: 1.2 },
      { time: "06:45", speed: 10, delayMins: 19, queueKm: 1.6 },
      { time: "07:00", speed: 6, delayMins: 24, queueKm: 1.8 },
      { time: "07:15 (Simulated)", speed: 38, delayMins: 5, queueKm: 0.4 }
    ],
    emergency: [
      { time: "06:00", transitMins: 12, erBeds: 28, unitsActive: 6 },
      { time: "06:15", transitMins: 18, erBeds: 24, unitsActive: 8 },
      { time: "06:30", transitMins: 24, erBeds: 20, unitsActive: 10 },
      { time: "06:45", transitMins: 28, erBeds: 18, unitsActive: 12 },
      { time: "07:00", transitMins: 32, erBeds: 17, unitsActive: 12 },
      { time: "07:15 (Simulated)", transitMins: 11, erBeds: 22, unitsActive: 12 }
    ],
    public: [
      { time: "06:00", smsDelivered: 1200, reportsCount: 4 },
      { time: "06:15", smsDelivered: 4500, reportsCount: 12 },
      { time: "06:30", smsDelivered: 8900, reportsCount: 22 },
      { time: "06:45", smsDelivered: 12400, reportsCount: 31 },
      { time: "07:00", smsDelivered: 14200, reportsCount: 38 },
      { time: "07:15 (Simulated)", smsDelivered: 18500, reportsCount: 15 }
    ],
    health: [
      { time: "06:00", icuReadiness: 98, ERWait: 8 },
      { time: "06:15", icuReadiness: 95, ERWait: 12 },
      { time: "06:30", icuReadiness: 91, ERWait: 18 },
      { time: "06:45", icuReadiness: 88, ERWait: 22 },
      { time: "07:00", icuReadiness: 83, ERWait: 26 },
      { time: "07:15 (Simulated)", icuReadiness: 96, ERWait: 10 }
    ]
  };

  const telemetryItems = deptTelemetry[activeDeptId] || deptTelemetry.water;
  const chartData = deptAnalyticsData[activeDeptId] || deptAnalyticsData.water;

  // Filter Causal Graph nodes relevant to this department
  const deptCausalNodes = CAUSAL_GRAPH_NODES.filter(n =>
    n.category === activeDeptId || n.category === 'critical' || n.category === 'weather'
  );

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 shrink-0">
              <DeptIcon className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300 text-[10px] font-mono font-bold uppercase">
                  {currentDept.name.toUpperCase()} TERMINAL
                </span>
                <span className="text-xs font-mono text-slate-600">Department Operational Console</span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                {currentDept.name} Dashboard
              </h1>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 mt-0.5">
                <span className="text-slate-700">Official: <strong>{currentDept.official}</strong></span>
                <span>•</span>
                <span>{currentDept.email}</span>
              </div>
            </div>
          </div>

          {/* Department Switcher Dropdown (If counselor or inspecting) */}
          {!isDeptOfficial && (
            <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl border border-purple-200 shrink-0 font-mono text-xs">
              <Layers className="w-4 h-4 text-purple-600" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-600 uppercase">View Department</span>
                <select
                  value={activeDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="bg-white border border-purple-200 text-slate-900 rounded px-2 py-1 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Plan & Work Order Summary Strip */}
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              ICCC Plan Status: <strong className="text-purple-700">{planStatus}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Assigned Tasks: <strong className="text-slate-900">{assignedTasks.length} Active</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-white text-emerald-700 border border-emerald-200 font-bold">
              Target Risk: {currentRiskScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-purple-200 pb-2 font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'overview'
              ? 'bg-white text-slate-900 border border-purple-300/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>DEPARTMENT OVERVIEW</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'tasks'
              ? 'bg-white text-slate-900 border border-purple-300/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
            }`}
        >
          <FileText className="w-4 h-4" />
          <span>ASSIGNED WORK ORDERS ({assignedTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'analytics'
              ? 'bg-white text-slate-900 border border-purple-300/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
            }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>TELEMETRY & DATA ANALYTICS</span>
        </button>

        <button
          onClick={() => setActiveTab('protocols')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'protocols'
              ? 'bg-white text-slate-900 border border-purple-300/40 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
            }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>EMERGENCY PROTOCOLS</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (Main Dept Dashboard) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {telemetryItems.map((item, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-purple-200 space-y-2">
                <span className="text-[11px] font-mono text-slate-600 font-medium block">
                  {item.label}
                </span>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {item.val}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${item.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : item.color === 'red'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : item.color === 'amber'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-purple-100 text-purple-700 border border-purple-300/40'
                      }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Middle Layout: Assigned Work Orders Summary + Dept Recharts Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Work Orders Card */}
            <div className="glass-panel p-5 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                    Dispatched Work Orders ({assignedTasks.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-mono text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {assignedTasks.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                  <Clock className="w-8 h-8 text-purple-600/60 mx-auto" />
                  <p className="text-xs font-mono font-bold text-slate-700">
                    Awaiting Plan Approval & Task Dispatch
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 max-w-xs mx-auto">
                    No work orders assigned to {currentDept.name} yet. Tasks will automatically populate here when the Zone Counselor approves the Coordinated Response Plan.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedTasks.map((task) => (
                    <div key={task.id} className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{task.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">{task.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Real-Time Trend Analytics Chart */}
            <div className="glass-panel p-5 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-extrabold text-slate-900 font-mono uppercase">
                    Department Real-Time Telemetry Trend
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-600">Live Sensor Sync</span>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="deptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey={activeDeptId === 'traffic' ? 'speed' : activeDeptId === 'water' ? 'pumpOutput' : activeDeptId === 'emergency' ? 'transitMins' : 'smsDelivered'} stroke="#06b6d4" fillOpacity={1} fill="url(#deptGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Causal Node Network Summary */}
          <div className="glass-panel p-5 rounded-2xl border border-purple-200 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-purple-600 pb-2 border-b border-purple-200 font-bold uppercase">
              <BrainCircuit className="w-4 h-4" />
              <span>Causal Factors Impacting {currentDept.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deptCausalNodes.map(node => (
                <div key={node.id} className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>{node.label}</span>
                    <span className="text-purple-600">{node.val}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED WORK ORDERS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6 font-mono text-xs">
          {assignedTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-purple-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 font-mono">No Active Work Orders Assigned</h3>
              <p className="text-xs text-slate-600 font-mono max-w-md mx-auto">
                When the Zone Counselor approves a Coordinated Response Plan, task orders for this department will automatically appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4 hover:border-purple-300/40 transition-colors shadow-lg"
                >
                  {/* Task Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${task.priority === 'CRITICAL'
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-amber-100 text-amber-700 border border-amber-300'
                            }`}
                        >
                          {task.priority} PRIORITY
                        </span>
                        <span className="text-xs font-mono text-slate-600">
                          Assigned by: <strong>{task.assignedBy}</strong> ({task.assignedTime})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {task.title}
                      </h3>
                    </div>

                    {/* Task Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-500/50'
                            : task.status === 'In Progress'
                              ? 'bg-purple-100 text-purple-700 border border-purple-300/50 animate-pulse'
                              : 'bg-white text-slate-700 border border-purple-200'
                          }`}
                      >
                        ● {task.status}
                      </span>

                      {task.status !== 'Completed' && (
                        <div className="flex items-center gap-2">
                          {task.status === 'Assigned' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'In Progress')}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-mono text-xs font-bold cursor-pointer transition-colors shadow-sm"
                            >
                              START EXECUTION
                            </button>
                          )}
                          <button
                            onClick={() => updateTaskStatus(task.id, 'Completed')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-mono text-xs font-bold cursor-pointer transition-colors shadow-sm"
                          >
                            MARK COMPLETED
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                      <span className="text-[10px] text-purple-600 font-bold block uppercase mb-1">
                        RECOMMENDED ACTION INSTRUCTION
                      </span>
                      <p className="text-slate-200 leading-relaxed font-semibold">
                        {task.recommendation}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-100/30 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 font-bold block uppercase mb-1">
                        EXPECTED CASCADING IMPACT
                      </span>
                      <p className="text-emerald-200 leading-relaxed font-semibold">
                        {task.expectedImpact}
                      </p>
                    </div>
                  </div>

                  {/* Field Progress Logs */}
                  <div className="pt-2 space-y-3">
                    <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider block">
                      FIELD OPERATIONAL LOGS ({task.logs.length})
                    </span>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {task.logs.map((log, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-200/80 text-xs font-mono flex items-start justify-between gap-3">
                          <div>
                            <span className="text-purple-600 font-semibold">{log.author}:</span>{' '}
                            <span className="text-slate-700">{log.note}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0">{log.time}</span>
                        </div>
                      ))}
                    </div>

                    {/* Form to log note */}
                    {task.status !== 'Completed' && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={logInputMap[task.id] || ''}
                          onChange={(e) => setLogInputMap({ ...logInputMap, [task.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddLog(task.id)}
                          placeholder="Log progress note (e.g. Mobile Pump connected at Station 4B)..."
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-purple-300/60"
                        />
                        <button
                          onClick={() => handleAddLog(task.id)}
                          className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-cyan-900 border border-purple-300/40 text-purple-700 font-mono text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Log Note</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TELEMETRY & DATA ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4">
            <h3 className="text-sm font-bold text-purple-600 uppercase">
              {currentDept.name} Historical & Real-Time Sensor Telemetry
            </h3>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fullGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Area type="monotone" dataKey={activeDeptId === 'traffic' ? 'speed' : activeDeptId === 'water' ? 'pumpOutput' : 'transitMins'} stroke="#06b6d4" fillOpacity={1} fill="url(#fullGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMERGENCY PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="glass-panel p-6 rounded-2xl border border-purple-200 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-purple-600 uppercase">
            DIRECT DEPARTMENT EMERGENCY PROTOCOLS
          </h3>
          <p className="text-slate-600">
            Emergency department-level commands synchronized with CivicMind AI Multi-Agent Engine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <button className="p-4 rounded-xl bg-purple-50/90 hover:bg-white border border-purple-200 text-left transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-purple-700">
                <span>Deploy Mobile Resource Unit</span>
                <PlusCircle className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-[11px] text-slate-600">
                Dispatches high-capacity field equipment or emergency squad directly to Ward 18.
              </p>
            </button>

            <button className="p-4 rounded-xl bg-purple-50/90 hover:bg-white border border-purple-200 text-left transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-700">
                <span>Signal / Gate Manual Override</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-600">
                Overrides default sensor rules for immediate priority routing or sluice gate lock.
              </p>
            </button>

            <button className="p-4 rounded-xl bg-purple-50/90 hover:bg-white border border-purple-200 text-left transition-all cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                <span>Sync with Planner Agent</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-600">
                Triggers re-evaluation of departmental recommendations based on live field telemetry.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

