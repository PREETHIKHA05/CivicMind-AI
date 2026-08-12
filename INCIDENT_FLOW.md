# Incident & Response Plan Flow

## Overview
This document explains how incidents and response plans flow through the CivicMind AI system, from Agent Council synthesis to department dashboards.

## Complete Data Flow

### 1. **Initial State (No Problems)**
When the Zone Counselor logs in initially:
- **Incident Intelligence Page**: Shows "No Active Incidents" with prompt to go to Agent Council
- **Response Plans Page**: Shows "No active plan" state
- **Department Dashboards**: No work orders assigned

### 2. **Agent Council Synthesis**
When agents synthesize problems in the Agent Council page:

1. **Upload Agent Findings**:
   - Click "Load Sample Data" button to load 6 pre-configured agent findings (weather, water, traffic, emergency, citizen, memory)
   - Or manually upload `.json` files with agent findings

2. **Synthesize**:
   - Click "Synthesise" button
   - Animated topology shows agents being contacted one-by-one
   - Planner processes all findings and generates risks

3. **Results Generated**:
   - **Risks**: Display as cards showing severity, cascade analysis, recommended actions
   - **Incidents**: Automatically created from risks and added to system
   - **Response Plan**: Plan actions automatically generated from risks

4. **Navigation Options**:
   - "View Incidents →" button - Navigate to Incident Intelligence
   - "Review Response Plan →" button - Navigate to Response Plans

### 3. **Incident Intelligence Page**
After synthesis completes:
- Shows all active incidents in the left panel
- Each incident includes:
  - Unique ID (e.g., `INC-2026-081234-1`)
  - Title and summary
  - Severity (CRITICAL, HIGH, MEDIUM)
  - Confidence score
  - Ward location
  - Contributing agents
  - Affected departments
  - Evidence IDs
  - Recommended actions

- Click an incident to view detailed analysis in the right panel

### 4. **Response Plans Page**
After synthesis completes:
- Shows "Coordinated Response Plan (CRP)" header
- Status: "Awaiting Human Review"
- Displays synthesized departmental actions with:
  - Department assignments
  - Priority levels (CRITICAL, HIGH, MEDIUM, LOW)
  - Resource counts
  - Risk impact calculations
  - Evidence IDs linking back to agent findings

**Zone Counselor Actions**:
- Edit action parameters (priority, resource count, recommendation text)
- Toggle actions ON/OFF
- Observe real-time dynamic risk projection
- **Approve & Dispatch Work Orders** - Sends to department dashboards
- Request Changes - Flag for adjustments
- Dismiss - Reject the plan

### 5. **Department Dashboards**
After Zone Counselor approves plan:
- Work orders dispatched to relevant department dashboards
- Each department sees only their assigned tasks
- Department officials can:
  - Update task status (Assigned → In Progress → Completed)
  - Add field logs and progress notes
  - View real-time telemetry

### 6. **Live Updates via WebSocket**
All changes broadcast in real-time:
- Plan approval → All laptops notified
- Work order status updates → Zone Counselor sees progress
- Department logs → Visible on command center

## Key State Management

### CityContext State Variables
```javascript
// Incidents (populated by Agent Council)
const [incidents, setIncidents] = useState([]);
const [selectedIncident, setSelectedIncident] = useState(null);

// Response Plan
const [planStatus, setPlanStatus] = useState('no_run_yet');
const [planActions, setPlanActions] = useState([]);

// Department Tasks (populated on approval)
const [departmentTasks, setDepartmentTasks] = useState([]);
```

### Socket Events
- `planGenerated` - Backend synthesizes plan and incidents
- `planApproved` - Zone Counselor approves
- `workOrdersDispatched` - Tasks sent to departments
- `workOrderUpdated` - Department updates status
- `workOrderLogAdded` - Field logs added

## Backend Integration

### API Endpoints Used
1. **POST** `/api/planner/synthesise`
   - Input: Agent findings (array of JSON objects)
   - Output: Risks array with cascade analysis

2. **POST** `/api/plan/approve`
   - Input: Operator note, actions, risk score
   - Output: Dispatches work orders to departments

3. **PUT** `/api/work-orders/:taskId/status`
   - Input: New status, author, note
   - Output: Updated work order

4. **POST** `/api/work-orders/:taskId/logs`
   - Input: Author, note text
   - Output: Adds log entry

## Example Flow Walkthrough

### Step-by-Step: From Synthesis to Approval

1. **Zone Counselor opens Agent Council**
   - Page shows empty topology with 6 agent nodes

2. **Load Sample Data**
   - Click "Load Sample Data" button
   - 6 agent findings loaded (weather: 118mm/hr rainfall, water: sump overflow, etc.)
   - Topology animates showing agents "ready"

3. **Synthesise**
   - Click "Synthesise" button
   - Animated data packets flow from agents → planner
   - Planner processes for ~5 seconds
   - 3 risk cards appear:
     - CRITICAL: Hospital access endangered
     - HIGH: Traffic gridlock imminent  
     - HIGH: Water infrastructure failure

4. **Navigate to Incidents**
   - Click "View Incidents →" button
   - Incident Intelligence page opens
   - 3 active incidents listed in left panel
   - Click incident to see detailed cascade analysis

5. **Navigate to Response Plans**
   - Click "Review Response Plan →" button
   - Response Plans page opens
   - Shows 3-4 department actions:
     - Water: Deploy mobile pumps
     - Traffic: Activate signal override
     - Emergency: Clear hospital corridor
     - Public Info: Issue citizen alerts

6. **Customize Plan**
   - Click "EDIT ACTION" on any action
   - Adjust priority or resource count
   - Observe dynamic risk score change in real-time

7. **Approve Plan**
   - Click "APPROVE & DISPATCH WORK ORDERS"
   - Confirm in modal dialog
   - Status changes to "APPROVED BY ICCC OPERATOR"
   - Work orders dispatched to 4 department dashboards

8. **Department Receives Work Order**
   - Department official (Laptop B) sees new task
   - Updates status to "In Progress"
   - Adds field log: "Pump unit deployed at Station 4B"

9. **Zone Counselor Sees Progress**
   - Response Plans page shows live execution tracker
   - Progress bar advances
   - Task cards update with department logs in real-time

## Testing the Flow

### Quick Test Steps
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Login as Zone Counselor
4. Navigate to Agent Council
5. Click "Load Sample Data"
6. Click "Synthesise"
7. Wait for risks to appear
8. Click "View Incidents →"
9. Verify 3 incidents appear
10. Navigate to Response Plans
11. Verify plan shows "Awaiting Human Review"
12. Click "Approve & Dispatch"
13. Verify status changes to "APPROVED"

### Multi-Laptop Testing
1. **Laptop A (Zone Counselor)**:
   - Complete steps 1-12 above

2. **Laptop B (Department Official)**:
   - Open same backend URL
   - Login as department user
   - Navigate to Department Dashboard
   - Should see work orders appear automatically

3. **Laptop B Actions**:
   - Click "Start Work Order"
   - Add progress log
   - Mark complete

4. **Laptop A Observes**:
   - Should see real-time updates
   - Progress bars advance
   - Logs appear without refresh

## Troubleshooting

### Incidents Not Appearing
- Check browser console for errors
- Verify Agent Council synthesis completed successfully
- Check `incidents` state in React DevTools

### Response Plan Empty
- Verify `planActions` state populated after synthesis
- Check `planStatus` is not 'no_run_yet'

### Work Orders Not Dispatching
- Verify backend is running and WebSocket connected
- Check Network tab for failed API calls
- Verify socketConnected state is `true`

### Real-time Updates Not Working
- Check WebSocket connection in Network tab
- Verify both laptops use same `backendUrl`
- Check for CORS issues in browser console

## Future Enhancements
- [ ] Persist incidents to MongoDB
- [ ] Add incident resolution workflow
- [ ] Link incidents to specific map markers
- [ ] Add incident timeline/history view
- [ ] Generate incident reports (PDF export)
- [ ] Add incident severity escalation rules
