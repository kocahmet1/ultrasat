/**
 * Concurrency utilities for handling high-load scenarios
 * Provides request queuing, throttling, and batch processing
 */

class RequestQueue {
  constructor(maxConcurrent = 10, delayBetweenBatches = 100) {
    this.maxConcurrent = maxConcurrent;
    this.delayBetweenBatches = delayBetweenBatches;
    this.queue = [];
    this.running = 0;
  }

  async add(asyncFunction) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: asyncFunction,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      
      // Add small delay between operations to be gentle on Firestore
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), this.delayBetweenBatches);
      }
    }
  }
}

// Global queue instances for different operation types
export const quizQueue = new RequestQueue(15, 50); // 15 concurrent quiz operations
export const progressQueue = new RequestQueue(10, 100); // 10 concurrent progress updates
export const questionQueue = new RequestQueue(20, 25); // 20 concurrent question fetches

/**
 * Throttle function calls to prevent overwhelming Firestore
 */
export function throttle(func, delay) {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

/**
 * Batch process array items with concurrency control
 */
export async function batchProcess(items, processor, batchSize = 10, delayBetweenBatches = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch concurrently
    const batchPromises = batch.map(item => processor(item));
    const batchResults = await Promise.allSettled(batchPromises);
    
    results.push(...batchResults);
    
    // Add delay between batches if there are more items
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Monitor and log performance metrics
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      operationsPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      activeConnections: 0
    };
    this.operations = [];
    this.errors = 0;
    this.startTime = Date.now();
  }

  recordOperation(duration, success = true) {
    const now = Date.now();
    this.operations.push({ timestamp: now, duration, success });
    
    if (!success) {
      this.errors++;
    }
    
    // Keep only last 1000 operations for memory efficiency
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-1000);
    }
    
    this.updateMetrics();
  }

  updateMetrics() {
    const now = Date.now();
    const recentOps = this.operations.filter(op => now - op.timestamp < 60000); // Last minute
    
    this.metrics.operationsPerSecond = recentOps.length / 60;
    this.metrics.averageLatency = recentOps.reduce((sum, op) => sum + op.duration, 0) / recentOps.length || 0;
    this.metrics.errorRate = (this.errors / this.operations.length) * 100 || 0;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  logMetrics() {
    console.log('🔍 Performance Metrics:', this.getMetrics());
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();

/**
 * Wrapper for Firestore operations with monitoring
 */
export function monitoredOperation(operation, operationName = 'unknown') {
  return async (...args) => {
    const startTime = Date.now();
    let success = true;
    
    try {
      const result = await operation(...args);
      return result;
    } catch (error) {
      success = false;
      console.error(`Operation ${operationName} failed:`, error);
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      performanceMonitor.recordOperation(duration, success);
      
      if (duration > 5000) { // Log slow operations
        console.warn(`⚠️ Slow operation detected: ${operationName} took ${duration}ms`);
      }
    }
  };
} 