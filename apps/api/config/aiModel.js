/**
 * Central AI model configuration.
 * ---------------------------------------------------------------------------
 * Every text-generating AI call on the site resolves its model through this
 * module, so the whole application can be repointed from one place.
 *
 * Current target: OpenAI **gpt-5.6-luna** at **high** reasoning effort.
 *
 * gpt-5.6-luna facts that matter to callers (OpenAI model card, Jul 2026):
 *   - 1,050,000 token context window, 128,000 max output tokens
 *   - Reasoning model: it burns *output* tokens on hidden reasoning before it
 *     emits any visible text. See MIN_OUTPUT_TOKENS_WITH_REASONING below.
 *   - Input: text + image.  Output: text only.  Audio: NOT supported.
 *   - Supports: Responses API, Chat Completions, streaming, function calling,
 *     structured outputs (json_schema), prompt caching.
 *   - Does NOT support the `pro` reasoning mode (that is a gpt-5.6-sol feature).
 *
 * Deliberately NOT routed through here (they cannot run on Luna):
 *   - Realtime voice  -> apps/api/companionService.js (REALTIME_MODEL),
 *                        apps/web/src/hooks/useRealtimeVoice.js
 *                        Luna has no audio modality.
 *   - Lecture images  -> apps/web/src/scripts/generate_lecture_images.js
 *                        Luna is text-output only.
 *
 * Env overrides still work everywhere. If an operator sets e.g.
 * OPENAI_ASSISTANT_MODEL, that wins; otherwise the default below applies.
 */

/** Canonical model id for all text AI on the site. */
const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-luna';

/** Canonical reasoning effort. 'high' is Luna's documented reasoning tier. */
const AI_REASONING_EFFORT = process.env.AI_REASONING_EFFORT || 'high';

/**
 * Reasoning models spend output tokens on hidden reasoning BEFORE producing any
 * visible text. If reasoning exhausts max_output_tokens, the API returns
 * status 'incomplete' with incomplete_details.reason = 'max_output_tokens' and
 * NO visible output — you are billed for input + reasoning and get nothing back.
 *
 * The 750-1200 token budgets this codebase used for the old non-reasoning
 * models are far below the safe range. OpenAI recommends reserving at least
 * 25,000 tokens for reasoning + output on these models, so that is the floor.
 *
 * IMPORTANT: with reasoning models max_output_tokens is a SAFETY CEILING, not a
 * brevity control. Response length must be constrained by the prompt (e.g. the
 * coach system prompt's "2-4 sentences"), not by this number. Raising the floor
 * does not raise cost — you are billed for tokens generated, not for the cap.
 */
const MIN_OUTPUT_TOKENS_WITH_REASONING = parseInt(
  process.env.AI_MIN_OUTPUT_TOKENS || '25000',
  10
);

/** Luna's hard ceiling on output tokens. */
const MAX_OUTPUT_TOKENS_LIMIT = 128000;

/**
 * Resolve a model id, honouring legacy per-feature env vars first.
 * @param {...string} envVarNames - env vars to check, in priority order
 * @returns {string}
 */
function resolveModel(...envVarNames) {
  for (const name of envVarNames) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return AI_MODEL;
}

/**
 * Resolve a reasoning effort, honouring legacy per-feature env vars first.
 * Note: 'max' and 'ultra' are not valid Luna values and are folded to 'high'.
 * @param {...string} envVarNames
 * @returns {'minimal'|'low'|'medium'|'high'}
 */
function resolveReasoningEffort(...envVarNames) {
  const valid = new Set(['minimal', 'low', 'medium', 'high']);
  for (const name of envVarNames) {
    const value = (process.env[name] || '').trim().toLowerCase();
    if (!value) continue;
    if (valid.has(value)) return value;
    // 'max'/'ultra' were sol-era values; Luna tops out at 'high'.
    return 'high';
  }
  return valid.has(AI_REASONING_EFFORT) ? AI_REASONING_EFFORT : 'high';
}

/**
 * Build the `reasoning` block for a Responses API call.
 * @param {{ effort?: string, summary?: string }} [opts]
 */
function reasoningConfig(opts = {}) {
  const block = { effort: opts.effort || AI_REASONING_EFFORT };
  if (opts.summary) block.summary = opts.summary;
  return block;
}

/**
 * Clamp a max_output_tokens value so hidden reasoning tokens cannot starve the
 * visible answer, and so we never exceed the model ceiling.
 * @param {number} requested
 * @returns {number}
 */
function outputTokenBudget(requested) {
  const n = Number.parseInt(requested, 10);
  const base = Number.isFinite(n) && n > 0 ? n : MIN_OUTPUT_TOKENS_WITH_REASONING;
  return Math.min(
    Math.max(base, MIN_OUTPUT_TOKENS_WITH_REASONING),
    MAX_OUTPUT_TOKENS_LIMIT
  );
}

module.exports = {
  AI_MODEL,
  AI_REASONING_EFFORT,
  MIN_OUTPUT_TOKENS_WITH_REASONING,
  MAX_OUTPUT_TOKENS_LIMIT,
  resolveModel,
  resolveReasoningEffort,
  reasoningConfig,
  outputTokenBudget,
};
