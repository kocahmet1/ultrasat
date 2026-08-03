/**
 * katexLoader — lazy, one-time loader for KaTeX (JS + CSS + auto-render
 * extension) from the jsDelivr CDN. No npm dependency on purpose.
 *
 * Usage:
 *   loadKatexAutoRender().then((renderMathInElement) => renderMathInElement(el, opts))
 *
 * The promise is shared across all callers, so the assets are fetched at most
 * once per page load. On CDN failure the promise rejects (and resets so a
 * later mount may retry) — callers should degrade to plain text.
 */

const KATEX_VERSION = '0.16.9';
const KATEX_BASE = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist`;

let loaderPromise = null;

function injectStylesheet(href) {
  if (document.querySelector(`link[data-katex-css="true"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.crossOrigin = 'anonymous';
  link.setAttribute('data-katex-css', 'true');
  document.head.appendChild(link);
}

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute('data-katex-loaded') === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('load', () => {
      script.setAttribute('data-katex-loaded', 'true');
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
}

/**
 * Loads KaTeX core + auto-render extension once and resolves with the global
 * `renderMathInElement` function.
 * @returns {Promise<Function>}
 */
export function loadKatexAutoRender() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('KaTeX requires a browser environment'));
  }
  if (typeof window.renderMathInElement === 'function') {
    return Promise.resolve(window.renderMathInElement);
  }
  if (!loaderPromise) {
    loaderPromise = (async () => {
      injectStylesheet(`${KATEX_BASE}/katex.min.css`);
      await injectScript(`${KATEX_BASE}/katex.min.js`);
      await injectScript(`${KATEX_BASE}/contrib/auto-render.min.js`);
      if (typeof window.renderMathInElement !== 'function') {
        throw new Error('KaTeX auto-render did not initialize');
      }
      return window.renderMathInElement;
    })().catch((err) => {
      // Reset so a later mount can retry (e.g., flaky network recovered).
      loaderPromise = null;
      throw err;
    });
  }
  return loaderPromise;
}

/**
 * Quick check used to avoid fetching KaTeX for text with no math in it.
 * @param {string} text
 * @returns {boolean}
 */
export function containsMathDelimiters(text) {
  return typeof text === 'string' && /\$|\\\(|\\\[/.test(text);
}
