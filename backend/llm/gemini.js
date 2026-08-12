/**
 * Single LLM access point. Every agent/planner call goes through callGemini()
 * so caching, DEMO_MODE, retry/backoff, and fallback behavior are enforced
 * in exactly one place.
 *
 * Contract: a failed or unavailable LLM call must NEVER throw out of this
 * module — it always resolves to { data, fallback: true, fallbackReason }
 * so the orchestrator can keep the run alive and show degraded confidence
 * instead of crashing.
 *
 * Provider-swappable via env (emergency lever only — Gemini is the tested,
 * intended provider; Grok and DeepSeek are untested here). Gemini, Grok, and
 * DeepSeek all expose an OpenAI-compatible chat/completions endpoint, so
 * this file talks plain HTTP to that shape instead of a provider SDK:
 *   LLM_BASE_URL    - e.g. https://api.x.ai/v1 or https://api.deepseek.com
 *   LLM_API_KEY     - provider API key (falls back to GEMINI_API_KEY)
 *   LLM_MODEL_FAST  - model id for domain agents
 *   LLM_MODEL_STRONG - model id for planner + critic
 * All four default to Gemini's own OpenAI-compat layer, so behavior is
 * unchanged unless these are explicitly set. NOTE: switching provider/model
 * invalidates the response cache — cache keys are derived from
 * (model, schema, prompt), so a different model id can never hit an
 * existing cache entry; this is expected, not a bug.
 */
// Must run before reading process.env below. ES module imports are hoisted
// and evaluated before any other top-level code in the importer, so calling
// dotenv.config() in server.js's own body is too late if something imported
// earlier in the chain (this module, transitively, via orchestrator/run.js)
// already read process.env at its own module-evaluation time. Importing
// 'dotenv/config' here — the first import in this file — runs its side
// effect before this module's own top-level code executes.
import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, '..', '.cache', 'llm');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const isDemoMode = () => process.env.DEMO_MODE === 'true';

const getBaseUrl = () => process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const getApiKey = () => process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
const getModelFast = () => process.env.LLM_MODEL_FAST || 'gemini-flash-latest';
const getModelStrong = () => process.env.LLM_MODEL_STRONG || 'gemini-flash-latest';

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
  console.warn(`[llm] falling back: ${reason}`);
  return {
    data: typeof fallback === 'function' ? fallback() : (fallback ?? null),
    tokenUsage: null,
    fromCache: false,
    fallback: true,
    fallbackReason: reason
  };
}

// The OpenAI chat-completions shape doesn't give every provider the same
// schema-constrained decoding Gemini's native SDK offered (response_format:
// json_object is looser than a real JSON Schema) — a provider can still wrap
// output in ```json fences or add leading/trailing prose. Strip fences, then
// fall back to the first balanced-looking {...} span if direct parse fails.
function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Could not extract a JSON object from the LLM response');
  }
}

/**
 * callGemini(prompt, schema, opts)
 *  - schema: a JSON-Schema-shaped object describing the expected output;
 *    included in the prompt as an instruction (see schemaInstruction below)
 *    since the OpenAI-compatible endpoint only guarantees "valid JSON", not
 *    schema conformance the way Gemini's native responseSchema param did.
 *  - opts.model: defaults to MODELS.FAST; pass MODELS.STRONG for planner/critic
 *  - opts.maxRetries: default 2 (so up to 3 attempts total)
 *  - opts.fallback: value or () => value used when the LLM is unavailable/fails
 */
export async function callGemini(prompt, schema, opts = {}) {
  // Dynamically reload environment variables on every request to pick up user's saved .env key without server restart
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ override: true });
  } catch (e) {
    // ignore
  }

  const demoMode = isDemoMode();
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();
  const model = opts.model === 'gemini-pro-latest' ? getModelStrong() : getModelFast();

  const maxRetries = opts.maxRetries ?? 2;
  const key = cacheKey(model, schema, prompt);

  const cached = readCache(key);
  if (cached) {
    // Cache-first regardless of DEMO_MODE: saves quota/cost and keeps demo runs reproducible.
    return { ...cached, fromCache: true };
  }

  if (demoMode) {
    // No cache hit and demo mode forbids network calls — degrade immediately, don't hang the run.
    return buildFallback(opts.fallback, 'DEMO_MODE=true with no cached response for this prompt');
  }

  if (!apiKey) {
    return buildFallback(opts.fallback, 'LLM_API_KEY/GEMINI_API_KEY not configured');
  }

  const schemaInstruction = schema
    ? `\n\nRespond with ONLY a single JSON object (no markdown code fences, no surrounding prose) matching this JSON Schema:\n${JSON.stringify(schema)}`
    : '\n\nRespond with ONLY a single JSON object (no markdown code fences, no surrounding prose).';

  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt + schemaInstruction }],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`HTTP ${res.status}: ${errBody}`);
      }

      const body = await res.json();
      const text = body.choices?.[0]?.message?.content;
      if (!text) throw new Error('No message content in LLM response');

      const parsed = extractJson(text);
      const usage = body.usage
        ? {
            promptTokenCount: body.usage.prompt_tokens,
            candidatesTokenCount: body.usage.completion_tokens,
            totalTokenCount: body.usage.total_tokens
          }
        : {};

      console.log(`[llm] model=${model} tokens prompt=${usage.promptTokenCount ?? '?'} candidates=${usage.candidatesTokenCount ?? '?'} total=${usage.totalTokenCount ?? '?'}`);

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

  return buildFallback(opts.fallback, lastError?.message || 'unknown LLM error');
}

export const MODELS = {
  FAST: 'gemini-flash-latest',
  STRONG: 'gemini-pro-latest'
};
