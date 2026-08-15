import React, { useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ExamToolPanel from './ExamToolPanel';
import { loadDesmos } from '../utils/desmosLoader';

/**
 * CalculatorPanel — Bluebook-style floating Desmos calculator for math
 * modules, with Graphing and Scientific tabs (both keep their state while
 * the panel is closed, because the panel stays mounted for the whole
 * module — see ExamToolPanel).
 *
 * Desmos is loaded lazily the FIRST time the student opens the panel, so
 * Reading & Writing students and students who never open it pay nothing.
 */

const PANEL_SIZE = {
  normal: { width: 440, height: 610 },
  expanded: { width: 980, height: 720 },
};

function CalculatorPanel({ isOpen, onClose }) {
  const [mode, setMode] = useState('graphing'); // 'graphing' | 'scientific'
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [retryTick, setRetryTick] = useState(0);
  const graphingRef = useRef(null);
  const scientificRef = useRef(null);
  const bodyRef = useRef(null);
  const instancesRef = useRef({});
  const initStartedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  // Lazy-create the Desmos instances the first time the panel opens.
  // After a failure, initStartedRef is reset, so reopening the panel (or
  // the Try Again button, via retryTick) starts a fresh attempt.
  useEffect(() => {
    if (!isOpen || initStartedRef.current) return;
    initStartedRef.current = true;
    setStatus('loading');
    loadDesmos()
      .then((Desmos) => {
        if (!mountedRef.current) return;
        if (!instancesRef.current.graphing && graphingRef.current) {
          instancesRef.current.graphing = Desmos.GraphingCalculator(graphingRef.current, {
            border: false,
          });
        }
        if (!instancesRef.current.scientific && scientificRef.current) {
          instancesRef.current.scientific = Desmos.ScientificCalculator(scientificRef.current, {
            border: false,
          });
        }
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Desmos failed to load:', err);
        initStartedRef.current = false;
        if (mountedRef.current) setStatus('error');
      });
  }, [isOpen, retryTick]);

  // Destroy the calculators when the module unmounts.
  useEffect(
    () => () => {
      Object.values(instancesRef.current).forEach((calc) => {
        try {
          calc.destroy();
        } catch (e) {
          /* already destroyed */
        }
      });
      instancesRef.current = {};
    },
    []
  );

  const resizeInstances = () => {
    Object.values(instancesRef.current).forEach((calc) => {
      try {
        calc.resize();
      } catch (e) {
        /* ignore */
      }
    });
  };

  // Desmos sizes itself to its container: nudge it after anything that
  // changes the visible container (open, tab switch, expand/shrink).
  useEffect(() => {
    if (!isOpen || status !== 'ready') return undefined;
    const frame = requestAnimationFrame(resizeInstances);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, mode, expanded, status]);

  // ...and after viewport-driven size changes (the panel width/height use
  // CSS min() against the viewport).
  useEffect(() => {
    if (status !== 'ready' || typeof ResizeObserver === 'undefined') return undefined;
    const el = bodyRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(resizeInstances);
    observer.observe(el);
    return () => observer.disconnect();
  }, [status]);

  const size = expanded ? PANEL_SIZE.expanded : PANEL_SIZE.normal;

  const tabs = (
    <div className="calc-tabs" role="tablist" aria-label="Calculator type">
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'graphing'}
        className={`calc-tab ${mode === 'graphing' ? 'active' : ''}`}
        onClick={() => setMode('graphing')}
      >
        Graphing
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'scientific'}
        className={`calc-tab ${mode === 'scientific' ? 'active' : ''}`}
        onClick={() => setMode('scientific')}
      >
        Scientific
      </button>
    </div>
  );

  const expandButton = (
    <button
      type="button"
      className="etp-icon-btn"
      onClick={() => setExpanded((value) => !value)}
      aria-label={expanded ? 'Shrink calculator' : 'Expand calculator'}
    >
      {expanded ? <FiMinimize2 aria-hidden="true" /> : <FiMaximize2 aria-hidden="true" />}
      <span className="etp-icon-btn-label">{expanded ? 'Shrink' : 'Expand'}</span>
    </button>
  );

  return (
    <ExamToolPanel
      title="Calculator"
      isOpen={isOpen}
      onClose={onClose}
      width={size.width}
      height={size.height}
      defaultPosition={() => ({ x: 18, y: 86 })}
      headerContent={tabs}
      headerRight={expandButton}
      className="calculator-panel"
    >
      <div className="calc-body" ref={bodyRef}>
        {status === 'loading' && (
          <div className="calc-status" role="status">
            <span className="calc-spinner" aria-hidden="true" />
            Loading calculator…
          </div>
        )}
        {status === 'error' && (
          <div className="calc-status">
            <p>The Desmos calculator couldn&apos;t load. Check your connection.</p>
            <button
              type="button"
              className="calc-retry-btn"
              onClick={() => setRetryTick((tick) => tick + 1)}
            >
              Try Again
            </button>
          </div>
        )}
        <div
          ref={graphingRef}
          className="calc-instance"
          style={{ display: status === 'ready' && mode === 'graphing' ? 'block' : 'none' }}
        />
        <div
          ref={scientificRef}
          className="calc-instance"
          style={{ display: status === 'ready' && mode === 'scientific' ? 'block' : 'none' }}
        />
      </div>
    </ExamToolPanel>
  );
}

export default CalculatorPanel;
