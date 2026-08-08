CivicMind AI

An autonomous multi-agent decision-support platform for smart city governance

Overview

CivicMind AI is a multi-agent system that continuously reasons across city department data — starting with water and traffic — to detect emerging risks before they escalate into crises. Rather than acting autonomously on every decision, the system generates explainable, confidence-scored recommendations for government officials, who retain full authority to approve or reject each action.

Built around a real, recurring problem: Chennai's monsoon flooding regularly exposes how disconnected city departments respond reactively — after complaints, after failures, after the damage is done — instead of proactively, because no single department has visibility into what the others are seeing.

The Problem

City departments (Water, Traffic, Power, Waste, Safety) operate in silos. A flood-prone underpass floods every monsoon, but Traffic doesn't know drainage capacity is critically low, and Water doesn't know an ambulance route runs directly through it. By the time anyone connects the dots, the response is already delayed.

How It Works
Data ingestion — simulated live feeds for rainfall, water levels, and traffic congestion (architecture supports swapping in real IoT/API sources)
Agent analysis — the Water Agent and Traffic Agent independently assess risk within their domain
Coordinator reasoning — the Coordinator Agent cross-references current conditions against a causal memory graph of past incidents (e.g. "this junction flooded in 2024 under similar conditions")
Confidence-gated decision — if confidence is high, the system flags the action as auto-approvable; if uncertain, it escalates to a human official with full reasoning attached
Human review — officials see the recommendation, the supporting evidence, the confidence score, and approve or reject
What Makes This Different
Confidence-gated autonomy, not blanket automation — the system knows when to defer to a human instead of guessing
Causal memory, not just live sensors — reasoning is grounded in what actually happened before, not just current thresholds
Visible trade-offs, not a black box — when agents disagree (e.g. keep a route open vs. close it for safety), the reasoning behind the resolution is shown, not hidden
Current Scope

This build implements 3 agents — Water, Traffic, and Coordinator — around a single scenario: monsoon flood response in a Chennai ward. Power, Waste, Safety, and Citizen Voice agents are scoped for future phases, not built in this version. Sensor data is simulated and clearly labeled as such.

Tech Stack
Layer	Technology
Agent orchestration	LangGraph
Backend	FastAPI
Memory / causal graph	Neo4j
Structured data	PostgreSQL
Caching	Redis
Frontend	React, Leaflet/Mapbox, Recharts
Reasoning	RAG-grounded LLM (Ollama)
