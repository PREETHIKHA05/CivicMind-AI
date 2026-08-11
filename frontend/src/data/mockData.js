/**
 * CivicMind AI — Real-time & Historical Smart City Intelligence Mock Dataset
 * Focus Area: Chennai Metropolitan Area (Ward 18 / Hospital Road Emergency Scenario)
 */

export const CITY_METADATA = {
  name: "Chennai Metropolitan Area",
  region: "Tamil Nadu, India",
  center: [13.0827, 80.2707],
  zoom: 13,
  weather: {
    condition: "Heavy Monsoon Downpour",
    temp: "27°C",
    rainfall: "120 mm/hr",
    windSpeed: "24 km/h",
    humidity: "94%",
    status: "Severe Alert"
  },
  stats: {
    activeIncidents: 7,
    criticalRisks: 2,
    aiRecommendations: 14,
    agentsOnline: 7,
    totalAgents: 7,
    departmentsConnected: 4,
    cityRiskIndex: 78,
    preInterventionRisk: 92,
    postInterventionRisk: 41
  }
};

export const DEPARTMENTS = [
  { id: "water", name: "Water Resources & Drainage", icon: "Droplets", color: "blue", status: "Critical Load", official: "Eng. Rajesh Kumar", email: "water.dept@chennai.gov.in" },
  { id: "traffic", name: "Traffic Management Bureau", icon: "Car", color: "amber", status: "Congested", official: "Inspector S. Ramanathan", email: "traffic.bureau@chennai.gov.in" },
  { id: "emergency", name: "Emergency Services (108)", icon: "Ambulance", color: "red", status: "Alert Route", official: "Dr. Anitha V.", email: "emergency108@chennai.gov.in" },
  { id: "public", name: "Public Information & Advisory", icon: "Radio", color: "purple", status: "Broadcasting", official: "Priya Sundaram", email: "public.advisory@chennai.gov.in" },
  { id: "health", name: "Municipal Public Health", icon: "HeartPulse", color: "emerald", status: "Standby", official: "Dr. K. Vijay", email: "health.dept@chennai.gov.in" }
];

export const USER_ROLES = [
  {
    id: "counselor",
    role: "counselor",
    name: "Zone Counselor",
    title: "Ward 18 Zone Counselor & ICCC Administrator",
    departmentId: null,
    email: "counselor.ward18@chennai.gov.in",
    avatar: "ShieldCheck",
    description: "Full oversight of city intelligence, response plan customization, multi-department approval, and risk management."
  },
  {
    id: "water_official",
    role: "department",
    name: "Eng. Rajesh Kumar",
    title: "Chief Drainage Engineer",
    departmentId: "water",
    deptName: "Water Resources & Drainage",
    email: "water.dept@chennai.gov.in",
    avatar: "Droplets",
    description: "Monitors drainage sluice gates, mobile pump units, and secondary canal flow levels."
  },
  {
    id: "traffic_official",
    role: "department",
    name: "Inspector S. Ramanathan",
    title: "Traffic Signals Division Head",
    departmentId: "traffic",
    deptName: "Traffic Management Bureau",
    email: "traffic.bureau@chennai.gov.in",
    avatar: "Car",
    description: "Controls arterial green-wave corridors, signal overrides, and emergency transit diversions."
  },
  {
    id: "emergency_official",
    role: "department",
    name: "Dr. Anitha V.",
    title: "108 Emergency Dispatch Director",
    departmentId: "emergency",
    deptName: "Emergency Services (108)",
    email: "emergency108@chennai.gov.in",
    avatar: "Ambulance",
    description: "Manages ambulance route optimization, critical care transit, and hospital ER access."
  },
  {
    id: "public_official",
    role: "department",
    name: "Priya Sundaram",
    title: "Public Advisory & Communications Officer",
    departmentId: "public",
    deptName: "Public Information & Advisory",
    email: "public.advisory@chennai.gov.in",
    avatar: "Radio",
    description: "Handles geotagged SMS advisories, citizen portal broadcasts, and commuter alerts."
  },
  {
    id: "health_official",
    role: "department",
    name: "Dr. K. Vijay",
    title: "Municipal Health Officer",
    departmentId: "health",
    deptName: "Municipal Public Health",
    email: "health.dept@chennai.gov.in",
    avatar: "HeartPulse",
    description: "Oversees trauma ER preparedness, ICU bed allocation, and emergency medical camps."
  }
];

export const MAP_MARKERS = [
  {
    id: "m-1",
    title: "Hospital Road Congestion & Inundation",
    category: "incident",
    severity: "critical",
    lat: 13.0650,
    lng: 80.2450,
    ward: "Ward 18",
    description: "Rising water levels (32cm) and extreme traffic congestion threatening ambulance route to City General Hospital.",
    telemetry: { drainCapacity: "28%", trafficSpeed: "6 km/h", waterLevel: "+32cm", activeAmbulances: 2 },
    affectedDepartments: ["Traffic", "Water", "Emergency"],
    aiPrediction: "92% risk of total hospital route blockage in 35 mins"
  },
  {
    id: "m-2",
    title: "Zone 4 Sluice Gate Drainage Bottleneck",
    category: "water",
    severity: "high",
    lat: 13.0600,
    lng: 80.2380,
    ward: "Zone 4",
    description: "Drainage capacity saturated at 28%. Sediment buildup slowing outflow into Cooum River basin.",
    telemetry: { inflow: "450 m³/s", outflow: "125 m³/s", pumpStatus: "1 of 4 Active" },
    affectedDepartments: ["Water", "Municipal Works"],
    aiPrediction: "Potential overflow into surrounding residential sectors within 20 mins"
  },
  {
    id: "m-3",
    title: "City General Hospital",
    category: "hospital",
    severity: "normal",
    lat: 13.0680,
    lng: 80.2510,
    ward: "Ward 18",
    description: "Level 1 Trauma Center. ICU Bed Capacity: 83%. Currently receiving emergency incoming trauma units.",
    telemetry: { icuOccupancy: "83%", ERWait: "12 mins", incomingAmbulances: 3 },
    affectedDepartments: ["Emergency", "Health"],
    aiPrediction: "Primary access road endangered by Ward 18 flooding"
  },
  {
    id: "m-4",
    title: "Emergency Ambulance Route B (Secondary Diversion)",
    category: "route",
    severity: "normal",
    lat: 13.0720,
    lng: 80.2480,
    ward: "Ward 17",
    description: "Clear corridor via EVR Periyar Salai. Elevation +4.2m above flood level. Recommended as priority diversion.",
    telemetry: { trafficSpeed: "38 km/h", floodRisk: "Low (5%)", travelTime: "11 mins" },
    affectedDepartments: ["Traffic", "Emergency"],
    aiPrediction: "Optimal alternate route with 98% route reliability"
  },
  {
    id: "m-5",
    title: "Anna Salai Junction Traffic Surge",
    category: "traffic",
    severity: "high",
    lat: 13.0580,
    lng: 80.2550,
    ward: "Zone 5",
    description: "Vessel signal queue backed up 1.8km due to rain-related minor collisions and reduced visibility.",
    telemetry: { queueLength: "1.8 km", avgDelay: "22 mins", signalsActive: "Adaptive" },
    affectedDepartments: ["Traffic"],
    aiPrediction: "Spillover congestion targeting Hospital Road in 15 mins"
  },
  {
    id: "m-6",
    title: "Koyambedu Drainage Junction Pump Station",
    category: "infrastructure",
    severity: "normal",
    lat: 13.0700,
    lng: 80.1950,
    ward: "Zone 8",
    description: "High-capacity storm water pumping station. All 6 turbines operating at 92% efficiency.",
    telemetry: { turbinesActive: "6/6", dischargeRate: "820 m³/s", powerSupply: "Grid + Diesel Backup" },
    affectedDepartments: ["Water"],
    aiPrediction: "Operating normally; buffering western basin inflow"
  },
  {
    id: "m-7",
    title: "Citizen Flood Complaints Cluster",
    category: "weather",
    severity: "medium",
    lat: 13.0520,
    lng: 80.2400,
    ward: "Ward 18 South",
    description: "38 citizen reports in past 20 minutes via Civic Portal reporting water stagnation and stalled vehicles.",
    telemetry: { reportCount: 38, sentiment: "Urgent/Distressed", verificationScore: "88%" },
    affectedDepartments: ["Citizen Voice", "Municipal Works"],
    aiPrediction: "Corroborates Water Agent sensor readings of drainage blockage"
  }
];

export const AI_AGENTS = [
  {
    id: "weather",
    name: "Weather Agent",
    role: "Meteorological Prediction & Atmospheric Telemetry",
    status: "ACTIVE",
    avatar: "CloudRain",
    color: "#06b6d4", // cyan
    task: "Monitoring Doppler radar cells and micro-burst precipitation vectors.",
    lastObservation: "120 mm/hr localized rainfall core stationary above Ward 18.",
    confidence: 96,
    metrics: { DopplerRadar: "120mm/h", CloudCellSpeed: "4 km/h East", RiskLevel: "Extreme" }
  },
  {
    id: "water",
    name: "Water Agent",
    role: "Hydrodynamic Drainage & Canal Sluice Monitoring",
    status: "ACTIVE",
    avatar: "Waves",
    color: "#3b82f6", // blue
    task: "Analyzing drainage canal headwaters and retention basin capacities.",
    lastObservation: "Ward 18 primary drain capacity depleted to 28%. Backwater effect detected.",
    confidence: 94,
    metrics: { DrainageCapacity: "28%", SluiceFlowRate: "125 m³/s", InundationRate: "+2.4cm/10m" }
  },
  {
    id: "traffic",
    name: "Traffic Agent",
    role: "Urban Corridor Flow & Signal Synchronization",
    status: "ACTIVE",
    avatar: "Car",
    color: "#f59e0b", // amber
    task: "Tracking vehicle density, average speeds, and arterial intersections.",
    lastObservation: "Hospital Road average speed plummeted to 6 km/h. Bottleneck forming at Gate 2.",
    confidence: 92,
    metrics: { CorridorSpeed: "6 km/h", CongestionIndex: "88%", SignalDelay: "+18 mins" }
  },
  {
    id: "emergency",
    name: "Emergency Agent",
    role: "108 Fleet Routing & Hospital Logistics",
    status: "ACTIVE",
    avatar: "Ambulance",
    color: "#ef4444", // red
    task: "Tracking active emergency calls and critical ambulance transit corridors.",
    lastObservation: "Ambulance #108-B4 carrying critical cardiac patient stuck 800m from ER entrance.",
    confidence: 98,
    metrics: { ActiveUnits: 12, EnRouteHospital: 3, CorridorThreat: "CRITICAL" }
  },
  {
    id: "citizen",
    name: "Citizen Voice Agent",
    role: "NLP Sentiment & Public Reporting Triangulation",
    status: "ACTIVE",
    avatar: "MessageSquare",
    color: "#10b981", // emerald
    task: "Filtering emergency helpline calls, social signals, and municipal app photos.",
    lastObservation: "38 geotagged reports of knee-deep water on Hospital Road confirmed in 15 mins.",
    confidence: 89,
    metrics: { IncomingReports: "38 calls/15m", VerificationScore: "88%", ClusterDetected: "Ward 18" }
  },
  {
    id: "memory",
    name: "Memory Agent",
    role: "Historical Pattern Matching & Spatial Recurrence",
    status: "ACTIVE",
    avatar: "BrainCircuit",
    color: "#a855f7", // purple
    task: "Searching historical vector database for matching hydrological and traffic profiles.",
    lastObservation: "Identified 91% matching cascade profile from Nov 14, 2024 (Incident #HYD-2024-88).",
    confidence: 93,
    metrics: { MatchingEvents: 3, HighestSimilarity: "91% (Nov 2024)", HistoricalLeadTime: "42 mins" }
  },
  {
    id: "planner",
    name: "Planner Agent",
    role: "Multi-Agent Consensus & Coordinated Plan Synthesis",
    status: "ACTIVE",
    avatar: "Cpu",
    color: "#ec4899", // pink
    task: "Synthesizing cross-department recommendations into a unified action plan.",
    lastObservation: "Formulated 4-point Coordinated Response Plan mitigating cascading hospital lockout.",
    confidence: 95,
    metrics: { ConsensusScore: "95%", MitigatedRisk: "-51 pts", ApprovalState: "Awaiting Operator" }
  }
];

export const INCIDENTS_LIST = [
  {
    id: "INC-2026-081",
    title: "Hospital Road Inundation & Emergency Corridor Blockage",
    ward: "Ward 18",
    severity: "critical",
    riskScore: 92,
    confidence: 94,
    time: "07:05 AM (Live)",
    affectedDepartments: ["Water", "Traffic", "Emergency Services", "Municipal Works"],
    summary: "Heavy localized rainfall combined with 28% drain capacity is creating water stagnation on Hospital Road. Ambulance #108-B4 delayed by 18 minutes while carrying critical emergency patient.",
    rootCauses: [
      "Heavy localized downpour (120 mm/hr)",
      "Low drainage outflow capacity (28% efficiency)",
      "Existing signal congestion at Anna Salai junction"
    ],
    cascadingEffects: [
      "Water level reaches +32cm on Hospital Road",
      "Vehicular traffic stalls completely near Gate 2",
      "Ambulances blocked from reaching Trauma Center",
      "Hospital emergency room inaccessible for critical care"
    ],
    aiAssessment: "HIGH PROBABILITY (92%) of total hospital access failure within 35 minutes unless coordinated drainage pumps and traffic diversion are activated immediately."
  },
  {
    id: "INC-2026-082",
    title: "Zone 4 Sluice Gate Sediment Overflow Risk",
    ward: "Zone 4",
    severity: "high",
    riskScore: 79,
    confidence: 91,
    time: "06:48 AM",
    affectedDepartments: ["Water Resources", "Municipal Works"],
    summary: "Heavy silt accumulation in secondary canal channel reduced outflow velocity by 40%. Water backup spilling into low-lying housing layout.",
    rootCauses: [
      "Uncleared urban debris buildup in canal channel",
      "High tide back-pressure from coastal estuary"
    ],
    cascadingEffects: [
      "Basin overflow into Residential Zone 4",
      "Localized power transformer short-circuit risk"
    ],
    aiAssessment: "Moderate-to-high risk of residential waterlogging. Recommending mechanical excavator dispatch to clear sluice channel."
  },
  {
    id: "INC-2026-083",
    title: "Anna Salai Flyover Gridlock & Signal Spillover",
    ward: "Zone 5",
    severity: "high",
    riskScore: 74,
    confidence: 88,
    time: "06:55 AM",
    affectedDepartments: ["Traffic Management"],
    summary: "Traffic queue length exceeded 1.8km on arterial road due to rain visibility reduction and stalled commercial bus.",
    rootCauses: [
      "Rainfall reduced lane capacity by 35%",
      "Stalled heavy vehicle blocking middle lane"
    ],
    cascadingEffects: [
      "Spillover onto Hospital Road and EVR Periyar Salai",
      "Increased transit times for emergency vehicles across central city"
    ],
    aiAssessment: "High congestion risk. Green-wave adaptive signal timing recommended for southbound arterial routes."
  },
  {
    id: "INC-2026-084",
    title: "Substation #3 Ground Infiltration Alert",
    ward: "Ward 12",
    severity: "medium",
    riskScore: 61,
    confidence: 86,
    time: "06:30 AM",
    affectedDepartments: ["Power & Utilities", "Water"],
    summary: "Groundwater level reached warning threshold near electrical transformer bay. No power disruption currently reported.",
    rootCauses: ["High soil saturation", "Perimeter drainage trench overflow"],
    cascadingEffects: ["Potential localized power shutoff for safety if water rises 15cm further"],
    aiAssessment: "Low immediate danger. Sump pump automated cycle engaged."
  }
];

export const CAUSAL_GRAPH_NODES = [
  { id: "c1", label: "HEAVY RAINFALL", category: "weather", val: 95, detail: "Doppler cell delivering 120 mm/hr over Ward 18", frequency: "4x per year" },
  { id: "c2", label: "DRAIN OVERFLOW", category: "water", val: 88, detail: "Secondary drains at 28% capacity; river discharge backlogged", frequency: "Correlated 94% with rainfall >80mm" },
  { id: "c3", label: "ROAD FLOODING", category: "infrastructure", val: 82, detail: "Water accumulation of 32cm on Hospital Road surface", frequency: "Recurred 3 times in 2024-2025" },
  { id: "c4", label: "TRAFFIC CONGESTION", category: "traffic", val: 78, detail: "Vehicular speed dropped to 6 km/h; 1.8km tailback", frequency: "Immediate trigger upon >15cm flood" },
  { id: "c5", label: "AMBULANCE DELAY", category: "emergency", val: 92, detail: "Ambulance #108-B4 delayed by +18 minutes en route to Trauma Center", frequency: "Critical threshold exceeded" },
  { id: "c6", label: "HOSPITAL ACCESS RISK", category: "critical", val: 94, detail: "Potential total lockout of Level 1 Trauma ER access", frequency: "Preventable via coordinated plan" }
];

export const CAUSAL_GRAPH_EDGES = [
  { source: "c1", target: "c2", label: "Triggers Outflow Failure", weight: "High (0.94)" },
  { source: "c2", target: "c3", label: "Causes Surface Waterlogging", weight: "High (0.91)" },
  { source: "c3", target: "c4", label: "Reduces Lane Capacity", weight: "High (0.88)" },
  { source: "c4", target: "c5", label: "Blocks Transit Corridor", weight: "Critical (0.95)" },
  { source: "c5", target: "c6", label: "Threatens Trauma Access", weight: "Critical (0.96)" }
];

export const HISTORICAL_MEMORIES = [
  {
    id: "HIST-2024-11",
    year: "2024",
    date: "Nov 14, 2024",
    title: "Ward 18 Flash Flood & Hospital Road Paralysis",
    location: "Ward 18 / Hospital Road",
    similarityScore: "91%",
    conditions: "115 mm/hr rain + 25% drain capacity + peak morning traffic",
    outcome: "Flooding reached 45cm within 42 minutes. Emergency vehicles diverted after 1-hour delay.",
    actionsTaken: "Uncoordinated delayed manual pumping after flood occurred. Traffic police deployed manually.",
    lessonLearned: "Early pre-emptive deployment of mobile pumps and automated traffic diversion saves 35+ minutes of ER access."
  },
  {
    id: "HIST-2025-03",
    year: "2025",
    date: "Oct 28, 2025",
    title: "Zone 4 Sluice Overflow & Silt Collapse",
    location: "Zone 4 Drainage Channel",
    similarityScore: "84%",
    conditions: "Short intense cloudburst + canal debris blockage",
    outcome: "Residential sector inundated. 120 families evacuated for 18 hours.",
    actionsTaken: "Hydraulic excavators cleared canal debris after 4 hours.",
    lessonLearned: "Sluice gate monitoring sensors provide 30-minute advance warning before canal spillover."
  },
  {
    id: "HIST-2025-07",
    year: "2025",
    date: "Dec 02, 2025",
    title: "Anna Salai Substation & Arterial Gridlock",
    location: "Anna Salai Junction",
    similarityScore: "76%",
    conditions: "Continuous 3-day drizzle + signal controller short-circuit",
    outcome: "4-hour citywide congestion gridlock.",
    actionsTaken: "Manual traffic signal overrides at 14 intersections.",
    lessonLearned: "Adaptive signal green-wave corridors prevent arterial gridlock from spreading to hospital zones."
  }
];

export const COORDINATED_RESPONSE_PLAN = {
  incidentId: "INC-2026-081",
  title: "Ward 18 Hospital Corridor Coordinated Emergency Mitigation",
  riskScorePre: 92,
  riskScorePost: 41,
  confidence: 94,
  generatedAt: "07:10 AM",
  status: "Awaiting Human Review", // "Awaiting Human Review" | "APPROVED BY ICCC OPERATOR" | "Changes Requested"
  actions: [
    {
      id: "act-1",
      departmentId: "water",
      department: "Water Resources & Drainage",
      deptColor: "blue",
      deptIcon: "Droplets",
      enabled: true,
      priority: "HIGH",
      baseRiskImpact: 22,
      resourceUnits: "2 Mobile Pumps",
      resourceCount: 2,
      recommendation: "Deploy 2x High-Capacity Mobile Pumps to Ward 18 Low-Point Sump (Station 4B).",
      reason: "Drainage capacity at 28%. Water level rising +2.4cm every 10 minutes near Gate 2.",
      confidence: "96%",
      expectedImpact: "Reduces water accumulation by 65% in 20 minutes; lowers flood risk score by 22 pts.",
      evidence: ["Water Agent sensor reading: 28% capacity", "Memory Agent: 2024 pump deployment success profile"],
      workOrderStatus: "Assigned",
      assignedBy: "Zone Counselor",
      assignedTime: "07:10 AM"
    },
    {
      id: "act-2",
      departmentId: "traffic",
      department: "Traffic Management Bureau",
      deptColor: "amber",
      deptIcon: "Car",
      enabled: true,
      priority: "HIGH",
      baseRiskImpact: 15,
      resourceUnits: "Route B Green-Wave Sync",
      resourceCount: 1,
      recommendation: "Activate Green-Wave Traffic Signal Timing on Route B (EVR Periyar Salai Diversion) and lock Hospital Road Gate 1 entry to emergency-only.",
      reason: "Hospital Road speed is 6 km/h. Queue length 1.8km. Diversion Route B is clear at 38 km/h.",
      confidence: "94%",
      expectedImpact: "Clears 80% of non-essential traffic away from hospital corridor within 8 minutes.",
      evidence: ["Traffic Agent flow analysis", "Camera 18-B vehicle density scan"],
      workOrderStatus: "Assigned",
      assignedBy: "Zone Counselor",
      assignedTime: "07:10 AM"
    },
    {
      id: "act-3",
      departmentId: "emergency",
      department: "Emergency Services (108)",
      deptColor: "red",
      deptIcon: "Ambulance",
      enabled: true,
      priority: "CRITICAL",
      baseRiskImpact: 10,
      resourceUnits: "3 Ambulances Rerouted",
      resourceCount: 3,
      recommendation: "Reroute Ambulance #108-B4 and all incoming trauma units to Route B via EVR Periyar Salai.",
      reason: "Hospital Road currently experiencing 18-minute transit delay for emergency vehicles.",
      confidence: "98%",
      expectedImpact: "Guarantees direct ER access in 11 minutes (saving 18 minutes of transit time).",
      evidence: ["GPS telemetry of Ambulance #108-B4", "Emergency Agent real-time route optimization"],
      workOrderStatus: "Assigned",
      assignedBy: "Zone Counselor",
      assignedTime: "07:10 AM"
    },
    {
      id: "act-4",
      departmentId: "public",
      department: "Public Information & Advisory",
      deptColor: "purple",
      deptIcon: "Radio",
      enabled: true,
      priority: "MEDIUM",
      baseRiskImpact: 4,
      resourceUnits: "Zone SMS Broadcast",
      resourceCount: 1,
      recommendation: "Issue localized civic alert via SMS & Radio for Ward 18 drivers to bypass Hospital Road.",
      reason: "Prevents secondary traffic build-up while mobile pumps are in operation.",
      confidence: "88%",
      expectedImpact: "Diverts approximately 35% of incoming commuter traffic.",
      evidence: ["Citizen Voice Agent traffic cluster data", "Public Advisory automated broadcast template"],
      workOrderStatus: "Assigned",
      assignedBy: "Zone Counselor",
      assignedTime: "07:10 AM"
    }
  ]
};

export const RECHARTS_DATA = {
  riskTrend: [
    { time: "06:00", risk: 42, rain: 20, traffic: 25 },
    { time: "06:15", risk: 51, rain: 45, traffic: 38 },
    { time: "06:30", risk: 65, rain: 75, traffic: 55 },
    { time: "06:45", risk: 78, rain: 100, traffic: 72 },
    { time: "07:00", risk: 92, rain: 120, traffic: 88 },
    { time: "07:15 (Simulated Approved)", risk: 41, rain: 110, traffic: 35 }
  ],
  deptResponseTime: [
    { dept: "Water Dept", manualTime: 45, civicMindTime: 12 },
    { dept: "Traffic Bureau", manualTime: 38, civicMindTime: 8 },
    { dept: "Emergency 108", manualTime: 25, civicMindTime: 5 },
    { dept: "Public Advisory", manualTime: 60, civicMindTime: 3 }
  ],
  accuracyMetrics: [
    { month: "Jan", accuracy: 91, incidentsPrevented: 14 },
    { month: "Feb", accuracy: 93, incidentsPrevented: 18 },
    { month: "Mar", accuracy: 94, incidentsPrevented: 22 },
    { month: "Apr", accuracy: 92, incidentsPrevented: 19 },
    { month: "May", accuracy: 95, incidentsPrevented: 27 },
    { month: "Jun", accuracy: 96, incidentsPrevented: 31 }
  ]
};

export const MOCK_INTELLIGENCE_QA = [
  {
    keywords: ["risk", "highest", "critical", "happening"],
    response: "The highest urban risk right now is Potential Hospital Access Failure in Ward 18 (Risk Score: 92/100, Confidence: 94%). Heavy rainfall (120 mm/hr) and low drainage capacity (28%) have caused surface waterlogging on Hospital Road, threatening ambulance transit to City General Hospital."
  },
  {
    keywords: ["ward 18", "hospital road", "why"],
    response: "Ward 18 is critical because 3 cascading factors converged: 1) Localized downpour of 120mm/hr, 2) Secondary drainage capacity down to 28%, and 3) Traffic congestion at 6 km/h blocking Ambulance #108-B4 carrying a critical trauma patient."
  },
  {
    keywords: ["department", "affected", "who"],
    response: "4 key departments are affected and synchronized: Water Resources & Drainage (Pumps required), Traffic Bureau (Diversion to Route B), Emergency Services 108 (Rerouting ambulances), and Public Advisory (SMS traffic advisory)."
  },
  {
    keywords: ["2024", "memory", "history", "historical"],
    response: "Memory Agent identified a 91% match with Incident #HYD-2024-88 (Nov 14, 2024). In 2024, uncoordinated manual responses resulted in a 45cm flood and a 1-hour ER transit delay. CivicMind's current plan prevents this by pre-emptively deploying mobile pumps and clearing Route B."
  },
  {
    keywords: ["recommend", "recommendation", "plan", "solution"],
    response: "CivicMind recommends: 1) Deploy 2 mobile pumps at Ward 18 Sump 4B, 2) Divert non-emergency traffic to EVR Periyar Salai (Route B), 3) Reroute Ambulance #108-B4 via Route B, and 4) Issue localized commuter alerts. Approving this plan reduces projected risk from 92/100 to 41/100."
  }
];
