/**
 * desmosLoader — lazy, one-time loader for the Desmos calculator API
 * (same pattern as katexLoader: shared promise, retry after failure).
 *
 * Usage:
 *   loadDesmos().then((Desmos) => Desmos.GraphingCalculator(el, opts))
 *
 * The API key can be overridden with REACT_APP_DESMOS_API_KEY in .env.
 * The default is Desmos' public demo key, which is fine for development —
 * for production, request a (free for education) key at desmos.com/api.
 */

const DESMOS_VERSION = 'v1.11';
// Desmos' published demo key — replace via env for production use.
const DESMOS_DEMO_KEY = 'dcb31709b452b1cf9dc26972add0fda6';

const DESMOS_API_KEY =
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_DESMOS_API_KEY) ||
  DESMOS_DEMO_KEY;

const DESMOS_SRC = `https://www.desmos.com/api/${DESMOS_VERSION}/calculator.js?apiKey=${DESMOS_API_KEY}`;

let loaderPromise = null;

/**
 * Loads the Desmos API script once and resolves with the global `Desmos`.
 * @returns {Promise<object>}
 */
export function loadDesmos() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Desmos requires a browser environment'));
  }
  if (window.Desmos) {
    return Promise.resolve(window.Desmos);
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${DESMOS_SRC}"]`);
      const script = existing || document.createElement('script');

      const onLoad = () => {
        if (window.Desmos) {
          resolve(window.Desmos);
        } else {
          reject(new Error('Desmos did not initialize'));
        }
      };
      const onError = () => {
        // Remove the dead tag so a retry can inject a fresh one.
        script.remove();
        reject(new Error('Failed to load the Desmos calculator'));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      if (!existing) {
        script.src = DESMOS_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
    }).catch((err) => {
      // Reset so a later attempt can retry (e.g., network recovered).
      loaderPromise = null;
      throw err;
    });
  }
  return loaderPromise;
}
