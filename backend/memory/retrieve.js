/**
 * Tag + keyword matching against the incident corpus. No embeddings, no
 * vector DB — plain string/set overlap, deterministic and fast.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INCIDENTS_PATH = path.join(__dirname, 'incidents.json');
const incidents = JSON.parse(fs.readFileSync(INCIDENTS_PATH, 'utf-8'));

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
}

function searchableText(incident) {
  return [incident.title, incident.conditions, incident.outcomeSummary, incident.lessonLearned, ...(incident.tags || [])]
    .join(' ')
    .toLowerCase();
}

/**
 * query: { tags?: string[], text?: string, topK?: number }
 * Returns hits sorted by similarity desc, each with a 0-1 similarity score.
 */
export function retrieveMemories(query = {}) {
  const queryTags = new Set((query.tags || []).map((t) => t.toLowerCase()));
  const queryWords = tokenize(query.text);
  const topK = query.topK ?? 3;

  const scored = incidents.map((incident) => {
    const incidentTags = new Set((incident.tags || []).map((t) => t.toLowerCase()));
    let tagOverlap = 0;
    for (const t of queryTags) if (incidentTags.has(t)) tagOverlap += 1;

    const haystack = searchableText(incident);
    let keywordHits = 0;
    for (const w of queryWords) if (haystack.includes(w)) keywordHits += 1;

    // Weighted, capped 0-1: tags are a stronger signal than free-text keyword hits.
    const tagScore = queryTags.size > 0 ? tagOverlap / queryTags.size : 0;
    const keywordScore = queryWords.length > 0 ? keywordHits / queryWords.length : 0;
    const similarity = Math.min(1, tagScore * 0.7 + keywordScore * 0.3);

    return { incident, similarity, tagOverlap, keywordHits };
  });

  return scored
    .filter((s) => s.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map((s) => ({
      id: s.incident.id,
      title: s.incident.title,
      date: s.incident.date,
      outcome: s.incident.outcome,
      outcomeSummary: s.incident.outcomeSummary,
      lessonLearned: s.incident.lessonLearned,
      riskReductionPct: s.incident.riskReductionPct,
      tags: s.incident.tags,
      similarity: Number(s.similarity.toFixed(2))
    }));
}

export function getAllIncidents() {
  return incidents;
}
