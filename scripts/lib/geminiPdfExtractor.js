/**
 * DEPRECATED — Gemini PDF extraction has been retired.
 *
 * All AI on this site now runs on OpenAI gpt-5.6-luna (see
 * apps/api/config/aiModel.js). This module is kept only so that any older
 * import path keeps working; it delegates straight to the OpenAI implementation
 * in ./openaiPdfExtractor.js with an identical signature.
 *
 *   extractFromPdf(pdfPath, { apiKey, model, maxRetries })
 *
 * NOTE: options.apiKey is now an OPENAI_API_KEY, not a Gemini key.
 */

const { extractFromPdf: extractWithOpenAI } = require('./openaiPdfExtractor');

let warned = false;
function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    '[geminiPdfExtractor] DEPRECATED: Gemini extraction was removed. ' +
      'Delegating to openaiPdfExtractor (gpt-5.6-luna). ' +
      'Pass an OpenAI API key via options.apiKey / OPENAI_API_KEY.'
  );
}

async function extractFromPdf(pdfPath, options = {}) {
  warnOnce();
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  // A Gemini-style model id from an old caller must not be forwarded to OpenAI.
  const model = /^gemini/i.test(options.model || '') ? undefined : options.model;
  return extractWithOpenAI(pdfPath, {
    ...options,
    apiKey,
    ...(model ? { model } : {}),
  });
}

module.exports = { extractFromPdf };
