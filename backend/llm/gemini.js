/**
 * Single Gemini access point. Every agent/planner/critic call goes through
 * callGemini() so caching, DEMO_MODE, retry/backoff, and fallback behavior
 * are enforced in exactly one place.
 *
 * Contract: a failed or unavailable Gemini call must NEVER throw out of this
 * module — it always resolves to { data, fallback: true, fallbackReason }
 * so the orchestrator can keep the run alive and show degraded confidence
 * instead of crashing.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, '..', '.cache', 'llm');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DEMO_MODE = process.env.DEMO_MODE === 'true';
const API_KEY = process.env.GEMINI_API_KEY;

let client = null;
function getClient() {
  if (!API_KEY) return null;
  if (!client) client = new GoogleGenerativeAI(API_KEY);
  return client;
}

function cacheKey(model, schema, prompt) {
  return crypto.createHash('sha256').update(`${model}::${JSON.stringify(schema)}::${prompt}`).digest('hex');
}
function cachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}
function readCache(key) {
  const p = cachePath(key);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}
function writeCache(key, value) {
  try {
    fs.writeFileSync(cachePath(key), JSON.stringify(value, null, 2));
  } catch {
    // cache is a convenience, never fatal
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildFallback(fallback, reason) {
  console.warn(`[gemini] falling back: ${reason}`);
  return {
    data: typeof fallback === 'function' ? fallback() : (fallback ?? null),
    tokenUsage: null,
    fromCache: false,
    fallback: true,
    fallbackReason: reason
  };
}

/**
 * callGemini(prompt, schema, opts)
 *  - schema: a Gemini responseSchema object enforcing structured JSON output
 *  - opts.model: defaults to a fast model; pass a stronger one for planner/critic
 *  - opts.maxRetries: default 2 (so up to 3 attempts total)
 *  - opts.fallback: value or () => value used when Gemini is unavailable/fails
 */
export async function callGemini(prompt, schema, opts = {}) {
  const model = opts.model || 'gemini-1.5-flash';
  const maxRetries = opts.maxRetries ?? 2;
  const key = cacheKey(model, schema, prompt);

  const cached = readCache(key);
  if (cached) {
    // Cache-first regardless of DEMO_MODE: saves quota/cost and keeps demo runs reproducible.
    return { ...cached, fromCache: true };
  }

  if (DEMO_MODE) {
    // No cache hit and demo mode forbids network calls — degrade immediately, don't hang the run.
    return buildFallback(opts.fallback, 'DEMO_MODE=true with no cached response for this prompt');
  }

  const genClient = getClient();
  if (!genClient) {
    return buildFallback(opts.fallback, 'GEMINI_API_KEY not configured');
  }

  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const generativeModel = genClient.getGenerativeModel({
        model,
        generationConfig: {
          responseMimeType: 'application/json',
          ...(schema ? { responseSchema: schema } : {})
        }
      });
      const result = await generativeModel.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const usage = result.response.usageMetadata || {};

      console.log(`[gemini] model=${model} tokens prompt=${usage.promptTokenCount ?? '?'} candidates=${usage.candidatesTokenCount ?? '?'} total=${usage.totalTokenCount ?? '?'}`);

      const response = { data: parsed, tokenUsage: usage, fromCache: false, fallback: false };
      writeCache(key, response);
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(300 * 2 ** attempt);
      }
    }
  }

  return buildFallback(opts.fallback, lastError?.message || 'unknown Gemini error');
}

export const MODELS = {
  FAST: 'gemini-1.5-flash', // domain agents
  STRONG: 'gemini-1.5-pro'  // planner + critic only
};
