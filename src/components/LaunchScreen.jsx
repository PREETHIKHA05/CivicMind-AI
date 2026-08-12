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
  ArrowRight
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-slate-900 font-sans overflow-y-auto p-4 sm:p-6">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f00a_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f00a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full mx-auto my-auto p-6 md:p-8 bg-[#1e3a5f] rounded-2xl border border-purple-500/30 shadow-2xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 pb-6 border-b border-purple-400/20">
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Chennai Metropolitan Authority</span>
            </div>
          </div>
        </div>

        {/* Hero Branding */}
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-xl bg-purple-900/40 border border-purple-500/50 text-purple-400">
            <Cpu className="w-7 h-7" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            CIVICMIND <span className="text-purple-400">AI</span>
          </h1>

          <p className="mt-1 text-xs md:text-sm font-mono text-slate-400">
            Agentic Decision Intelligence & Multi-Department Smart City Authorization Portal
          </p>
        </div>

        {/* ROLE SELECTION CARDS */}
        <div className="my-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            {/* Role Card 1: Zone Counselor */}
            <button
              onClick={() => setSelectedRoleType('counselor')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedRoleType === 'counselor'
                  ? 'bg-white/10 border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                  : 'bg-white/5 hover:bg-white/8 border-white/20 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'counselor' ? 'bg-purple-900/40 border-purple-500/40 text-purple-400' : 'bg-white/10 border-white/20 text-slate-600'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs font-mono">ZONE COUNSELOR</span>
                  <span className="px-2 py-0.5 rounded bg-white/20 text-slate-700 text-[10px] font-mono border border-white/30">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-mono leading-relaxed">
                  Full oversight, plan customization, dynamic risk modeling, and multi-department approval.
                </p>
              </div>
            </button>

            {/* Role Card 2: Department Official */}
            <button
              onClick={() => setSelectedRoleType('department')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedRoleType === 'department'
                  ? 'bg-white/10 border-purple-500/80 shadow-md ring-1 ring-purple-500/30'
                  : 'bg-white/5 hover:bg-white/8 border-white/20 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'department' ? 'bg-purple-900/40 border-purple-500/40 text-purple-400' : 'bg-white/10 border-white/20 text-slate-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs font-mono">DEPARTMENT OFFICIAL</span>
                  <span className="px-2 py-0.5 rounded bg-white/20 text-slate-700 text-[10px] font-mono border border-white/30">
                    Official Terminal
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-mono leading-relaxed">
                  Access specialized department dashboard, execute assigned work orders, and post field updates.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* AUTHENTICATION FORM CONTAINER */}
        <div className="p-5 rounded-xl bg-white/5 border border-purple-400/30 max-w-xl mx-auto space-y-4">
          {selectedRoleType === 'counselor' ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-purple-400/20">
                <span className="text-slate-100 font-bold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  Zone Counselor Command Login
                </span>
              </div>

              <button
                onClick={handleCounselorLogin}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <span>LOG IN AS ZONE COUNSELOR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-purple-400/20">
                <span className="text-slate-100 font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Select Department Terminal
                </span>
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
                          ? 'bg-white/10 border-purple-500 text-slate-100 font-bold'
                          : 'bg-white/5 hover:bg-white/8 border-white/20 text-slate-600'
                      }`}
                    >
                      <div className={`p-1.5 rounded bg-white/10 border border-white/20 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs">{dept.name}</span>
                        <span className="text-[10px] text-slate-600 block truncate">{userObj?.name || dept.official}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleDeptOfficialLogin}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <DeptIcon className="w-4 h-4 text-white" />
                <span>LOG IN TO {currentDeptUser.deptName.toUpperCase()} TERMINAL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
