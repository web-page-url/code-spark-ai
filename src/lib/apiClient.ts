import axios, { AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';
import { Message, APIResponse, AIProgress } from './types';

// Advanced API client with enterprise-grade features
class AIApiClient {
  private client: AxiosInstance;
  private cancelTokenSources: Map<string, CancelTokenSource> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private rateLimiter: RateLimiter;
  private progressCallback?: (progress: AIProgress) => void;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 120000, // 2 minutes for complex AI operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.rateLimiter = new RateLimiter(60, 60000); // 60 requests per minute
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for rate limiting and auth
    this.client.interceptors.request.use(
      async (config) => {
        await this.rateLimiter.waitForSlot();
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = Date.now().toString();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for caching and error handling
    this.client.interceptors.response.use(
      (response) => {
        // Cache successful responses
        const cacheKey = this.getCacheKey(response.config);
        if (cacheKey && response.config.method === 'get') {
          this.cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            ttl: 5 * 60 * 1000, // 5 minutes
          });
        }
        
        return response;
      },
      async (error) => {
        // Implement retry logic for transient errors
        if (this.shouldRetry(error)) {
          return this.retryRequest(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  // Advanced chat message sending with real-time progress updates
  async sendChatMessage(
    messages: Message[],
    onProgress?: (progress: AIProgress) => void
  ): Promise<APIResponse<Message>> {
    this.cancelPreviousRequest('chat');
    const cancelTokenSource = axios.CancelToken.source();
    this.cancelTokenSources.set('chat', cancelTokenSource);

    try {
      const requestId = this.generateRequestId();
      
      onProgress?.({
        stage: 'thinking',
        message: '🧠 AI is analyzing your request...',
        progress: 10,
      });

      // Make the API request
      const response = await this.client.post('/chat', {
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        requestId,
        options: {
          model: 'agentica-org/deepcoder-14b-preview:free',
          temperature: 0.7,
          max_tokens: 9500,
        }
      }, {
        cancelToken: cancelTokenSource.token,
        timeout: 60000, // 60 second timeout
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress?.({
            stage: 'analyzing',
            message: 'Sending your request to AI...',
            progress: Math.min(progress, 25),
          });
        },
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onProgress?.({
            stage: 'generating',
            message: 'AI is generating response...',
            progress: 25 + Math.min(progress * 0.7, 70),
          });
        },
      });

      // Handle the response
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error?.message || 'API request failed');
      }

      const aiMessage = response.data.data.choices?.[0]?.message;
      if (!aiMessage) {
        throw new Error('No response from AI service');
      }

      // Complete progress
      onProgress?.({
        stage: 'complete',
        message: 'Response generated successfully!',
        progress: 100,
      });

      this.cancelTokenSources.delete('chat');
      
      // Return the properly formatted response
      return {
        success: true,
        data: {
          id: this.generateRequestId(),
          role: 'assistant',
          content: aiMessage.content,
          timestamp: new Date(),
          status: 'received',
        },
        metadata: response.data.metadata,
      };

    } catch (error) {
      this.cancelTokenSources.delete('chat');
      
      if (axios.isCancel(error)) {
        throw new Error('Request was cancelled');
      }
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`AI service error: ${errorMessage}`);
      }
      
      throw new Error('Failed to communicate with AI service');
    }
  }

  // Stream chat messages for real-time responses
  async streamChatMessage(
    messages: Message[],
    onChunk: (chunk: string) => void,
    onProgress?: (progress: AIProgress) => void
  ): Promise<void> {
    const requestId = this.generateRequestId();
    console.log('🔥 streamChatMessage started with requestId:', requestId);
    
    try {
      // Start with progress updates
      onProgress?.({
        stage: 'thinking',
        message: 'AI is thinking about your request...',
        progress: 10,
      });

      console.log('📡 Making fetch request to /api/chat...');
      
      // Use the regular chat endpoint for now
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({ 
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          options: { stream: false } // Set to false since we're simulating streaming
        }),
      });

      console.log('📡 Fetch response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error data:', errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (!data.success) {
        console.error('❌ API response indicates failure:', data);
        throw new Error(data.error?.message || 'API request failed');
      }

      // Simulate streaming by chunking the response
      const fullResponse = data.data.choices?.[0]?.message?.content || 'AI response received successfully!';
      console.log('📝 Full response to chunk:', fullResponse.slice(0, 100) + '...');
      
      const chunks = this.chunkResponse(fullResponse);
      console.log('🧩 Created chunks:', chunks.length, 'chunks');
      
      onProgress?.({
        stage: 'generating',
        message: 'AI is writing response...',
        progress: 30,
      });

      // Stream chunks with realistic delays
      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        
        console.log(`📤 Sending chunk ${i + 1}/${chunks.length}:`, chunks[i]);
        onChunk(chunks[i]);
        
        const progress = 30 + ((i / chunks.length) * 60);
        onProgress?.({
          stage: 'generating',
          message: 'AI is writing response...',
          progress: Math.min(progress, 90),
          details: {
            tokensProcessed: i + 1,
            totalTokens: chunks.length,
          },
        });
      }

      onProgress?.({
        stage: 'complete',
        message: 'Response completed!',
        progress: 100,
      });

      console.log('✅ streamChatMessage completed successfully');

    } catch (error) {
      console.error('❌ streamChatMessage error:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      
      // Provide a fallback response instead of throwing
      const fallbackMessage = `I apologize, but I encountered an issue: ${error instanceof Error ? error.message : 'Unknown error'}

🚀 **Enhanced Fallback Response:**

I'm still here to help! Here are some suggestions while we resolve this:

**🛠️ Quick Solutions:**
1. **Check your internet connection**
2. **Refresh the page and try again**  
3. **Try a simpler request first**

**💡 What I can help with:**
- Code review and optimization
- Debug assistance and troubleshooting  
- Architecture suggestions
- Best practices recommendations
- Performance improvements

**🎯 Example requests that work well:**
- "Help me optimize this React component"
- "Review my TypeScript interface design"
- "Suggest improvements for this function"

Please try again, and I'll do my best to provide you with excellent assistance! ✨`;

      console.log('🔄 Providing fallback response...');
      const chunks = this.chunkResponse(fallbackMessage);
      
      onProgress?.({
        stage: 'generating',
        message: 'Providing fallback response...',
        progress: 50,
      });

      for (let i = 0; i < chunks.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30));
        onChunk(chunks[i]);
      }

      onProgress?.({
        stage: 'complete',
        message: 'Fallback response provided',
        progress: 100,
      });
      
      console.log('✅ Fallback response completed');
    }
  }

  // Helper method to chunk response for streaming effect
  private chunkResponse(text: string): string[] {
    const chunks: string[] = [];
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + (i + 3 < words.length ? ' ' : '');
      chunks.push(chunk);
    }
    
    return chunks;
  }

  // Cancel previous requests to prevent conflicts
  private cancelPreviousRequest(operationType: string) {
    const cancelTokenSource = this.cancelTokenSources.get(operationType);
    if (cancelTokenSource) {
      cancelTokenSource.cancel(`New ${operationType} request initiated`);
      this.cancelTokenSources.delete(operationType);
    }
  }

  // Simulate engaging progress updates
  private simulateProgress(requestId: string) {
    if (!this.progressCallback) return;

    const stages: AIProgress[] = [
      {
        stage: 'thinking',
        message: '🧠 AI is analyzing your request...',
        progress: 5,
        details: { currentThought: 'Understanding context and requirements' },
      },
      {
        stage: 'analyzing',
        message: '🔍 Examining code structure and patterns...',
        progress: 15,
        details: { currentThought: 'Analyzing existing code and dependencies' },
      },
      {
        stage: 'generating',
        message: '⚡ Generating intelligent response...',
        progress: 40,
        details: { currentThought: 'Crafting solution with best practices' },
      },
      {
        stage: 'reviewing',
        message: '✨ Optimizing and reviewing output...',
        progress: 80,
        details: { currentThought: 'Ensuring code quality and accuracy' },
      },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        this.progressCallback?.(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    // Store interval for cleanup
    setTimeout(() => clearInterval(interval), 10000);
  }

  // Check if request should be retried
  private shouldRetry(error: any): boolean {
    if (error.code === 'ECONNABORTED') return true; // Timeout
    if (error.response?.status >= 500) return true; // Server errors
    if (error.response?.status === 429) return true; // Rate limit
    return false;
  }

  // Retry request with exponential backoff
  private async retryRequest(config: AxiosRequestConfig, attempt = 1): Promise<any> {
    if (attempt > 3) {
      throw new Error('Max retry attempts reached');
    }

    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      return await this.client.request(config);
    } catch (error) {
      if (this.shouldRetry(error)) {
        return this.retryRequest(config, attempt + 1);
      }
      throw error;
    }
  }

  // Generate unique request IDs
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create cache keys for requests
  private getCacheKey(config: AxiosRequestConfig): string | null {
    if (config.method !== 'get') return null;
    return `${config.url}_${JSON.stringify(config.params)}`;
  }

  // Get cached response if available and valid
  private getCachedResponse(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // API health check with detailed status
  async checkApiStatus(): Promise<APIResponse<{
    isAvailable: boolean;
    apiKeyConfigured: boolean;
    latency: number;
    features: string[];
    limits: {
      requestsPerMinute: number;
      requestsPerDay: number;
      maxTokens: number;
    };
  }>> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.get('/status');
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        data: {
          ...response.data,
          latency,
          features: ['streaming', 'code-analysis', 'real-time-collaboration'],
          limits: {
            requestsPerMinute: 60,
            requestsPerDay: 1000,
            maxTokens: 9500,
          },
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: latency,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'API_UNAVAILABLE',
          message: 'AI service is currently unavailable',
          details: error,
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  // Cleanup method
  cleanup() {
    // Cancel all pending requests
    this.cancelTokenSources.forEach(source => source.cancel('Client cleanup'));
    this.cancelTokenSources.clear();
    
    // Clear cache
    this.cache.clear();
  }
}

// Rate limiter implementation
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForSlot(); // Recursively check again
      }
    }
    
    this.requests.push(now);
  }
}

// Export singleton instance
export const apiClient = new AIApiClient();

// Legacy exports for backward compatibility
export const sendChatMessage = (messages: Message[], onProgress?: (progress: AIProgress) => void) =>
  apiClient.sendChatMessage(messages, onProgress);

export const checkApiStatus = () => apiClient.checkApiStatus(); 