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
      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full animate-pulse opacity-20" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#000" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <style>{`
          @keyframes gridSlide {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          .animate-grid-slide {
            animation: gridSlide 6s linear infinite;
          }
        `}</style>
        <svg className="absolute inset-0 w-full h-full animate-grid-slide opacity-30" preserveAspectRatio="none">
          <defs>
            <pattern id="gridMove" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridMove)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-auto my-auto p-6 md:p-8 bg-white rounded-2xl border border-purple-500/30 shadow-xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 pb-6 border-b border-slate-300">
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 rounded-xl bg-slate-200 border border-slate-400 text-slate-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-semibold text-black">Chennai Metropolitan Authority</span>
            </div>
          </div>
        </div>

        {/* Hero Branding */}
        <div className="py-6 text-center">
          <div className="inline-flex items-center justify-center p-2.5 mb-3 rounded-xl bg-slate-200 border border-slate-400 text-slate-700">
            <Cpu className="w-7 h-7" />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-black">
            CIVICMIND <span className="text-purple-600">AI</span>
          </h1>

          <p className="mt-2 text-base md:text-lg font-medium text-slate-600">
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
                  ? 'bg-slate-100 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'counselor' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-slate-200 border-slate-400 text-slate-600'}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-sm">ZONE COUNSELOR</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs border border-slate-400">
                    Administrator
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Full oversight, plan customization, dynamic risk modeling, and multi-department approval.
                </p>
              </div>
            </button>

            {/* Role Card 2: Department Official */}
            <button
              onClick={() => setSelectedRoleType('department')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedRoleType === 'department'
                  ? 'bg-slate-100 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-lg border ${selectedRoleType === 'department' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-slate-200 border-slate-400 text-slate-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-sm">DEPARTMENT OFFICIAL</span>
                  <span className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs border border-slate-400">
                    Official Terminal
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Access specialized department dashboard, execute assigned work orders, and post field updates.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* AUTHENTICATION FORM CONTAINER */}
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-300 max-w-xl mx-auto space-y-4">
          {selectedRoleType === 'counselor' ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <span className="text-black font-bold text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  Zone Counselor Command Login
                </span>
              </div>

              <button
                onClick={handleCounselorLogin}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <span>LOG IN AS ZONE COUNSELOR</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <span className="text-black font-bold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Select Department Terminal
                </span>
              </div>

              {/* Department Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  const userObj = USER_ROLES.find(u => u.departmentId === dept.id);
                  const Icon = iconMap[dept.icon] || Building2;

                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDeptId(dept.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-black font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded bg-slate-200 border border-slate-400 shrink-0 ${isSelected ? 'text-purple-700' : 'text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-black">{dept.name}</span>
                        <span className="text-xs text-slate-600 block truncate">{userObj?.name || dept.official}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleDeptOfficialLogin}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <DeptIcon className="w-5 h-5 text-white" />
                <span>LOG IN TO {currentDeptUser.deptName.toUpperCase()} TERMINAL</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
