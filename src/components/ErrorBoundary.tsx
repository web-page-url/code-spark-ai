'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('🚨 Error Boundary Caught Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    this.setState({ errorInfo });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error monitoring service like Sentry
    console.log('📊 Would report to error monitoring service:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportBug = () => {
    const bugReport = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const subject = `Bug Report: ${this.state.error?.message}`;
    const body = `Error ID: ${this.state.errorId}\n\nError Details:\n${JSON.stringify(bugReport, null, 2)}`;
    
    window.open(`mailto:support@ai-coding-assistant.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default beautiful error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-gray-800/90 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🚨 Oops! Something went wrong
                </h1>
                <p className="text-gray-400 text-lg">
                  Don't worry, our AI is already working on fixing this!
                </p>
              </div>

              {/* Error Details */}
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Error Details</h3>
                  <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
                    ID: {this.state.errorId}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 text-sm">Message:</span>
                    <p className="text-red-400 font-mono text-sm bg-red-950/30 p-2 rounded mt-1">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                  </div>
                  
                  {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                    <details className="mt-3">
                      <summary className="text-gray-400 text-sm cursor-pointer hover:text-white transition-colors">
                        Stack Trace (Dev Mode)
                      </summary>
                      <pre className="text-xs text-gray-500 bg-gray-950/50 p-3 rounded mt-2 overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Retry ({this.maxRetries - this.retryCount} left)</span>
                  </button>
                )}
                
                <button
                  onClick={this.handleReload}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleReportBug}
                  className="btn-secondary flex items-center justify-center space-x-2 bg-orange-700/30 hover:bg-orange-600/30 border-orange-600/50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m-7 8l4-4H5l4-4m6 8l4-4h-9l4-4" />
                  </svg>
                  <span>Report Bug</span>
                </button>
              </div>

              {/* Recovery Suggestions */}
              <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recovery Suggestions
                </h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                  <li>• Try using a different browser</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="text-center mt-6 pt-6 border-t border-gray-700">
                <p className="text-gray-500 text-sm">
                  Error occurred at {new Date().toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  AI Coding Assistant v2.0.0 - Enterprise Edition
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const reportError = (error: Error, context?: string) => {
    console.error('🚨 Manual Error Report:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Report to service
    }
  };

  return { reportError };
};

export default ErrorBoundary; 