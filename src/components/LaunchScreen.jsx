import React, { useState } from 'react';
import { useCity } from '../context/CityContext';
import { USER_ROLES } from '../data/mockData';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  LogIn,
  Sun,
  TrendingUp,
  Monitor
} from 'lucide-react';

export default function LaunchScreen() {
  const { loginUser } = useCity();

  // Role Selection: 'counselor' | 'department'
  const [selectedRoleType, setSelectedRoleType] = useState('counselor');

  // Selected Department Name for official login (Traffic, Water, Sanitation, Power, Health)
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Departments list matching request & mock data
  const deptList = [
    { name: 'Traffic', id: 'traffic' },
    { name: 'Water', id: 'water' },
    { name: 'Sanitation', id: 'sanitation' },
    { name: 'Power', id: 'power' },
    { name: 'Health', id: 'health' }
  ];

  const handleLogin = (e) => {
    e?.preventDefault();
    if (selectedRoleType === 'counselor') {
      const counselorUser = USER_ROLES.find(u => u.role === 'counselor') || USER_ROLES[0];
      loginUser(counselorUser);
    } else {
      const foundDept = deptList.find(d => d.name === selectedDeptName);
      const deptId = foundDept ? foundDept.id : 'water';
      const deptUser = USER_ROLES.find(u => u.departmentId === deptId) || USER_ROLES[1];
      loginUser(deptUser);
    }
  };

  const getLoginButtonText = () => {
    if (selectedRoleType === 'counselor') {
      return 'Log in as Zone Counselor';
    }
    return selectedDeptName ? `Log in as ${selectedDeptName} Official` : 'Log in as Department Official';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row w-screen h-screen overflow-hidden bg-[#1E074B] text-white font-sans select-none">

      {/* LEFT PANEL */}
      <div className="relative flex-1 bg-white text-slate-900 flex flex-col items-center justify-between p-8 md:p-12 overflow-hidden text-center">
        
        {/* Static Grid Layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.12) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Animated Drifting Grid */}
        <div 
          className="absolute -inset-12 pointer-events-none opacity-30 z-0 animate-[gridDrift_8s_linear_infinite]"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none z-0" />

        {/* TOP: Authority Badge */}
        <div className="relative z-10 inline-flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/30 rounded-md flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-wide">
            Chennai Metropolitan Authority
          </span>
        </div>

        {/* MIDDLE: Hero Branding */}
        <div className="relative z-10 flex flex-col items-center my-auto py-6">
          <div className="w-12 h-1 bg-purple-600 rounded-full mb-6 opacity-80" />
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-none">
            CIVICMIND <span className="text-purple-600">AI</span>
          </h1>
          <p className="mt-5 text-base md:text-lg font-medium text-gray-900 max-w-md leading-relaxed">
            Agentic Decision Intelligence & Multi-Department Smart City Authorization Portal
          </p>

          {/* Stats Strip */}
          <div className="flex items-center justify-center gap-2.5 mt-7 flex-wrap">
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200/60 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <strong className="font-extrabold text-gray-900">12</strong> Wards
            </div>
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200/60 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <strong className="font-extrabold text-gray-900">5</strong> Departments
            </div>
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200/60 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <strong className="font-extrabold text-gray-900">4,200+</strong> Incidents Resolved
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-col gap-3 mt-8 w-full max-w-sm text-left">
            <div className="flex items-center gap-3.5 p-3 bg-purple-50/80 border border-purple-200/50 rounded-xl hover:bg-purple-100/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300/50 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">Real-time Incident Routing</span>
                <span className="text-[11px] text-gray-600">AI dispatches field teams across all zones instantly</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 bg-purple-50/80 border border-purple-200/50 rounded-xl hover:bg-purple-100/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300/50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">AI-Powered Predictions</span>
                <span className="text-[11px] text-gray-600">Forecasts city-wide risk before incidents escalate</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 bg-purple-50/80 border border-purple-200/50 rounded-xl hover:bg-purple-100/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300/50 flex items-center justify-center shrink-0">
                <Monitor className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-900">Cross-Department Sync</span>
                <span className="text-[11px] text-gray-600">Unified command across Traffic, Water, Health & more</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* RIGHT PANEL */}
      <div className="relative flex-1 bg-[#1E074B] flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        
        {/* Right Panel Mild Purple Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.22) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* LOGIN CARD */}
        <div className="relative z-10 w-full max-w-md">
          
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
            Welcome back
          </h2>
          <p className="text-base text-white/90 mb-8 font-medium">
            Sign in to your authorized portal
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Role Toggle Pill Buttons */}
            <div className="grid grid-cols-2 p-1 bg-[#130820] border border-purple-500/30 rounded-full mb-6">
              <button
                type="button"
                onClick={() => { setSelectedRoleType('counselor'); setIsDeptDropdownOpen(false); }}
                className={`py-2.5 px-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedRoleType === 'counselor'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Zone Counselor
              </button>

              <button
                type="button"
                onClick={() => setSelectedRoleType('department')}
                className={`py-2.5 px-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedRoleType === 'department'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                Department Official
              </button>
            </div>

            {/* Department Dropdown (shown only when Department Official is selected) */}
            {selectedRoleType === 'department' && (
              <div className="relative space-y-1.5">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    className="w-full bg-[#1A0A2E] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white font-medium text-left flex items-center justify-between focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                  >
                    <span>{selectedDeptName || 'Select department…'}</span>
                    <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Options */}
                  {isDeptDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#130820] border border-purple-500/40 rounded-xl overflow-hidden shadow-2xl z-50">
                      {deptList.map((dept) => (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => {
                            setSelectedDeptName(dept.name);
                            setIsDeptDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer border-b border-white/5 last:border-none ${
                            selectedDeptName === dept.name
                              ? 'bg-purple-600/30 text-purple-300 font-bold'
                              : 'text-white/90 hover:bg-purple-600/20 hover:text-white'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${selectedDeptName === dept.name ? 'bg-purple-400' : 'bg-white/40'}`} />
                          {dept.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="official@cma.gov.in"
                  className="w-full bg-[#1A0A2E] border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/75 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1A0A2E] border border-white/20 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/75 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit / Login Button */}
            <button
              type="submit"
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <LogIn className="w-4 h-4" />
              <span>{getLoginButtonText()}</span>
            </button>

          </form>

        </div>
      </div>

    </div>
  );
}

