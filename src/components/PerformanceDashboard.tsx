'use client';

import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/lib/usePerformanceMonitor';

interface PerformanceDashboardProps {
  className?: string;
  variant?: 'full' | 'compact' | 'floating';
  showRecommendations?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  variant = 'compact',
  showRecommendations = true,
}) => {
  const performanceMonitor = usePerformanceMonitor({
    componentName: 'PerformanceDashboard',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  // Auto-collapse after 10 seconds if no interaction
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-green-400';
    if (score > 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score > 80) return 'from-green-500 to-emerald-500';
    if (score > 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const formatMetric = (value: number, unit: string = '') => {
    if (value < 1 && unit === 'ms') return `${(value * 1000).toFixed(0)}μs`;
    return `${value.toFixed(1)}${unit}`;
  };

  if (variant === 'floating') {
    return (
      <div 
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${className} ${
          isExpanded ? 'w-80' : 'w-14'
        }`}
      >
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 mb-3"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {performanceMonitor.alerts.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{performanceMonitor.alerts.length}</span>
            </div>
          )}
        </button>

        {/* Expanded Dashboard */}
        {isExpanded && (
          <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Performance Monitor</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Performance Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Overall Score</span>
                <span className={`text-lg font-bold ${getScoreColor(performanceMonitor.performanceScore)}`}>
                  {performanceMonitor.performanceScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(performanceMonitor.performanceScore)} transition-all duration-1000`}
                  style={{ width: `${performanceMonitor.performanceScore}%` }}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Render Time</div>
                <div className={`text-sm font-semibold ${
                  performanceMonitor.metrics.renderTime > 50 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {formatMetric(performanceMonitor.metrics.renderTime, 'ms')}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Re-renders</div>
                <div className={`text-sm font-semibold ${
                  performanceMonitor.metrics.reRenders > 5 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {performanceMonitor.metrics.reRenders}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Interactions</div>
                <div className="text-sm font-semibold text-blue-400">
                  {performanceMonitor.metrics.userInteractions}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-2">
                <div className="text-xs text-gray-400 mb-1">Errors</div>
                <div className={`text-sm font-semibold ${
                  performanceMonitor.metrics.errorCount > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {performanceMonitor.metrics.errorCount}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {showAlerts && performanceMonitor.alerts.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Recent Alerts</span>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {performanceMonitor.alerts.slice(-3).map((alert, index) => (
                    <div key={index} className="bg-red-900/30 border border-red-700/50 rounded p-2">
                      <div className="text-xs text-red-300">{alert.message}</div>
                      <div className="text-xs text-red-400/70 mt-1">
                        {alert.value.toFixed(1)} {'>'} {alert.threshold}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {showRecommendations && (
              <div>
                <div className="text-xs text-gray-400 mb-2">Quick Actions</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => performanceMonitor.resetMetrics()}
                    className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-600/50 rounded px-2 py-1 text-xs text-blue-300 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      const report = performanceMonitor.getPerformanceReport();
                      console.log('Performance Report:', report);
                    }}
                    className="flex-1 bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 rounded px-2 py-1 text-xs text-green-300 transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Performance</h4>
          <span className={`text-sm font-bold ${getScoreColor(performanceMonitor.performanceScore)}`}>
            {performanceMonitor.performanceScore}/100
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Render:</span>
            <span className={performanceMonitor.metrics.renderTime > 50 ? 'text-red-400' : 'text-green-400'}>
              {formatMetric(performanceMonitor.metrics.renderTime, 'ms')}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Re-renders:</span>
            <span className={performanceMonitor.metrics.reRenders > 5 ? 'text-orange-400' : 'text-green-400'}>
              {performanceMonitor.metrics.reRenders}
            </span>
          </div>
        </div>

        {performanceMonitor.alerts.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-red-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {performanceMonitor.alerts.length} alert{performanceMonitor.alerts.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={`bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Performance Dashboard</h3>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(performanceMonitor.performanceScore)}`}>
            {performanceMonitor.performanceScore}/100
          </div>
          <div className="text-xs text-gray-400">Overall Score</div>
        </div>
      </div>

      {/* Score Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(performanceMonitor.performanceScore)} transition-all duration-1000`}
            style={{ width: `${performanceMonitor.performanceScore}%` }}
          />
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-2">Render Time</div>
          <div className={`text-xl font-bold ${
            performanceMonitor.metrics.renderTime > 50 ? 'text-red-400' : 'text-green-400'
          }`}>
            {formatMetric(performanceMonitor.metrics.renderTime, 'ms')}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {'<'} 50ms
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-2">Re-renders</div>
          <div className={`text-xl font-bold ${
            performanceMonitor.metrics.reRenders > 5 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {performanceMonitor.metrics.reRenders}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {'<'} 5
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-2">User Interactions</div>
          <div className="text-xl font-bold text-blue-400">
            {performanceMonitor.metrics.userInteractions}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total clicks/actions
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-2">Errors</div>
          <div className={`text-xl font-bold ${
            performanceMonitor.metrics.errorCount > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            {performanceMonitor.metrics.errorCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Runtime errors
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => performanceMonitor.resetMetrics()}
          className="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-600/50 rounded text-blue-300 transition-colors"
        >
          Reset Metrics
        </button>
        <button
          onClick={() => {
            const report = performanceMonitor.getPerformanceReport();
            console.log('Performance Report:', report);
          }}
          className="px-4 py-2 bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 rounded text-green-300 transition-colors"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};

export default PerformanceDashboard; 