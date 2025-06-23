import axios from 'axios';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: string;
  details?: any;
  message?: string;
}

/**
 * Send a message to the AI and get a response
 */
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    // Send the full conversation history instead of just the last message
    const response = await axios.post<ChatResponse>('/api/chat', {
      messages: messages,
    });
    
    // Check if we got a valid response
    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }
    
    throw new Error('Invalid response format from API');
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ChatResponse;
      const errorMessage = errorData.message || errorData.error || 'Unknown API error';
      throw new Error(errorMessage);
    }
    
    throw new Error('Failed to communicate with the AI service');
  }
}

/**
 * Check if the API is available
 */
export async function checkApiStatus(): Promise<{isAvailable: boolean, apiKeyConfigured: boolean}> {
  try {
    const response = await axios.get('/api/chat');
    return { 
      isAvailable: response.status === 200, 
      apiKeyConfigured: response.data.apiKeyConfigured || false 
    };
  } catch (error) {
    console.error('API status check failed:', error);
    return { isAvailable: false, apiKeyConfigured: false };
  }
} 