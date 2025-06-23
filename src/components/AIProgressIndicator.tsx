'use client';

import React, { useEffect, useState } from 'react';
import { AIProgress } from '@/lib/types';

interface AIProgressIndicatorProps {
  progress: AIProgress | null;
  className?: string;
}

const AIProgressIndicator: React.FC<AIProgressIndicatorProps> = ({ 
  progress, 
  className = '' 
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [previousStage, setPreviousStage] = useState<string>('');

  // Smooth progress animation
  useEffect(() => {
    if (progress) {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          const target = progress.progress;
          const diff = target - prev;
          if (Math.abs(diff) < 0.5) {
            clearInterval(interval);
            return target;
          }
          return prev + diff * 0.1;
        });
      }, 16); // 60fps

      return () => clearInterval(interval);
    }
  }, [progress?.progress]);

  // Track stage changes for animations
  useEffect(() => {
    if (progress && progress.stage !== previousStage) {
      setPreviousStage(progress.stage);
    }
  }, [progress?.stage, previousStage]);

  if (!progress) return null;

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'thinking':
        return (
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-ping opacity-75"></div>
            </div>
            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/20 animate-bounce"></div>
          </div>
        );
      case 'analyzing':
        return (
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-500 animate-spin">
              <div className="w-1 h-1 bg-yellow-500 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse"></div>
          </div>
        );
      case 'generating':
        return (
          <div className="relative w-6 h-6">
            <div className="absolute inset-0">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg animate-ping opacity-60"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex space-x-0.5">
                <div className="w-0.5 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                <div className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        );
      case 'reviewing':
        return (
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );
      case 'complete':
        return (
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 to-blue-500 scale-110 transition-transform duration-300"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-500 animate-pulse"></div>
        );
    }
  };

  const getGradientColor = (stage: string) => {
    switch (stage) {
      case 'thinking':
        return 'from-blue-500 to-purple-500';
      case 'analyzing':
        return 'from-yellow-500 to-orange-500';
      case 'generating':
        return 'from-green-500 to-emerald-500';
      case 'reviewing':
        return 'from-purple-500 to-pink-500';
      case 'complete':
        return 'from-green-500 to-blue-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-xl ${className}`}>
      {/* Header with stage indicator */}
      <div className="flex items-center space-x-3 mb-3">
        {getStageIcon(progress.stage)}
        <div className="flex-1">
          <div className="text-sm font-medium text-white">
            {progress.message}
          </div>
          {progress.details?.currentThought && (
            <div className="text-xs text-gray-400 mt-1 italic">
              {progress.details.currentThought}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {Math.round(displayProgress)}%
          </div>
          {progress.estimatedTime && (
            <div className="text-xs text-gray-400">
              ~{progress.estimatedTime}s
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getGradientColor(progress.stage)} transition-all duration-300 ease-out relative`}
            style={{ width: `${displayProgress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
          </div>
        </div>
        
        {/* Progress milestones */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={progress.progress >= 0 ? 'text-white' : ''}>Start</span>
          <span className={progress.progress >= 25 ? 'text-white' : ''}>Analysis</span>
          <span className={progress.progress >= 50 ? 'text-white' : ''}>Generation</span>
          <span className={progress.progress >= 75 ? 'text-white' : ''}>Review</span>
          <span className={progress.progress >= 100 ? 'text-white' : ''}>Complete</span>
        </div>
      </div>

      {/* Detailed progress information */}
      {progress.details && (
        <div className="mt-3 space-y-2">
          {progress.details.tokensProcessed && progress.details.totalTokens && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tokens processed:</span>
              <span>{progress.details.tokensProcessed.toLocaleString()} / {progress.details.totalTokens.toLocaleString()}</span>
            </div>
          )}
          
          {progress.details.codeBlocksGenerated && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Code blocks generated:</span>
              <span>{progress.details.codeBlocksGenerated}</span>
            </div>
          )}
        </div>
      )}

      {/* Pulse animation for active states */}
      {progress.stage !== 'complete' && (
        <div className="absolute inset-0 rounded-lg border border-blue-500/20 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};

// Mini progress indicator for smaller spaces
export const MiniAIProgressIndicator: React.FC<{ progress: AIProgress | null }> = ({ progress }) => {
  if (!progress) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
      <div className="w-3 h-3">
        {progress.stage === 'thinking' && (
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
        )}
        {progress.stage === 'analyzing' && (
          <div className="w-3 h-3 rounded-full border border-yellow-500 animate-spin"></div>
        )}
        {progress.stage === 'generating' && (
          <div className="w-3 h-3 rounded bg-green-500 animate-bounce"></div>
        )}
        {progress.stage === 'reviewing' && (
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
        )}
        {progress.stage === 'complete' && (
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        )}
      </div>
      <span className="text-xs text-gray-300 truncate max-w-32">
        {progress.message}
      </span>
      <span className="text-xs text-gray-500 font-mono">
        {Math.round(progress.progress)}%
      </span>
    </div>
  );
};

// Floating progress indicator for overlay scenarios
export const FloatingAIProgressIndicator: React.FC<{ 
  progress: AIProgress | null;
  onCancel?: () => void;
}> = ({ progress, onCancel }) => {
  if (!progress) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg border border-gray-700 shadow-2xl">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <AIProgressIndicator progress={progress} className="bg-transparent p-0 border-0 shadow-none" />
          </div>
          {onCancel && progress.stage !== 'complete' && (
            <button
              onClick={onCancel}
              className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
              title="Cancel operation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProgressIndicator; 