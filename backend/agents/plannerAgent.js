/**
 * Planner Agent Module
 * Role: Multi-Agent Consensus & Coordinated Plan Synthesis
 */

import { weatherAgent } from "./weatherAgent.js";
import { waterAgent } from "./waterAgent.js";
import { trafficAgent } from "./trafficAgent.js";
import { emergencyAgent } from "./emergencyAgent.js";
import { citizenAgent } from "./citizenAgent.js";
import { memoryAgent } from "./memoryAgent.js";

export const plannerAgent = {
  id: "planner",
  name: "Planner Agent",
  role: "Multi-Agent Consensus & Coordinated Plan Synthesis",
  status: "ACTIVE",
  avatar: "Cpu",
  color: "#ec4899",
  confidence: 95,
  synthesizePlan(incident) {
    const weatherRes = weatherAgent.analyzeIncident(incident);
    const waterRes = waterAgent.analyzeIncident(incident);
    const trafficRes = trafficAgent.analyzeIncident(incident);
    const emergencyRes = emergencyAgent.analyzeIncident(incident);
    const citizenRes = citizenAgent.analyzeIncident(incident);
    const memoryRes = memoryAgent.analyzeIncident(incident);

    return {
      incidentId: incident?.id || "INC-2026-081",
      title: "Ward 18 Hospital Corridor Coordinated Emergency Mitigation",
      riskScorePre: 92,
      riskScorePost: 41,
      confidence: 94,
      consensusScore: "95%",
      actions: [
        {
          id: "act-1",
          departmentId: "water",
          department: "Water Resources & Drainage",
          deptIcon: "Droplets",
          enabled: true,
          priority: "HIGH",
          baseRiskImpact: 22,
          resourceUnits: "2 Mobile Pumps",
          resourceCount: 2,
          recommendation: waterRes.recommendation,
          reason: waterAgent.getTelemetry().observation,
          confidence: "96%",
          expectedImpact: "Reduces water accumulation by 65% in 20 minutes; lowers flood risk score by 22 pts."
        },
        {
          id: "act-2",
          departmentId: "traffic",
          department: "Traffic Management Bureau",
          deptIcon: "Car",
          enabled: true,
          priority: "HIGH",
          baseRiskImpact: 15,
          resourceUnits: "Route B Green-Wave Sync",
          resourceCount: 1,
          recommendation: trafficRes.recommendation,
          reason: trafficAgent.getTelemetry().observation,
          confidence: "94%",
          expectedImpact: "Clears 80% of non-essential traffic away from hospital corridor within 8 minutes."
        },
        {
          id: "act-3",
          departmentId: "emergency",
          department: "Emergency Services (108)",
          deptIcon: "Ambulance",
          enabled: true,
          priority: "CRITICAL",
          baseRiskImpact: 10,
          resourceUnits: "3 Ambulances Rerouted",
          resourceCount: 3,
          recommendation: emergencyRes.recommendation,
          reason: emergencyAgent.getTelemetry().observation,
          confidence: "98%",
          expectedImpact: "Guarantees direct ER access in 11 minutes (saving 18 minutes of transit time)."
        },
        {
          id: "act-4",
          departmentId: "public",
          department: "Public Information & Advisory",
          deptIcon: "Radio",
          enabled: true,
          priority: "MEDIUM",
          baseRiskImpact: 4,
          resourceUnits: "Zone SMS Broadcast",
          resourceCount: 1,
          recommendation: citizenRes.recommendation,
          reason: citizenAgent.getTelemetry().observation,
          confidence: "88%",
          expectedImpact: "Diverts approximately 35% of incoming commuter traffic."
        }
      ]
    };
  }
};
