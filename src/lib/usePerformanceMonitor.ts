import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  reRenders: number;
  memoryUsage?: number;
  userInteractions: number;
  errorCount: number;
  lastUpdated: Date;
  networkLatency?: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

interface UsePerformanceMonitorProps {
  componentName?: string;
  alertThresholds?: {
    renderTime?: number;
    reRenderCount?: number;
  };
  enableNetworkMonitoring?: boolean;
}

const defaultThresholds = {
  renderTime: 100,
  reRenderCount: 10,
};

export const usePerformanceMonitor = (props: UsePerformanceMonitorProps = {}) => {
  const {
    componentName = 'Component',
    alertThresholds = defaultThresholds,
    enableNetworkMonitoring = false,
  } = props;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentMounts: 0,
    reRenders: 0,
    userInteractions: 0,
    errorCount: 0,
    lastUpdated: new Date(),
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const interactionCount = useRef<number>(0);

  const addAlert = useCallback((alert: PerformanceAlert) => {
    setAlerts(prev => [...prev.slice(-9), alert]);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Performance Alert:', alert);
    }
  }, []);

  const calculatePerformanceScore = useCallback(() => {
    let score = 100;
    
    if (metrics.renderTime > 100) score -= 30;
    else if (metrics.renderTime > 50) score -= 15;
    
    if (metrics.reRenders > 10) score -= 25;
    else if (metrics.reRenders > 5) score -= 10;
    
    if (metrics.errorCount > 0) score -= metrics.errorCount * 10;
    
    return Math.max(0, score);
  }, [metrics]);

  // Track component mount
  useEffect(() => {
    mountTime.current = performance.now();
    setMetrics(prev => ({
      ...prev,
      componentMounts: prev.componentMounts + 1,
      lastUpdated: new Date(),
    }));

    console.log(`🚀 ${componentName} mounted at ${mountTime.current.toFixed(2)}ms`);

    return () => {
      const unmountTime = performance.now();
      console.log(`🔄 ${componentName} unmounted after ${(unmountTime - mountTime.current).toFixed(2)}ms`);
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenders: renderCount.current,
      lastUpdated: new Date(),
    }));

    const renderThreshold = alertThresholds.renderTime || defaultThresholds.renderTime;
    const reRenderThreshold = alertThresholds.reRenderCount || defaultThresholds.reRenderCount;

    if (renderTime > renderThreshold) {
      addAlert({
        type: 'warning',
        message: `Slow render detected in ${componentName}`,
        metric: 'renderTime',
        value: renderTime,
        threshold: renderThreshold,
        timestamp: new Date(),
      });
    }

    if (renderCount.current > reRenderThreshold) {
      addAlert({
        type: 'error',
        message: `Excessive re-renders in ${componentName}`,
        metric: 'reRenderCount',
        value: renderCount.current,
        threshold: reRenderThreshold,
        timestamp: new Date(),
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  }, [componentName, alertThresholds, addAlert]);

  const trackUserInteraction = useCallback((interactionType: string) => {
    interactionCount.current++;
    setMetrics(prev => ({
      ...prev,
      userInteractions: interactionCount.current,
      lastUpdated: new Date(),
    }));

    console.log(`👆 User interaction: ${interactionType} (#${interactionCount.current})`);
  }, []);

  const trackError = useCallback((error: Error) => {
    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
      lastUpdated: new Date(),
    }));

    addAlert({
      type: 'error',
      message: `Error in ${componentName}: ${error.message}`,
      metric: 'errorCount',
      value: metrics.errorCount + 1,
      threshold: 0,
      timestamp: new Date(),
    });
  }, [componentName, metrics.errorCount, addAlert]);

  const getPerformanceReport = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.renderTime > 50) {
      recommendations.push('Consider memoizing expensive calculations with useMemo');
    }
    
    if (metrics.reRenders > 5) {
      recommendations.push('Optimize re-renders with useCallback and React.memo');
    }

    return {
      component: componentName,
      metrics,
      alerts: alerts.slice(-5),
      recommendations,
      score: calculatePerformanceScore(),
    };
  }, [componentName, metrics, alerts, calculatePerformanceScore]);

  const resetMetrics = useCallback(() => {
    renderCount.current = 0;
    interactionCount.current = 0;
    setMetrics({
      renderTime: 0,
      componentMounts: 0,
      reRenders: 0,
      userInteractions: 0,
      errorCount: 0,
      lastUpdated: new Date(),
    });
    setAlerts([]);
  }, []);

  // Network monitoring
  useEffect(() => {
    if (!enableNetworkMonitoring || typeof window === 'undefined') return;

    const measureNetworkLatency = async () => {
      try {
        const start = performance.now();
        await fetch('/api/status', { method: 'HEAD' });
        const latency = performance.now() - start;
        
        setMetrics(prev => ({
          ...prev,
          networkLatency: latency,
          lastUpdated: new Date(),
        }));
      } catch (error) {
        console.warn('Network latency measurement failed:', error);
      }
    };

    measureNetworkLatency();
    const interval = setInterval(measureNetworkLatency, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [enableNetworkMonitoring]);

  return {
    metrics,
    alerts,
    trackUserInteraction,
    trackError,
    getPerformanceReport,
    resetMetrics,
    performanceScore: calculatePerformanceScore(),
  };
}; 