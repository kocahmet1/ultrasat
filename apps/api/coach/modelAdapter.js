/**
 * AI Coach — provider-agnostic model adapter.
 *
 * One interface, selected per ROLE via environment, all called through plain
 * fetch (no SDK lock-in):
 *
 *   COACH_PRIMARY_PROVIDER=openai|anthropic          (default: openai)
 *   COACH_PRIMARY_MODEL=<model id>                   (default: gpt-5.6-luna)
 *   COACH_PRIMARY_REASONING_EFFORT=<effort>          (default: low)
 *   COACH_CLASSIFIER_PROVIDER / COACH_CLASSIFIER_MODEL (default: primary's provider)
 *   COACH_CLASSIFIER_REASONING_EFFORT=<effort>       (default: low)
 *
 * REASONING EFFORT: the coach is an interactive chat surface, so it defaults to
 * `low` rather than the site-wide `high` (AI_REASONING_EFFORT). OpenAI's own
 * guidance names `low` as the right tier for "customer support / chat assistant
 * workflows" and `high` for agentic coding and long-horizon research — the
 * coach wants a warm 2-4 sentence reply fast, not deep deliberation. Analytical
 * coach features (debrief, micro-lesson, observer) pass a higher per-call
 * effort; batch/offline jobs like exam quality control are untouched and keep
 * the site-wide `high`.
 *
 * Keys: OPENAI_API_KEY / ANTHROPIC_API_KEY
 *
 * NOTE: the Gemini provider was retired — all coach text generation now runs on
 * OpenAI gpt-5.6-luna. `provider=gemini` is still accepted for backwards
 * compatibility with existing deployments but is transparently served by OpenAI.
 *
 * v1 is non-streaming and uses JSON-mode outputs instead of native tool-calling
 * so behavior is uniform across providers. Streaming can be layered onto this
 * interface later without touching callers.
 *
 * complete(role, { system, messages, maxTokens, json }) ->
 *   { text, usage: { inputTokens, outputTokens }, provider, model }
 */

const {
  resolveModel,
  resolveReasoningEffort,
  outputTokenBudget,
} = require('../config/aiModel');

const VALID_EFFORTS = ['minimal', 'low', 'medium', 'high'];

/**
 * Per-role effort default. Falls back to `low` for the coach specifically —
 * NOT to the site-wide AI_REASONING_EFFORT — because every coach role is
 * latency-sensitive. Env vars still win.
 */
function roleEffort(envVar, fallback = 'low') {
  const configured = (process.env[envVar] || '').trim().toLowerCase();
  if (configured) return resolveReasoningEffort(envVar);
  return fallback;
}

/** Normalize a caller-supplied effort, ignoring junk. */
function normalizeEffort(effort) {
  const e = String(effort || '').trim().toLowerCase();
  if (VALID_EFFORTS.includes(e)) return e;
  // Sol-era values fold down; anything else is ignored by the caller.
  if (e === 'max' || e === 'xhigh') return 'high';
  return null;
}

// A legacy `gemini` provider value now resolves to OpenAI.
function normalizeProvider(provider) {
  const p = (provider || 'openai').toLowerCase();
  if (p === 'gemini' || p === 'google') return 'openai';
  return p;
}

const ROLE_DEFAULTS = {
  primary: {
    provider: normalizeProvider(process.env.COACH_PRIMARY_PROVIDER || 'openai'),
    model: resolveModel('COACH_PRIMARY_MODEL'),
    effort: roleEffort('COACH_PRIMARY_REASONING_EFFORT'),
    maxTokens: outputTokenBudget(process.env.COACH_PRIMARY_MAX_TOKENS || '1200'),
  },
  classifier: {
    provider: normalizeProvider(
      process.env.COACH_CLASSIFIER_PROVIDER || process.env.COACH_PRIMARY_PROVIDER || 'openai'
    ),
    model: resolveModel('COACH_CLASSIFIER_MODEL', 'COACH_PRIMARY_MODEL'),
    // Classification is explicitly a low-effort workload per OpenAI guidance.
    effort: roleEffort('COACH_CLASSIFIER_REASONING_EFFORT'),
    maxTokens: outputTokenBudget(process.env.COACH_CLASSIFIER_MAX_TOKENS || '600'),
  },
};

function apiKeyFor(provider) {
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY;
  return null;
}

function isConfigured(role = 'primary') {
  const cfg = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.primary;
  return !!apiKeyFor(cfg.provider);
}

async function callOpenAI({ model, system, messages, maxTokens, json, apiKey, effort }) {
  const body = {
    model,
    messages: [
      ...(system ? [{ role: 'system', content: system }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_completion_tokens: maxTokens,
    // gpt-5.6-luna is a reasoning model; Chat Completions takes the effort
    // as a top-level `reasoning_effort` field.
    reasoning_effort: effort,
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content || '',
    usage: {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    },
  };
}

async function callAnthropic({ model, system, messages, maxTokens, json, apiKey }) {
  const body = {
    model,
    max_tokens: maxTokens,
    system: json
      ? `${system || ''}\n\nRespond with a single valid JSON object and nothing else.`.trim()
      : system || undefined,
    messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return {
    text: (data.content || []).map((b) => b.text || '').join(''),
    usage: {
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
    },
  };
}

const PROVIDERS = { openai: callOpenAI, anthropic: callAnthropic };

/**
 * @param {'primary'|'classifier'} role
 * @param {{
 *   system?: string,
 *   messages: Array<{role: 'user'|'assistant', content: string}>,
 *   maxTokens?: number,
 *   json?: boolean,
 *   effort?: 'minimal'|'low'|'medium'|'high'
 * }} opts - `effort` overrides the role default for this call only. Use it to
 *   let analytical features (debrief, micro-lesson, observer) think harder than
 *   interactive chat without changing the role-wide default.
 */
async function complete(role, opts) {
  const cfg = ROLE_DEFAULTS[role] || ROLE_DEFAULTS.primary;
  const apiKey = apiKeyFor(cfg.provider);
  if (!apiKey) throw new Error(`No API key configured for coach ${role} provider "${cfg.provider}"`);
  const call = PROVIDERS[cfg.provider];
  if (!call) throw new Error(`Unknown coach provider "${cfg.provider}"`);

  const effort = normalizeEffort(opts.effort) || cfg.effort;

  const result = await call({
    model: cfg.model,
    system: opts.system,
    messages: opts.messages || [],
    maxTokens: outputTokenBudget(opts.maxTokens || cfg.maxTokens),
    json: !!opts.json,
    apiKey,
    effort,
  });
  return { ...result, provider: cfg.provider, model: cfg.model, effort };
}

/** Parse a JSON-mode response defensively (models occasionally wrap in fences). */
function parseJsonResponse(text) {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

module.exports = { complete, isConfigured, parseJsonResponse, ROLE_DEFAULTS };
