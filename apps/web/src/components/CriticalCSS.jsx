import { useEffect } from 'react';

/**
 * CriticalCSS (design overhaul, Phase G).
 *
 * The old version of this component was a major source of site-wide visual
 * inconsistency:
 *   1. It injected a global `button { padding: .75rem 1.5rem; ... }` and an
 *      Inter body font that fought the V3 token design on every page.
 *   2. It lazy-injected six retired stylesheets (old Dashboard.css, old
 *      LandingPage.css, ProgressDashboard.css, ...) as <link> tags AFTER the
 *      app's real styles, resurrecting the legacy palette over the new one.
 *
 * It now injects only genuinely critical, token-aligned boot styles (loading
 * spinner + body baseline) and nothing else. Page CSS is owned by the pages
 * themselves via their imports; the design system lives in styles/tokens.css
 * and styles/ut-kit.css.
 */
const criticalCSS = `
  body {
    margin: 0;
    padding: 0;
    font-family: var(--ut-font-body, 'Schibsted Grotesk', system-ui, sans-serif);
    background: var(--ut-bg, #F4F6F9);
    color: var(--ut-text, #16202F);
    line-height: 1.6;
  }

  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid var(--ut-rule, #DCE1E9);
    border-top: 3px solid var(--ut-accent, #2B59D8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CriticalCSS = () => {
  useEffect(() => {
    const criticalStyle = document.createElement('style');
    criticalStyle.textContent = criticalCSS;
    criticalStyle.setAttribute('data-critical', 'true');
    document.head.insertBefore(criticalStyle, document.head.firstChild);

    return () => {
      const criticalStyleEl = document.querySelector('style[data-critical="true"]');
      if (criticalStyleEl) {
        criticalStyleEl.remove();
      }
    };
  }, []);

  return null;
};

export default CriticalCSS;
