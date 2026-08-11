import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { USER_ROLES, DEPARTMENTS } from '../data/mockData';
import {
  ShieldCheck,
  Cpu,
  Building2,
  UserCheck,
  Droplets,
  Car,
  Ambulance,
  Radio,
  HeartPulse,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Server
} from 'lucide-react';

export default function LaunchScreen() {
  const { loginUser } = useCity();

  // Role Type Selection: 'counselor' | 'department'
  const [selectedRoleType, setSelectedRoleType] = useState('counselor');

  // Selected Department ID for official login
  const [selectedDeptId, setSelectedDeptId] = useState('water');

  const iconMap = {
    ShieldCheck,
    Droplets,
    Car,
    Ambulance,
    Radio,
    HeartPulse
  };

  const handleCounselorLogin = () => {
    const counselorUser = USER_ROLES.find(u => u.role === 'counselor') || USER_ROLES[0];
    loginUser(counselorUser);
  };

  const handleDeptOfficialLogin = () => {
    const deptUser = USER_ROLES.find(u => u.departmentId === selectedDeptId) || USER_ROLES[1];
    loginUser(deptUser);
  };

  const currentDeptUser = USER_ROLES.find(u => u.departmentId === selectedDeptId) || USER_ROLES[1];
  const DeptIcon = iconMap[currentDeptUser.avatar] || Building2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060911] text-slate-100 font-sans overflow-y-auto p-4 sm:p-6">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full mx-auto my-auto p-6 md:p-8 bg-[#0b101d] rounded-2xl border border-slate-800 shadow-2xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              <Building2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase block">
                INTEGRATED CITY COMMAND & CONTROL (ICCC)
              </span>
              <span className="text-sm font-semibold text-white">Chennai Metropolitan Authority</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Server className="w-3.5 h-3.5" />
            <span>SYSTEM ONLINE • v2.4</span>
          </div>
        </div>

        {/* Hero Branding */}
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
            <Cpu className="w-7 h-7" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            CIVICMIND <span className="text-cyan-400">AI</span>
          </h1>

          <p className="mt-1 text-xs md:text-sm font-mono text-slate-400">
            Agentic Decision Intelligence & Multi-Department Smart City Authorization Portal
          </p>
        </div>

        {/* ROLE SELECTION CARDS */}
        <div className="my-4">
          <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block text-center mb-3">
            AUTHENTICATION ROLE SELECTION
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {/* Role Card 1: Zone Counselor */}
            <button
              onClick={() => setSelectedRoleType('counselor')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedRoleType === 'counselor'
                  ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'counselor' ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-mono">ZONE COUNSELOR</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Full ICCC oversight, plan customization, dynamic risk modeling, and multi-department approval.
                </p>
              </div>
            </button>

            {/* Role Card 2: Department Official */}
            <button
              onClick={() => setSelectedRoleType('department')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedRoleType === 'department'
                  ? 'bg-slate-900 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'department' ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-mono">DEPARTMENT OFFICIAL</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                    Official Terminal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                  Access specialized department dashboard, execute assigned work orders, and post field updates.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* AUTHENTICATION FORM CONTAINER */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 max-w-xl mx-auto space-y-4">
          {selectedRoleType === 'counselor' ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  Zone Counselor Command Login
                </span>
                <span className="text-[10px] text-slate-500">Ward 18 Admin Portal</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Official Email / Government ID
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      readOnly
                      value="counselor.ward18@chennai.gov.in"
                      className="bg-transparent text-xs w-full text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Security Token
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      readOnly
                      value="••••••••••••"
                      className="bg-transparent text-xs w-full text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCounselorLogin}
                className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <span>LOG IN AS ZONE COUNSELOR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Select Department Terminal
                </span>
                <span className="text-[10px] text-slate-500">Official Operational Portal</span>
              </div>

              {/* Department Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  const userObj = USER_ROLES.find(u => u.departmentId === dept.id);
                  const Icon = iconMap[dept.icon] || Building2;

                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-500 text-white font-bold'
                          : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className={`p-1.5 rounded bg-slate-950 border border-slate-800 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs">{dept.name}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{userObj?.name || dept.official}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center justify-between">
                <span className="text-slate-400">Selected Official:</span>
                <strong className="text-cyan-300">{currentDeptUser.name} ({currentDeptUser.deptName})</strong>
              </div>

              <button
                onClick={handleDeptOfficialLogin}
                className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <DeptIcon className="w-4 h-4 text-cyan-200" />
                <span>LOG IN TO {currentDeptUser.deptName.toUpperCase()} TERMINAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Security Footer Notice */}
        <div className="p-2.5 mt-5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-center gap-2 text-slate-400 text-[11px] font-mono text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Human-In-The-Loop Governance Protocol Active. All AI actions require human authorization.
          </span>
        </div>
      </div>
    </div>
  );
}
