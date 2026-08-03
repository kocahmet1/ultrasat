/**
 * DEPRECATED — Gemini validation has been retired.
 *
 * All AI on this site now runs on OpenAI gpt-5.6-luna (see
 * apps/api/config/aiModel.js). This module is kept only so that any older
 * import path keeps working; it delegates straight to the OpenAI implementation
 * in ./openaiValidator.js with identical signatures.
 *
 * NOTE: options.apiKey is now an OPENAI_API_KEY, not a Gemini key.
 */

const openaiValidator = require('./openaiValidator');

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    '[geminiValidator] DEPRECATED: Gemini validation was removed. ' +
      'Delegating to openaiValidator (gpt-5.6-luna). ' +
      'Pass an OpenAI API key via options.apiKey / OPENAI_API_KEY.'
  );
}

function normalizeOptions(options = {}) {
  const model = /^gemini/i.test(options.model || '') ? undefined : options.model;
  return {
    ...options,
    apiKey: options.apiKey || process.env.OPENAI_API_KEY,
    ...(model ? { model } : {}),
  };
}

async function validateExtraction(pdfPath, extractedData, options = {}) {
  warnOnce();
  return openaiValidator.validateExtraction(pdfPath, extractedData, normalizeOptions(options));
}

async function runValidationWithAutoFix(pdfPath, extractedData, options = {}) {
  warnOnce();
  return openaiValidator.runValidationWithAutoFix(pdfPath, extractedData, normalizeOptions(options));
}

// Pure function, no model involved — re-exported unchanged.
const { applyAutoFixes } = openaiValidator;

module.exports = { validateExtraction, applyAutoFixes, runValidationWithAutoFix };
