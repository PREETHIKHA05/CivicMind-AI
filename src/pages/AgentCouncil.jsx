import React, { useState, useRef, useCallback } from 'react';
import { useCity } from '../context/CityContext';
import {
  CloudRain, Waves, Car, Ambulance, MessageSquare,
  BrainCircuit, Cpu, Upload, X, AlertCircle, CheckCircle2,
  Sparkles, Clock, Shield, Users, Zap
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   CSS Keyframes injected once (no separate stylesheet needed)
───────────────────────────────────────────────────────────────────────────*/
const KEYFRAMES = `
  @keyframes planner-idle {
    0%,100% { opacity:.18; r:72; }
    50%      { opacity:.32; r:78; }
  }
  @keyframes planner-active {
    0%,100% { opacity:.45; r:76; }
    50%      { opacity:.85; r:88; }
  }
  @keyframes planner-done {
    0%,100% { opacity:.30; r:74; }
    50%      { opacity:.55; r:82; }
  }
  @keyframes agent-ping {
    0%   { r:58; opacity:.55; }
    70%  { r:72; opacity:0;   }
    100% { r:58; opacity:0;   }
  }
  @keyframes node-ready {
    0%,100% { opacity:.20; r:56; }
    50%     { opacity:.50; r:62; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────
   Bundled sample findings — no static-file route needed
───────────────────────────────────────────────────────────────────────────*/
const SAMPLE_FINDINGS = [
  {
    _sampleFilename: 'weather.json', agent: 'weather',
    conclusion: 'A quasi-stationary convective cell is pinned over Ward 18. Sustained intensity is 118 mm/hr — above the 90th-percentile threshold for this micro-watershed. No movement expected for the next 40 minutes.',
    signals: { rainfall_intensity_mm_hr: 118, cell_movement_km_hr: 2.1, estimated_duration_min: 40, accumulated_mm_so_far: 47 },
    evidenceIds: ['tool:weather:doppler_cell:001', 'tool:weather:imdd_alert:W18-2026-0812'],
    selfConfidence: 0.94,
    flags: ['cell_stationary_over_ward18', 'intensity_above_drain_design_spec']
  },
  {
    _sampleFilename: 'water.json', agent: 'water',
    conclusion: 'Ward 18 primary sump will overflow in approximately 22 minutes at current inflow. R7 outfall is submerged — back-pressure renders pumping alone insufficient. Canal North gate 4N requires manual actuation.',
    signals: { drain_capacity_mm_hr: 45, utilisation_pct: 96, minutes_to_overflow: 22, r7_outfall_depth_cm: 138, r7_design_max_cm: 120 },
    evidenceIds: ['tool:water:drain_capacity:001', 'tool:water:r7_outfall_sensor:014'],
    selfConfidence: 0.91,
    flags: ['route_R7_saturated', 'overflow_imminent_22min', 'manual_gate_4N_required']
  },
  {
    _sampleFilename: 'traffic.json', agent: 'traffic',
    conclusion: 'Hospital Road is at standstill (avg 4 km/hr). Recommended emergency diversion is via Route R7, which currently shows 18 km/hr flow. Signal override on junctions J14 and J17 is ready to activate.',
    signals: { hospital_road_speed_km_hr: 4, hospital_road_congestion_pct: 93, r7_current_speed_km_hr: 18, estimated_clearance_min_via_r7: 11 },
    evidenceIds: ['tool:traffic:loop_detector:J14', 'tool:traffic:cctv_flow:R7-N'],
    selfConfidence: 0.87,
    flags: ['hospital_road_gridlock', 'diversion_R7_proposed']
  },
  {
    _sampleFilename: 'emergency.json', agent: 'emergency',
    conclusion: 'Unit 108-B4 carrying a STEMI patient has been stationary for 9 minutes, 740 m from the Ward 18 ER. ETA is 31 minutes — exceeds the 90-minute window by a critical margin. Three units are blocked.',
    signals: { unit_b4_distance_to_er_m: 740, unit_b4_stationary_min: 9, hospital_road_eta_min: 31, stemi_window_remaining_min: 14, units_blocked_at_bottleneck: 3 },
    evidenceIds: ['tool:emergency:avl_unit_b4:001', 'tool:emergency:dispatch_log:108-2026-0812-0047'],
    selfConfidence: 0.97,
    flags: ['critical_cardiac_in_transit', 'stemi_window_breach_imminent', 'multiple_units_blocked']
  },
  {
    _sampleFilename: 'citizen.json', agent: 'citizen',
    conclusion: '41 geotagged civic reports confirm knee-to-waist-deep inundation along Hospital Road and the R7 junction. 6 callers reported vehicles stalling at the R7 on-ramp. Canal North appears passable.',
    signals: { geotagged_reports_count: 41, r7_onramp_stall_reports: 6, canal_north_reports: 0, average_sentiment_score: -0.71, photo_verified_flooding_spots: 9 },
    evidenceIds: ['tool:citizen:nlp_cluster:W18-2026-0812', 'tool:citizen:photo_verify:batch-0047'],
    selfConfidence: 0.83,
    flags: ['r7_onramp_flooded_citizen_verified', 'canal_north_clear', 'high_public_distress']
  },
  {
    _sampleFilename: 'memory.json', agent: 'memory',
    conclusion: 'Oct 2023 Ward 18 flood event (105 mm/hr) shares 91% spatial overlap. R7 outfall failed within 19 min; Canal North diversion reduced sump level 34% in 15 min. STEMI outcome was zero mortality via Canal North bypass.',
    signals: { historical_match_similarity_pct: 91, matched_rainfall_mm_hr: 105, matched_r7_failure_min: 19, canal_north_effect_pct_reduction: 34 },
    evidenceIds: ['tool:memory:vector_search:ward18-flood-2023-10-18'],
    selfConfidence: 0.88,
    flags: ['r7_historical_failure_pattern', 'canal_north_proven_effective', 'stemi_outcome_precedent_available']
  }
];

/* ─────────────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────────────────*/
const DOMAIN_AGENT_IDS = ['weather', 'water', 'traffic', 'emergency', 'citizen', 'memory'];

const AGENT_META = {
  weather:   { color: '#06b6d4', label: 'WEATHER',   icon: CloudRain   },
  water:     { color: '#3b82f6', label: 'WATER',     icon: Waves       },
  traffic:   { color: '#f59e0b', label: 'TRAFFIC',   icon: Car         },
  emergency: { color: '#ef4444', label: 'EMERGENCY', icon: Ambulance   },
  citizen:   { color: '#10b981', label: 'CITIZEN',   icon: MessageSquare },
  memory:    { color: '#a855f7', label: 'MEMORY',    icon: BrainCircuit  },
};

// SVG viewBox: 900 × 620. Planner at (450, 310). Agents on a hex ring, r≈230.
const PLANNER = { cx: 450, cy: 310 };
const AGENT_POS = {
  weather:   { cx: 225, cy: 155 },
  water:     { cx: 450, cy:  65 },
  traffic:   { cx: 675, cy: 155 },
  emergency: { cx: 675, cy: 455 },
  citizen:   { cx: 450, cy: 545 },
  memory:    { cx: 225, cy: 455 },
};

const SEV_STYLE = {
  CRITICAL: { chip: 'bg-red-100 text-red-700 border border-red-200',   left: 'border-l-red-500'   },
  HIGH:     { chip: 'bg-amber-100 text-amber-700 border border-amber-200', left: 'border-l-amber-500' },
  MEDIUM:   { chip: 'bg-sky-100 text-sky-700 border border-sky-200',   left: 'border-l-sky-500'   },
};

/* ─────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────*/
function parseFileContent(text, filename) {
  let raw;
  try { raw = JSON.parse(text); }
  catch (e) { throw new Error(`Invalid JSON: ${e.message}`); }
  const obj = Array.isArray(raw) ? raw[0] : raw;
  if (!obj || typeof obj !== 'object') throw new Error('Must be a JSON object or non-empty array.');
  return obj;
}

function agentIdFromParsed(parsed, filename) {
  const name = (parsed?.agent || filename.replace(/\.[^.]+$/, '')).toLowerCase();
  return DOMAIN_AGENT_IDS.find(id => name.includes(id)) || null;
}

function getEdgeCoords(cx1, cy1, r1, cx2, cy2, r2) {
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist === 0) return { x1: cx1, y1: cy1, x2: cx2, y2: cy2 };
  return {
    x1: cx1 + (dx/dist)*r1,
    y1: cy1 + (dy/dist)*r1,
    x2: cx2 - (dx/dist)*r2,
    y2: cy2 - (dy/dist)*r2,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG sub-components
───────────────────────────────────────────────────────────────────────────*/

// Animated data packets traveling from/to planner. Three staggered dots.
function DataPackets({ agentId, towardPlanner, active }) {
  if (!active) return null;
  const pos = AGENT_POS[agentId];
  const { cx: ax, cy: ay } = pos;
  const { cx: px, cy: py } = PLANNER;
  const edges = getEdgeCoords(ax, ay, 46, px, py, 58);
  const pathD = towardPlanner
    ? `M ${edges.x1} ${edges.y1} L ${edges.x2} ${edges.y2}`
    : `M ${edges.x2} ${edges.y2} L ${edges.x1} ${edges.y1}`;
  const color = AGENT_META[agentId]?.color || '#94a3b8';
  const dur = 1.6;

  return (
    <>
      {[0, 0.53, 1.06].map((delay, i) => (
        <g key={i}>
          <circle r="5" fill={color} opacity="0.9">
            <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={pathD} />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1"
              dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
            <animate attributeName="r" values="3;5;3" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </>
  );
}

// A single agent node in the SVG
function AgentNode({ agentId, loaded, synthesising }) {
  const pos = AGENT_POS[agentId];
  const meta = AGENT_META[agentId];
  if (!pos || !meta) return null;
  const { cx, cy } = pos;
  const { color, label } = meta;
  const Icon = meta.icon;

  // Convert lucide React icon to SVG text — we use a foreignObject for the icon
  const NODE_R = 46;

  return (
    <g>
      {/* Outer glow ring — always animated, intensity varies */}
      <circle
        cx={cx} cy={cy} r={NODE_R + 14} fill="none"
        stroke={color} strokeWidth="1.5" opacity={loaded ? 0.55 : 0.18}
        style={{
          animation: loaded
            ? `node-ready 2.4s ease-in-out infinite`
            : 'none',
          transformOrigin: `${cx}px ${cy}py`,
        }}
      />
      {/* Ping ring when newly active */}
      {loaded && (
        <circle cx={cx} cy={cy} r={NODE_R} fill="none"
          stroke={color} strokeWidth="2" opacity="0"
          style={{ animation: 'agent-ping 2s ease-out infinite', transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Main filled circle */}
      <circle
        cx={cx} cy={cy} r={NODE_R}
        fill={loaded ? `${color}18` : '#f8fafc'}
        stroke={color}
        strokeWidth={loaded ? 2.5 : 1.5}
        opacity={loaded ? 1 : 0.7}
      />

      {/* Icon area via foreignObject */}
      <foreignObject x={cx - 18} y={cy - 28} width="36" height="36">
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
          <Icon size={22} color={color} />
        </div>
      </foreignObject>

      {/* Label below icon */}
      <text x={cx} y={cy + 16} textAnchor="middle"
        fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="700"
        fill={color} letterSpacing="0.08em">
        {label}
      </text>

      {/* Status badge */}
      <text x={cx} y={cy + 30} textAnchor="middle"
        fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
        fill={loaded ? '#1e293b' : '#94a3b8'}>
        {loaded ? (synthesising ? 'sending…' : 'ready') : 'awaiting'}
      </text>
    </g>
  );
}

// Planner centre node
function PlannerNode({ hasData, synthesising, done }) {
  const { cx, cy } = PLANNER;
  const pColor = '#ec4899';
  const R = 58;

  const ringAnim = synthesising
    ? 'planner-active 0.9s ease-in-out infinite'
    : done
    ? 'planner-done 2s ease-in-out infinite'
    : hasData
    ? 'planner-idle 2.5s ease-in-out infinite'
    : 'none';

  return (
    <g>
      {/* Outer pulse ring */}
      <circle cx={cx} cy={cy} r={R + 18} fill="none"
        stroke={pColor} strokeWidth="1.5"
        style={{ animation: ringAnim, transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Secondary pulse ring */}
      {synthesising && (
        <circle cx={cx} cy={cy} r={R + 32} fill="none"
          stroke={pColor} strokeWidth="0.8"
          style={{ animation: 'planner-active 1.3s ease-in-out infinite 0.4s', transformOrigin: `${cx}px ${cy}px` }}
        />
      )}
      {/* Main circle */}
      <circle cx={cx} cy={cy} r={R}
        fill={synthesising ? '#fdf2f8' : done ? '#fdf4ff' : '#fafafa'}
        stroke={pColor}
        strokeWidth={synthesising ? 3 : 2}
      />
      {/* CPU icon via foreignObject */}
      <foreignObject x={cx - 22} y={cy - 30} width="44" height="44">
        <div xmlns="http://www.w3.org/1999/xhtml"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>
          <Cpu size={28} color={pColor} />
        </div>
      </foreignObject>
      <text x={cx} y={cy + 20} textAnchor="middle"
        fontSize="9.5" fontFamily="'JetBrains Mono', monospace" fontWeight="800"
        fill={pColor} letterSpacing="0.1em">
        PLANNER
      </text>
      <text x={cx} y={cy + 34} textAnchor="middle"
        fontSize="8" fontFamily="'JetBrains Mono', monospace" fontWeight="500"
        fill="#1e293b">
        {synthesising ? 'synthesising…' : done ? `${done} risks found` : hasData ? 'ready' : 'awaiting input'}
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Risk card
───────────────────────────────────────────────────────────────────────────*/
function RiskCard({ risk, index }) {
  const sev = SEV_STYLE[risk.severity] || SEV_STYLE.MEDIUM;
  const confPct = typeof risk.confidence === 'number' ? Math.round(risk.confidence * 100) : null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${sev.left} shadow-sm overflow-hidden`}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${sev.chip}`}>
          {risk.severity}
        </span>
        {typeof risk.estimatedOnsetMinutes === 'number' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-black">
            <Clock className="w-3 h-3" />
            onset ~<b>{risk.estimatedOnsetMinutes}</b> min
          </span>
        )}
        <span className="ml-auto text-[10px] font-mono text-slate-400">#{index + 1}</span>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        <h3 className="text-xs font-bold text-black leading-snug">{risk.title}</h3>

        {risk.cascade && (
          <p className="font-sans text-black leading-relaxed text-xs">
            {risk.cascade}
          </p>
        )}

        {risk.contributingAgents?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Agents:</span>
            {risk.contributingAgents.map(a => {
              const c = AGENT_META[a.toLowerCase()]?.color || '#6366f1';
              return (
                <span key={a} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-black border"
                  style={{ backgroundColor: `${c}18`, borderColor: `${c}55` }}>
                  {a}
                </span>
              );
            })}
          </div>
        )}

        {risk.affectedDepartments?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <Users className="w-3 h-3 inline mr-1" />Departments:
            </span>
            {risk.affectedDepartments.map(d => (
              <span key={d} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-black border border-slate-200 text-[11px] font-mono">
                {d}
              </span>
            ))}
          </div>
        )}

        {risk.evidenceIds?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {risk.evidenceIds.map(id => (
              <span key={id} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-mono text-black">
                {id}
              </span>
            ))}
          </div>
        )}

        {confPct !== null && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                <Shield className="w-3 h-3 inline mr-1" />Confidence
              </span>
              <span className="text-[11px] font-mono font-bold text-black">{confPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${confPct}%` }} />
            </div>
          </div>
        )}

        {risk.recommendedAction && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-[11px] font-mono font-bold text-black uppercase tracking-wider">Recommended Action</span>
            </div>
            <p className="text-xs font-sans text-black leading-relaxed">{risk.recommendedAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ShimmerCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-slate-100"><div className="h-5 w-28 bg-slate-100 rounded-full" /></div>
      <div className="px-5 py-4 space-y-3">
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-5/6 bg-slate-100 rounded" />
        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4" />
        <div className="h-12 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────────────────────────*/
export default function AgentCouncil() {
  const { backendUrl } = useCity();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [synthesising, setSynthesising] = useState(false);
  const [contactingAgentId, setContactingAgentId] = useState(null);
  const [risks, setRisks] = useState(null);
  const [synthError, setSynthError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const nextId = useRef(1);
  const riskRef = useRef(null);

  /* ── file processing ── */
  const processFiles = useCallback((fileList) => {
    Array.from(fileList)
      .filter(f => f.name.endsWith('.json') || f.name.endsWith('.txt'))
      .forEach(file => {
        const id = nextId.current++;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = parseFileContent(e.target.result, file.name);
            const agentId = agentIdFromParsed(parsed, file.name);
            const agentName = parsed?.agent || file.name.replace(/\.[^.]+$/, '');
            setUploadedFiles(prev => [...prev, { id, filename: file.name, agentName, agentId, status: 'ok', parsed, error: null }]);
          } catch (err) {
            const agentName = file.name.replace(/\.[^.]+$/, '');
            setUploadedFiles(prev => [...prev, { id, filename: file.name, agentName, agentId: null, status: 'error', parsed: null, error: err.message }]);
          }
        };
        reader.readAsText(file);
      });
  }, []);

  const handleFileInput = (e) => { processFiles(e.target.files); e.target.value = ''; };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setRisks(null); setSynthError(null);
  };

  const loadSamples = (e) => {
    e.preventDefault();
    SAMPLE_FINDINGS.forEach(sample => {
      const id = nextId.current++;
      const agentId = agentIdFromParsed(sample, sample._sampleFilename);
      setUploadedFiles(prev => [...prev, {
        id, filename: sample._sampleFilename, agentName: sample.agent,
        agentId, status: 'ok', parsed: sample, error: null
      }]);
    });
  };

  /* ── synthesise ── */
  const goodFiles = uploadedFiles.filter(f => f.status === 'ok');
  const canSynthesise = goodFiles.length >= 2 && !synthesising;

  const handleSynthesise = async () => {
    setSynthesising(true); 
    setRisks(null); 
    setSynthError(null);

    // Sort files to guarantee 'weather' is first, according to DOMAIN_AGENT_IDS order
    const sortedFiles = [...goodFiles].sort((a, b) => {
      const idxA = DOMAIN_AGENT_IDS.indexOf(a.agentId);
      const idxB = DOMAIN_AGENT_IDS.indexOf(b.agentId);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    // Simulate asking agents one by one
    for (const file of sortedFiles) {
      if (file.agentId) {
        setContactingAgentId(file.agentId);
        // Wait a bit to show animation
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // Stop single agent animation, show general synthesis
    setContactingAgentId('planner_processing');

    try {
      const res = await fetch(`${backendUrl}/api/planner/synthesise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: goodFiles.map(f => f.parsed) })
      });
      const data = await res.json();
      if (!res.ok || data.error) { setSynthError(data.error || `Server error ${res.status}`); }
      else {
        setRisks(data.risks || []);
        setTimeout(() => riskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    } catch (err) {
      setSynthError(`Network error: ${err.message}`);
    } finally {
      setSynthesising(false);
      setContactingAgentId(null);
    }
  };

  /* ── derived topology state ── */
  const loadedAgentIds = new Set(
    uploadedFiles.filter(f => f.status === 'ok' && f.agentId).map(f => f.agentId)
  );

  /* ── connection line colour helper ── */
  const lineColor = (agentId) => {
    if (!loadedAgentIds.has(agentId)) return '#e2e8f0';
    return AGENT_META[agentId]?.color || '#94a3b8';
  };

  return (
    <>
      {/* Inject keyframes */}
      <style>{KEYFRAMES}</style>

      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 130px)' }}>

        {/* ── Upload strip ────────────────────────────────────────── */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-wrap items-center gap-4 px-6 py-4 rounded-xl border mb-4 transition-colors
            ${isDragging ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white'}`}
        >
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-700
              text-white text-sm font-mono font-bold cursor-pointer transition-colors shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload findings
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".json,.txt" onChange={handleFileInput} className="hidden" id="agent-file-input" />

          {/* Divider */}
          {uploadedFiles.length > 0 && <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />}

          {/* File chips */}
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {uploadedFiles.map(entry => {
              const color = entry.agentId ? AGENT_META[entry.agentId]?.color : '#94a3b8';
              return (
                <span key={entry.id}
                  className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full border text-xs font-mono font-semibold text-black"
                  style={{ backgroundColor: `${color}15`, borderColor: `${color}55` }}>
                  {entry.status === 'ok'
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color }} />
                    : <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                  {entry.agentName}
                  <button onClick={() => removeFile(entry.id)}
                    className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-black/10 cursor-pointer ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
            {uploadedFiles.length === 0 && (
              <span className="text-sm font-mono text-black font-semibold">Drop agent .json files here or click Upload</span>
            )}
          </div>

          {/* Synthesise button */}
          <button
            onClick={handleSynthesise}
            disabled={!canSynthesise}
            id="synthesise-btn"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-mono text-sm font-bold transition-all shrink-0
              ${canSynthesise
                ? 'bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-md shadow-violet-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Sparkles className={`w-4 h-4 ${synthesising ? 'animate-spin' : ''}`} />
            {synthesising ? 'Synthesising…' : 'Synthesise'}
          </button>
        </div>

        {/* ── Topology hero ────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative"
          style={{ minHeight: '520px' }}>

          {/* Subtle grid background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.035 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Main topology SVG */}
          <svg
            viewBox="0 0 900 620"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
            style={{ minHeight: '520px' }}
          >
            {/* ── Connection lines ── */}
            {DOMAIN_AGENT_IDS.map(id => {
              const pos = AGENT_POS[id];
              const loaded = loadedAgentIds.has(id);
              const c = lineColor(id);
              const edges = getEdgeCoords(pos.cx, pos.cy, 46, PLANNER.cx, PLANNER.cy, 58);
              return (
                <line key={id}
                  x1={edges.x1} y1={edges.y1} x2={edges.x2} y2={edges.y2}
                  stroke={c}
                  strokeWidth={loaded ? 1.8 : 1}
                  strokeDasharray={loaded ? 'none' : '5 5'}
                  opacity={loaded ? 0.7 : 0.35}
                  style={{ transition: 'stroke 0.4s, opacity 0.4s, stroke-width 0.4s' }}
                />
              );
            })}

            {/* ── Data packets (agent → planner when loaded/synthesising) ── */}
            {DOMAIN_AGENT_IDS.map(id => (
              <DataPackets key={`fwd-${id}`}
                agentId={id}
                towardPlanner={true}
                active={contactingAgentId === id}
              />
            ))}

            {/* ── Data packets (planner → agents when synthesis done) ── */}
            {risks && DOMAIN_AGENT_IDS.map(id => (
              <DataPackets key={`bwd-${id}`}
                agentId={id}
                towardPlanner={false}
                active={loadedAgentIds.has(id)}
              />
            ))}

            {/* ── Agent nodes ── */}
            {DOMAIN_AGENT_IDS.map(id => (
              <AgentNode key={id} agentId={id}
                loaded={loadedAgentIds.has(id)}
                synthesising={contactingAgentId === id}
              />
            ))}

            {/* ── Planner centre node ── */}
            <PlannerNode
              hasData={loadedAgentIds.size > 0}
              synthesising={synthesising}
              done={risks?.length || null}
            />

            {/* ── Corner label ── */}
            <text x="18" y="22" fontSize="10" fontFamily="'JetBrains Mono', monospace"
              fontWeight="700" fill="#94a3b8" letterSpacing="0.12em">
              MULTI-AGENT CONSENSUS TOPOLOGY
            </text>
            <text x="18" y="36" fontSize="9" fontFamily="'JetBrains Mono', monospace"
              fill="#c4c9d4">
              Ward 18 · Chennai · 118 mm/hr scenario
            </text>

            {/* ── Live status pill ── */}
            <g transform="translate(720, 12)">
              <rect x="0" y="0" width="166" height="22" rx="11"
                fill={synthesising ? '#7c3aed' : loadedAgentIds.size > 0 ? '#059669' : '#e2e8f0'} />
              <text x="83" y="15" textAnchor="middle" fontSize="9.5"
                fontFamily="'JetBrains Mono', monospace" fontWeight="700"
                fill={loadedAgentIds.size > 0 || synthesising ? 'white' : '#94a3b8'}>
                {synthesising
                  ? '⬤  SYNTHESISING'
                  : loadedAgentIds.size > 0
                  ? `⬤  ${loadedAgentIds.size}/6 AGENTS READY`
                  : '○  AWAITING INPUT'}
              </text>
            </g>
          </svg>
        </div>

        {/* ── Risk output ──────────────────────────────────────────── */}
        {(synthesising || risks || synthError) && (
          <div ref={riskRef} className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-violet-600" />
              <h2 className="text-xs font-mono font-bold text-black uppercase tracking-wider">
                Cascading Risk Analysis
              </h2>
              {risks && (
                <span className="ml-auto text-[10px] font-mono text-slate-400">
                  {risks.length} risk{risks.length !== 1 ? 's' : ''} identified
                </span>
              )}
            </div>

            {synthesising && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-black font-mono mb-4">
                  <Sparkles className="w-4 h-4 text-violet-600 animate-spin" />
                  Gemini Planner Agent is reasoning over findings…
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ShimmerCard /><ShimmerCard /><ShimmerCard />
                </div>
              </div>
            )}

            {!synthesising && synthError && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-black">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="text-sm font-bold mb-0.5">Synthesis failed</p>
                  <p className="text-xs font-mono leading-relaxed">{synthError}</p>
                </div>
              </div>
            )}

            {!synthesising && risks && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {risks.map((risk, i) => (
                  <RiskCard key={i} risk={risk} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
