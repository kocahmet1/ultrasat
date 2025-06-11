import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/concurrencyUtils';

const PerformanceMonitor = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState({
    operationsPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    activeConnections: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getStatusColor = (value, thresholds) => {
    if (value < thresholds.good) return '#4CAF50'; // Green
    if (value < thresholds.warning) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        🔍 Performance Monitor
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <span>Ops/sec: </span>
        <span style={{ 
          color: getStatusColor(metrics.operationsPerSecond, { good: 50, warning: 100 })
        }}>
          {metrics.operationsPerSecond.toFixed(1)}
        </span>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <span>Avg Latency: </span>
        <span style={{ 
          color: getStatusColor(metrics.averageLatency, { good: 1000, warning: 3000 })
        }}>
          {metrics.averageLatency.toFixed(0)}ms
        </span>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        <span>Error Rate: </span>
        <span style={{ 
          color: getStatusColor(metrics.errorRate, { good: 1, warning: 5 })
        }}>
          {metrics.errorRate.toFixed(1)}%
        </span>
      </div>
      
      <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.7 }}>
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor; 