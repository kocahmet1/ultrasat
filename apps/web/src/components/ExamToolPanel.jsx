import React, { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import '../styles/ExamToolPanels.css';

/**
 * ExamToolPanel — shared floating, draggable window used by the in-exam
 * math tools (Desmos calculator, reference sheet), styled after Bluebook.
 *
 * Behavior notes:
 *  - The panel stays MOUNTED while closed (display:none) so tool state —
 *    e.g. typed Desmos expressions — survives close/reopen within a module.
 *  - Drag by the header (pointer events, works with touch); position is
 *    clamped so the header always stays reachable.
 *  - Clicking anywhere on a panel brings it above the other panel.
 */

// Shared, ever-increasing z-index so the most recently touched panel wins.
let topZ = 1200;
const nextZ = () => ++topZ;

const clampValue = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

const EDGE_VISIBLE_PX = 72; // keep at least this much of the panel on-screen

function ExamToolPanel({
  title,
  isOpen,
  onClose,
  width,
  height,
  defaultPosition, // ({ vw, vh, w }) => ({ x, y })  or  { x, y }
  headerContent = null, // rendered on the left of the header (e.g. tabs)
  headerRight = null, // extra header buttons (e.g. Expand), before Close
  dark = false, // dark header variant (reference sheet)
  className = '',
  children,
}) {
  const panelRef = useRef(null);
  const dragState = useRef(null);
  const openedOnce = useRef(false);
  const [pos, setPos] = useState(null);
  const [zIndex, setZIndex] = useState(() => nextZ());

  // First open: compute the initial position (clamped to the viewport).
  useEffect(() => {
    if (!isOpen || openedOnce.current) return;
    openedOnce.current = true;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = panelRef.current?.offsetWidth || width;
    const wanted =
      typeof defaultPosition === 'function'
        ? defaultPosition({ vw, vh, w })
        : defaultPosition || { x: 18, y: 86 };
    setPos({
      x: clampValue(wanted.x, 6, vw - Math.min(w, vw) - 6),
      y: clampValue(wanted.y, 6, vh - 120),
    });
    setZIndex(nextZ());
  }, [isOpen, defaultPosition, width]);

  // Bring to front every time the panel is (re)opened.
  useEffect(() => {
    if (isOpen) setZIndex(nextZ());
  }, [isOpen]);

  // When the viewport or the panel size changes (Expand/Shrink, window
  // resize), pull the panel fully back into view.
  useEffect(() => {
    if (!isOpen) return undefined;
    const reclamp = () => {
      setPos((current) => {
        if (!current) return current;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = panelRef.current?.offsetWidth || width;
        const h = panelRef.current?.offsetHeight || height;
        return {
          x: clampValue(current.x, 6, Math.max(6, vw - w - 6)),
          y: clampValue(current.y, 6, Math.max(6, vh - h - 6)),
        };
      });
    };
    // Wait a frame so offsetWidth/Height reflect the new size first.
    const frame = requestAnimationFrame(reclamp);
    window.addEventListener('resize', reclamp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', reclamp);
    };
  }, [isOpen, width, height]);

  const handleDragStart = (event) => {
    // Left button / touch only, and never when pressing a header control.
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('button, a, input, select')) return;
    const rect = panelRef.current.getBoundingClientRect();
    dragState.current = {
      pointerId: event.pointerId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (e) {
      /* pointer capture unsupported — dragging still works while inside */
    }
  };

  const handleDragMove = (event) => {
    const state = dragState.current;
    if (!state || event.pointerId !== state.pointerId) return;
    event.preventDefault();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = panelRef.current?.offsetWidth || width;
    setPos({
      x: clampValue(event.clientX - state.dx, -(w - EDGE_VISIBLE_PX), vw - EDGE_VISIBLE_PX),
      y: clampValue(event.clientY - state.dy, 0, vh - 56),
    });
  };

  const handleDragEnd = (event) => {
    if (dragState.current && dragState.current.pointerId === event.pointerId) {
      dragState.current = null;
    }
  };

  return (
    <div
      ref={panelRef}
      className={`exam-tool-panel ${dark ? 'etp-dark' : ''} ${className}`}
      role="dialog"
      aria-label={title}
      style={{
        display: isOpen ? 'flex' : 'none',
        left: pos ? pos.x : 18,
        top: pos ? pos.y : 86,
        zIndex,
        width: `min(${width}px, calc(100vw - 12px))`,
        height: `min(${height}px, calc(100vh - 96px))`,
      }}
      onPointerDownCapture={() => setZIndex(nextZ())}
    >
      <div
        className="etp-header"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="etp-header-side etp-header-left">
          {headerContent || <span className="etp-title">{title}</span>}
        </div>
        <div className="etp-drag-dots" aria-hidden="true">
          <span /><span /><span />
          <span /><span /><span />
        </div>
        <div className="etp-header-side etp-header-right">
          {headerRight}
          <button
            type="button"
            className="etp-icon-btn etp-close-btn"
            onClick={onClose}
            aria-label={`Close ${title}`}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="etp-body">{children}</div>
    </div>
  );
}

export default ExamToolPanel;
