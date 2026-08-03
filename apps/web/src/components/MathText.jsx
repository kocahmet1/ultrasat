import React, { useEffect, useRef } from 'react';
import { processTextMarkup } from '../utils/textProcessing';
import { loadKatexAutoRender, containsMathDelimiters } from '../utils/katexLoader';

/**
 * MathText — renders a string, auto-rendering any LaTeX inside $...$, $$...$$,
 * \( \) or \[ \] delimiters via KaTeX (lazy-loaded from CDN on first use).
 *
 * - No math in the string: no CDN request is made at all.
 * - CDN unavailable: degrades silently to the plain text.
 * - Also applies the app's existing [UNDERLINED]/[u] markup processing so
 *   explanations render the same way question text does.
 *
 * Props: { text: string|string[], className?: string, block?: boolean }
 * (block=true renders a div instead of a span).
 */
export default function MathText({ text, className = '', block = false }) {
  const containerRef = useRef(null);
  const content = Array.isArray(text) ? text.join('\n') : (text == null ? '' : String(text));

  useEffect(() => {
    if (!containerRef.current || !containsMathDelimiters(content)) return undefined;
    let cancelled = false;

    loadKatexAutoRender()
      .then((renderMathInElement) => {
        if (cancelled || !containerRef.current) return;
        try {
          renderMathInElement(containerRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        } catch (err) {
          // Malformed TeX or renderer hiccup — the plain text is already shown.
        }
      })
      .catch(() => {
        // CDN failed to load — keep the plain text fallback.
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  const Tag = block ? 'div' : 'span';
  return (
    <Tag
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: processTextMarkup(content) }}
    />
  );
}
