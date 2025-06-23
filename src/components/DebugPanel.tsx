'use client';

import React, { useState } from 'react';

const DebugPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date() }]);
  };

  const testFetch = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing direct fetch to /api/test...');
      const response = await fetch('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🧪 Fetch response:', response);
      const data = await response.json();
      console.log('🧪 Response data:', data);
      
      addResult('Direct Fetch Test', { success: true, data });
    } catch (error) {
      console.error('🧪 Fetch test error:', error);
      addResult('Direct Fetch Test', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  const testChatAPI = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing chat API...');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Debug test message' }]
        }),
      });
      
      console.log('🧪 Chat API response:', response);
      const data = await response.json();
      console.log('🧪 Chat API data:', data);
      
      addResult('Chat API Test', { success: true, data });
    } catch (error) {
      console.error('🧪 Chat API test error:', error);
      addResult('Chat API Test', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  const testAxios = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing axios...');
      const axios = (await import('axios')).default;
      const response = await axios.get('/api/test');
      
      console.log('🧪 Axios response:', response);
      addResult('Axios Test', { success: true, data: response.data });
    } catch (error) {
      console.error('🧪 Axios test error:', error);
      addResult('Axios Test', { success: false, error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed top-4 left-4 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">🧪 Debug Panel</h3>
        <button
          onClick={clearResults}
          className="text-xs text-gray-400 hover:text-white"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testFetch}
          disabled={loading}
          className="w-full px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-600/50 rounded text-blue-300 text-xs transition-colors disabled:opacity-50"
        >
          Test Direct Fetch
        </button>
        
        <button
          onClick={testChatAPI}
          disabled={loading}
          className="w-full px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 rounded text-green-300 text-xs transition-colors disabled:opacity-50"
        >
          Test Chat API
        </button>
        
        <button
          onClick={testAxios}
          disabled={loading}
          className="w-full px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-600/50 rounded text-purple-300 text-xs transition-colors disabled:opacity-50"
        >
          Test Axios
        </button>
      </div>

      {loading && (
        <div className="text-xs text-yellow-300 mb-2">
          ⏳ Testing...
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="bg-gray-900/50 rounded p-2 text-xs">
            <div className="text-gray-300 font-medium mb-1">
              {result.test} - {result.timestamp.toLocaleTimeString()}
            </div>
            <div className={`font-mono ${result.result.success ? 'text-green-400' : 'text-red-400'}`}>
              {result.result.success ? '✅ SUCCESS' : '❌ FAILED'}
            </div>
            {result.result.error && (
              <div className="text-red-300 mt-1">
                Error: {result.result.error}
              </div>
            )}
            {result.result.data && (
              <div className="text-gray-400 mt-1 break-all">
                Data: {JSON.stringify(result.result.data).slice(0, 100)}...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugPanel; 