// Performance monitoring utilities

export type PerformanceMetric = {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  start(name: string) {
    if (!this.enabled) return;
    this.timers.set(name, performance.now());
  }

  end(name: string, metadata?: Record<string, unknown>) {
    if (!this.enabled) return;
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Performance timer "${name}" was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log slow operations
    if (duration > 1000) {
      console.warn(
        `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`,
      );
    }
  }

  measure<T>(name: string, fn: () => T, metadata?: Record<string, unknown>): T {
    this.start(name);
    try {
      return fn();
    } finally {
      this.end(name, metadata);
    }
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>,
  ): Promise<T> {
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name, metadata);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter((m) => m.name === name);
  }

  getStats(name: string) {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: metrics.length,
      avg,
      min,
      max,
      total: sum,
    };
  }

  clear() {
    this.metrics = [];
    this.timers.clear();
  }

  clearOld(maxAge: number = 300000) {
    // Default: 5 minutes
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter((m) => m.timestamp > cutoff);
  }

  getSummary() {
    const names = Array.from(new Set(this.metrics.map((m) => m.name)));
    return names.map((name) => ({
      name,
      ...this.getStats(name),
    }));
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = (
  componentName: string,
  enabled = true,
) => {
  const monitor = performanceMonitor;

  const measure = <T>(operationName: string, fn: () => T): T => {
    if (!enabled) return fn();
    return monitor.measure(`${componentName}.${operationName}`, fn);
  };

  const measureAsync = <T>(
    operationName: string,
    fn: () => Promise<T>,
  ): Promise<T> => {
    if (!enabled) return fn();
    return monitor.measureAsync(`${componentName}.${operationName}`, fn);
  };

  return { measure, measureAsync, monitor };
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Memoization for expensive computations
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  getCacheKey?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getCacheKey ? getCacheKey(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
};

// Log component render times
export const logRenderTime = (
  componentName: string,
  callback?: (duration: number) => void,
) => {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`);
    callback?.(duration);
  };
};

// Check if operation is slow
export const isSlowOperation = (duration: number, threshold = 100): boolean => {
  return duration > threshold;
};

// Format duration for display
export const formatDuration = (ms: number): string => {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
