'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: string;
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, loading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const isManualScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simple, reliable scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Force scroll to bottom (user clicked button)
  const forceScrollToBottom = useCallback(() => {
    setShouldAutoScroll(true);
    setIsAtBottom(true);
    scrollToBottom();
  }, [scrollToBottom]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
      setShouldAutoScroll(false);
      setIsAtBottom(false);
    }
  }, []);

  // Simple scroll detection
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 50;

    setIsAtBottom(atBottom);

    // If user scrolled manually (not at bottom), disable auto-scroll
    if (!atBottom) {
      isManualScrolling.current = true;
      setShouldAutoScroll(false);
    } else {
      // If user scrolled back to bottom, re-enable auto-scroll
      scrollTimeoutRef.current = setTimeout(() => {
        isManualScrolling.current = false;
        setShouldAutoScroll(true);
      }, 100);
    }
  }, []);

  // Auto-scroll only when new messages arrive and user hasn't manually scrolled
  useEffect(() => {
    if (shouldAutoScroll && !isManualScrolling.current && messages.length > 0) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      onSendMessage(input);
      setInput('');
      
      // Always scroll to bottom when user sends a message
      setShouldAutoScroll(true);
      isManualScrolling.current = false;
      setTimeout(scrollToBottom, 50);
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    
    switch (e.key) {
      case 'Home':
        e.preventDefault();
        scrollToTop();
        break;
      case 'End':
        e.preventDefault();
        forceScrollToBottom();
        break;
      case 'PageUp':
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight * 0.8 });
        break;
      case 'PageDown':
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight * 0.8 });
        break;
    }
  }, [scrollToTop, forceScrollToBottom]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Function to extract code blocks from markdown
  const extractCodeBlocks = (content: string): { text: string, isCode: boolean, language: string, code: string }[] => {
    const parts: { text: string, isCode: boolean, language: string, code: string }[] = [];
    
    // Match code blocks with ```language or just ```
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          text: content.substring(lastIndex, match.index),
          isCode: false,
          language: '',
          code: ''
        });
      }
      
      // Add the code block
      parts.push({
        text: match[0],
        isCode: true,
        language: match[1] || 'plaintext',
        code: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        text: content.substring(lastIndex),
        isCode: false,
        language: '',
        code: ''
      });
    }
    
    return parts;
  };

  // Insert code into the editor
  const handleInsertCode = (code: string) => {
    // @ts-ignore - Using the global function we defined in CodeEditor
    if (typeof window !== 'undefined' && window.insertCodeToEditor) {
      // @ts-ignore
      window.insertCodeToEditor(code);
    }
  };

  // Render message content with code blocks
  const renderMessageContent = (content: string) => {
    const parts = extractCodeBlocks(content);
    
    return parts.map((part, index) => {
      if (!part.isCode) {
        // Regular text - split into paragraphs and render
        return part.text.split('\n').map((line, i) => (
          <p key={`${index}-${i}`} className="mb-2">
            {line}
          </p>
        ));
      } else {
        // Code block with syntax highlighting
        return (
          <div key={index} className="relative bg-gray-900 rounded-md my-2">
            {part.language && (
              <div className="bg-gray-800 text-xs text-gray-500 px-3 py-1 rounded-t-md">
                {part.language}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-sm">
              <code>{part.code}</code>
            </pre>
            <button 
              onClick={() => handleInsertCode(part.code)}
              className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded px-2 py-1"
              title="Insert this code into the editor"
            >
              Insert
            </button>
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex-shrink-0">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <div className="text-xs text-gray-400 mt-1">
          Scroll freely with mouse wheel • Home/End for quick navigation
        </div>
      </div>
      
      {/* Messages Area - This is where the magic happens */}
      <div className="flex-1 min-h-0 relative">
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth focus:outline-none"
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <p>Ask me anything about your code!</p>
              <p className="text-sm mt-2">I can help with debugging, optimization, and explanations.</p>
            </div>
          )}
          
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[90%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-700 text-white rounded-bl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {renderMessageContent(msg.content)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-700 text-white rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          {messages.length > 0 && (
            <button
              onClick={scrollToTop}
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 shadow-lg transition-all duration-200"
              title="Scroll to top (Home)"
            >
              ⬆️
            </button>
          )}
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          {messages.length > 0 && (
            <button
              onClick={forceScrollToBottom}
              className={`rounded-full p-2 shadow-lg transition-all duration-200 ${
                isAtBottom 
                  ? 'bg-black/60 hover:bg-black/80 text-white' 
                  : 'bg-blue-600/90 hover:bg-blue-500 text-white animate-pulse'
              }`}
              title={isAtBottom ? "At bottom (End)" : "Scroll to bottom (End)"}
            >
              ⬇️
              {!isAtBottom && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 animate-ping"></div>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-700 p-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel; 