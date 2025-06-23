'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import ProjectFileExplorer from '@/components/ProjectFileExplorer';
import Header from '@/components/Header';
import AIProgressIndicator, { FloatingAIProgressIndicator } from '@/components/AIProgressIndicator';
import { apiClient } from '@/lib/apiClient';
import { fileSystemManager } from '@/lib/fileSystemManager';
import { Message, EditorState, AIProgress, ProjectContext, APIResponse } from '@/lib/types';
import { nanoid } from 'nanoid';
import ErrorBoundary from '@/components/ErrorBoundary';
import DebugPanel from '@/components/DebugPanel';

export default function Home() {
  // Core application state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [aiProgress, setAiProgress] = useState<AIProgress | null>(null);
  
  // Editor state - Now focused on HTML, CSS, JS generation
  const [editorState, setEditorState] = useState<EditorState>({
    code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Web Page</title>\n</head>\n<body>\n    <h1>🚀 Welcome to AI Web Code Generator</h1>\n    <p>Ask the AI to generate HTML, CSS, or JavaScript code!</p>\n</body>\n</html>',
    language: 'html',
    filename: 'index.html',
    path: '/index.html',
    isModified: false,
    cursor: { line: 1, column: 1 },
    foldedRegions: [],
    breakpoints: [],
    decorations: [],
  });

  // Project context for HTML, CSS, JS code generation
  const [projectContextState, setProjectContextState] = useState<ProjectContext>({
    name: 'AI Web Code Generator',
    description: 'AI-powered HTML, CSS & JavaScript code generator',
    tech_stack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    files: [],
    dependencies: {},
    aiContext: {
      projectType: 'web',
      framework: 'Vanilla Web',
      conventions: ['HTML5', 'Modern CSS', 'ES6+ JavaScript'],
      codeStyle: 'modern-web',
    },
  });

  // Memoize project context to prevent unnecessary re-renders
  const projectContext = useMemo(() => projectContextState, [projectContextState]);

  // Advanced features state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [collaborationMode, setCollaborationMode] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Resizable panels state
  const [chatPanelWidth, setChatPanelWidth] = useState(400); // Default width in pixels
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default sidebar width (equivalent to w-72)
  const [isResizing, setIsResizing] = useState(false);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visibility toggle

  // Refs for cleanup and optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const autoReplaceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize API status check with enhanced error handling - MEMOIZED
  const initializeApiStatus = useCallback(async () => {
      try {
      const status = await apiClient.checkApiStatus();
        setApiStatus(status);
        
      if (!status.success || !status.data?.apiKeyConfigured) {
        setError("🚀 Demo Mode: Experience the future with mock AI responses! Configure your API key for full power.");
        }
      } catch (err) {
        console.error("Failed to check API status:", err);
      setApiStatus({ 
        success: false, 
        error: { code: 'UNAVAILABLE', message: 'Service temporarily unavailable' }
      });
      setError("⚡ Initializing AI systems... Please wait while we boot up the intelligence!");
    }
  }, []); // No dependencies to prevent re-renders

  useEffect(() => {
    initializeApiStatus();
  }, [initializeApiStatus]);

  // Auto-save functionality - OPTIMIZED to prevent excessive re-renders
  const handleAutoSave = useCallback(() => {
    if (autoSave && editorState.isModified) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        setEditorState(prev => ({ ...prev, isModified: false }));
        console.log('Auto-saved:', editorState.filename);
      }, 2000);
    }
  }, [autoSave, editorState.isModified, editorState.filename]);

  useEffect(() => {
    handleAutoSave();
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [handleAutoSave]);

  // Enhanced message handling with streaming support - HEAVILY OPTIMIZED
  const handleSendMessage = useCallback(async (content: string) => {
    console.log('🚀 Starting handleSendMessage with content:', content);
    
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setAiProgress(null);

    // Create user message with enhanced metadata
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
      metadata: {
        files: [editorState.filename],
      },
    };

    // Get current project context without causing re-renders
    const projectStructure = fileSystemManager.getProjectStructure();
    const projectContextString = fileSystemManager.generateProjectContext();
    
    const enhancedContent = `
You are an AI assistant specialized in generating HTML, CSS, and JavaScript code. You MUST format code properly based on the file type.

${projectContextString ? `**PROJECT CONTEXT:**\n${projectContextString}\n\n` : ''}

**CURRENT FILE:** ${editorState.filename}
**LANGUAGE:** ${editorState.language}
**TARGET:** Generate clean, modern ${editorState.language.toUpperCase()} code

**CURRENT CODE:**
\`\`\`${editorState.language}
${editorState.code}
\`\`\`

**USER REQUEST:** ${content}

**IMPORTANT FORMATTING RULES:**
${editorState.language === 'css' ? `
- For CSS files (.css): Generate pure CSS without <style> tags
- Use modern CSS features (flexbox, grid, custom properties)
- Include responsive design with media queries
- Add helpful comments explaining the CSS
` : editorState.language === 'html' ? `
- For HTML files (.html): Generate complete HTML documents
- Include proper DOCTYPE, meta tags, and structure
- When CSS is needed, include it in <style> tags in the <head>
- When JavaScript is needed, include it in <script> tags before </body>
- Use semantic HTML elements
- Include responsive viewport meta tag
` : `
- For JavaScript files (.js): Generate pure JavaScript without <script> tags
- Use modern ES6+ features (const/let, arrow functions, async/await)
- Include proper error handling
- Add helpful comments explaining the functionality
- Use modern DOM methods and APIs
`}

Please generate or modify the ${editorState.language.toUpperCase()} code to fulfill this request. The code should be production-ready and follow modern web standards.
`;

    const contextualUserMessage = { ...userMessage, content: enhancedContent };
    
    // Update messages state in a batch to prevent multiple re-renders
    setMessages(prevMessages => [...prevMessages, { ...userMessage, status: 'sent' as const }]);

    console.log('📝 Messages prepared with project context');
    
    try {
      console.log('🔄 Starting streaming...');
      setIsStreaming(true);
      setStreamingContent('');

      let assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'received',
        metadata: {
          codeBlocks: [],
          suggestions: [],
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      console.log('📞 Calling apiClient.streamChatMessage...');
      
      // Stream the response with progress updates
      await apiClient.streamChatMessage(
        [...messages, contextualUserMessage],
        (chunk: string) => {
          console.log('📥 Received chunk:', chunk.slice(0, 50) + '...');
          setStreamingContent(prev => prev + chunk);
          assistantMessage.content += chunk;
          
          // Batch update to prevent excessive re-renders
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantMessage.content }
                : msg
            )
          );
          
          // Auto-detect and insert CSS/JS into HTML if applicable
          const codeBlockMatch = assistantMessage.content.match(/```(\w+)\n([\s\S]*?)```/);
          if (codeBlockMatch) {
            const [, detectedLanguage, code] = codeBlockMatch;
            if (detectedLanguage === 'css' || detectedLanguage === 'javascript') {
              const cleanCode = formatCodeForLanguage(code, detectedLanguage);
              handleIntelligentCodeInsertion(cleanCode, detectedLanguage);
            }
          }
        },
        (progress: AIProgress) => {
          console.log('📊 Progress update:', progress);
          setAiProgress(progress);
        }
      );

      console.log('✅ Streaming completed successfully');

      // Final update
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, status: 'received' as const }
            : msg
        )
      );

      setAiProgress({
        stage: 'complete',
        message: '✨ Response generated successfully!',
        progress: 100,
      });

      // 🧠 SMART CODE REPLACEMENT - Process the complete response
      handleSmartCodeInsertion(assistantMessage.content, content);

      // Auto-hide progress after completion
      setTimeout(() => setAiProgress(null), 2000);

    } catch (err) {
      console.error('❌ Error in handleSendMessage:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`🤖 AI encountered an issue: ${errorMessage}. Don't worry, I'm learning from this!`);
      
      // Add error message to chat
      const errorChatMessage: Message = {
        id: nanoid(),
          role: 'assistant', 
        content: `I apologize, but I encountered an error while processing your request: ${errorMessage}\n\nPlease try again, and I'll do my best to help you! 🚀`,
        timestamp: new Date(),
        status: 'error',
      };

      setMessages(prev => [...prev, errorChatMessage]);
      setAiProgress(null);
    } finally {
      console.log('🏁 handleSendMessage finally block');
      setLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [messages, editorState.filename, editorState.language, editorState.code]); // Minimal dependencies

  // Enhanced file selection with AI analysis - OPTIMIZED
  const handleFileSelect = useCallback((file: { name: string, content: string, path: string }) => {
    // Update editor state
    setEditorState(prev => ({
      ...prev,
      code: file.content,
      filename: file.name,
      path: file.path,
      isModified: false,
      language: getLanguageFromExtension(file.name),
    }));

    // Add file to project context
    setProjectContextState(prev => ({
      ...prev,
      files: prev.files.some(f => f.path === file.path) 
        ? prev.files 
        : [...prev.files, {
            id: nanoid(),
            name: file.name,
            path: file.path,
            type: 'file',
            content: file.content,
            language: getLanguageFromExtension(file.name),
            lastModified: new Date(),
          }],
    }));

    // Show notification
    setError(`📂 Loaded ${file.name} - AI is now aware of this file's context!`);
    setTimeout(() => setError(null), 3000);
  }, []); // Removed performanceMonitor dependency

  // Handle code changes with enhanced tracking - OPTIMIZED
  const handleCodeChange = useCallback((newCode: string) => {
    setEditorState(prev => ({
      ...prev,
      code: newCode,
      isModified: prev.code !== newCode,
    }));
  }, []);

  // Intelligent code insertion based on language and context
  const handleIntelligentCodeInsertion = useCallback((generatedCode: string, targetLanguage: string) => {
    if (editorState.language === 'html' && targetLanguage !== 'html') {
      // User is in HTML file but AI generated CSS or JS - auto-embed it
      const currentCode = editorState.code;
      
      if (targetLanguage === 'css') {
        // Insert CSS in <style> tags in head
        if (currentCode.includes('<head>')) {
          const styleTag = `    <style>\n${generatedCode.split('\n').map(line => '        ' + line).join('\n')}\n    </style>\n`;
          const updatedCode = currentCode.replace(
            /<\/head>/,
            `${styleTag}</head>`
          );
          
          setEditorState(prev => ({
            ...prev,
            code: updatedCode,
            isModified: true,
          }));
          
          setError('✨ CSS automatically embedded in HTML <head> section!');
          setTimeout(() => setError(null), 3000);
          return true;
        }
      } else if (targetLanguage === 'javascript') {
        // Insert JavaScript in <script> tags before </body>
        if (currentCode.includes('</body>')) {
          const scriptTag = `    <script>\n${generatedCode.split('\n').map(line => '        ' + line).join('\n')}\n    </script>\n`;
          const updatedCode = currentCode.replace(
            /<\/body>/,
            `${scriptTag}</body>`
          );
          
          setEditorState(prev => ({
            ...prev,
            code: updatedCode,
            isModified: true,
          }));
          
          setError('✨ JavaScript automatically embedded before </body> tag!');
          setTimeout(() => setError(null), 3000);
          return true;
        }
      }
    }
    
    return false; // No intelligent insertion performed
  }, [editorState.code, editorState.language]);

  // Smart code formatting based on language
  const formatCodeForLanguage = useCallback((code: string, language: string) => {
    switch (language) {
      case 'css':
        // Remove <style> tags if present and clean up
        const cleanedCSS = code
          .replace(/<style[^>]*>/gi, '')
          .replace(/<\/style>/gi, '')
          .trim();
        return cleanedCSS;
        
      case 'javascript':
        // Remove <script> tags if present and clean up
        const cleanedJS = code
          .replace(/<script[^>]*>/gi, '')
          .replace(/<\/script>/gi, '')
          .trim();
        return cleanedJS;
        
      case 'html':
        // Ensure proper HTML structure
        if (!code.includes('<!DOCTYPE html>')) {
          return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Page</title>\n</head>\n<body>\n${code}\n</body>\n</html>`;
        }
        return code;
        
      default:
        return code;
    }
  }, []);

  // 🧠 INTELLIGENT CODE REPLACEMENT SYSTEM
  const [pendingCodeReplacement, setPendingCodeReplacement] = useState<{
    code: string;
    language: string;
    userMessage: string;
    isReplacement: boolean;
    diff?: {
      additions: string[];
      deletions: string[];
      unchanged: string[];
      diffLines: Array<{type: 'add' | 'delete' | 'unchanged', content: string, lineNumber?: number}>;
    };
  } | null>(null);

  // Detect if user wants code replacement vs addition
  const detectCodeReplacement = useCallback((userMessage: string) => {
    const replacementKeywords = [
      'make it better', 'improve', 'enhance', 'optimize', 'fix', 'update', 
      'modify', 'change', 'refactor', 'rewrite', 'upgrade', 'polish',
      'make this better', 'improve this', 'fix this', 'update this',
      'can you improve', 'can you make', 'can you fix', 'can you enhance'
    ];
    
    const additionKeywords = [
      'add', 'include', 'also add', 'plus', 'in addition', 'append',
      'insert', 'put in', 'also include', 'and add', 'create new'
    ];
    
    const message = userMessage.toLowerCase();
    
    // Strong indicators for replacement
    if (replacementKeywords.some(keyword => message.includes(keyword))) {
      return true;
    }
    
    // Strong indicators for addition
    if (additionKeywords.some(keyword => message.includes(keyword))) {
      return false;
    }
    
    // Default: if user has existing code and asks for something, likely wants replacement
    return editorState.code.trim().length > 100;
  }, [editorState.code]);

  // Smart code insertion with replace/append choice
  const handleSmartCodeInsertion = useCallback((generatedCode: string, userMessage: string) => {
    // Extract code from AI response if it's in code blocks
    const codeBlockMatch = generatedCode.match(/```[\w]*\n([\s\S]*?)```/);
    const extractedCode = codeBlockMatch ? codeBlockMatch[1] : generatedCode;
    const cleanCode = formatCodeForLanguage(extractedCode, editorState.language);
    
    // Don't process if code is too short (likely not actual code)
    if (cleanCode.trim().length < 20) return;
    
    const isReplacement = detectCodeReplacement(userMessage);
    
    // Generate diff for replacement operations
    const diff = isReplacement ? createCodeDiff(editorState.code, cleanCode) : undefined;
    
    setPendingCodeReplacement({
      code: cleanCode,
      language: editorState.language,
      userMessage: userMessage,
      isReplacement: isReplacement,
      diff: diff
    });
    
    // Auto-apply replacement for obvious cases
    if (isReplacement && (
      userMessage.toLowerCase().includes('make it better') ||
      userMessage.toLowerCase().includes('improve') ||
      userMessage.toLowerCase().includes('fix')
    )) {
      // Clear any existing timeout
      if (autoReplaceTimeoutRef.current) {
        clearTimeout(autoReplaceTimeoutRef.current);
      }
      
      // Auto-replace after 2 seconds, giving user time to cancel
      autoReplaceTimeoutRef.current = setTimeout(() => {
        handleApplyCodeReplacement(true);
      }, 2000);
      
      setError(`⚡ Auto-replacing code in 2 seconds... (Detected: "${userMessage}") - Press ESC to cancel`);
      setTimeout(() => setError(null), 2000);
    }
  }, [editorState.language, detectCodeReplacement, formatCodeForLanguage]);

  // Apply code replacement or addition
  const handleApplyCodeReplacement = useCallback((replace: boolean) => {
    if (!pendingCodeReplacement) return;
    
    const { code } = pendingCodeReplacement;
    
    if (replace) {
      // REPLACE existing code
      setEditorState(prev => ({
        ...prev,
        code: code,
        isModified: true,
      }));
      setError('✅ Code replaced successfully!');
    } else {
      // APPEND to existing code
      setEditorState(prev => ({
        ...prev,
        code: prev.code + '\n\n' + code,
        isModified: true,
      }));
      setError('✅ Code appended successfully!');
    }
    
    setPendingCodeReplacement(null);
    setTimeout(() => setError(null), 3000);
  }, [pendingCodeReplacement]);

  // 🔍 DIFF ALGORITHM - Create beautiful code diffs like Cursor
  const createCodeDiff = useCallback((oldCode: string, newCode: string) => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    
    const diffLines: Array<{type: 'add' | 'delete' | 'unchanged', content: string, lineNumber?: number}> = [];
    const additions: string[] = [];
    const deletions: string[] = [];
    const unchanged: string[] = [];
    
    // Simple line-by-line diff algorithm
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];
      
      if (oldIndex >= oldLines.length) {
        // Only new lines left - all additions
        diffLines.push({ type: 'add', content: newLine, lineNumber: newIndex + 1 });
        additions.push(newLine);
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only old lines left - all deletions
        diffLines.push({ type: 'delete', content: oldLine, lineNumber: oldIndex + 1 });
        deletions.push(oldLine);
        oldIndex++;
      } else if (oldLine === newLine) {
        // Lines are the same
        diffLines.push({ type: 'unchanged', content: oldLine, lineNumber: oldIndex + 1 });
        unchanged.push(oldLine);
        oldIndex++;
        newIndex++;
      } else {
        // Lines are different - check if it's a simple replacement
        const nextOldIndex = oldLines.findIndex((line, idx) => idx > oldIndex && line === newLine);
        const nextNewIndex = newLines.findIndex((line, idx) => idx > newIndex && line === oldLine);
        
        if (nextOldIndex !== -1 && (nextNewIndex === -1 || nextOldIndex - oldIndex <= nextNewIndex - newIndex)) {
          // Old line was deleted
          diffLines.push({ type: 'delete', content: oldLine, lineNumber: oldIndex + 1 });
          deletions.push(oldLine);
          oldIndex++;
        } else if (nextNewIndex !== -1) {
          // New line was added
          diffLines.push({ type: 'add', content: newLine, lineNumber: newIndex + 1 });
          additions.push(newLine);
          newIndex++;
        } else {
          // Both lines changed - show as delete + add
          diffLines.push({ type: 'delete', content: oldLine, lineNumber: oldIndex + 1 });
          diffLines.push({ type: 'add', content: newLine, lineNumber: newIndex + 1 });
          deletions.push(oldLine);
          additions.push(newLine);
          oldIndex++;
          newIndex++;
        }
      }
    }
    
    return {
      additions,
      deletions,
      unchanged,
      diffLines
    };
  }, []);

  // Cancel pending replacement
  const handleCancelReplacement = useCallback(() => {
    // Clear auto-replace timeout
    if (autoReplaceTimeoutRef.current) {
      clearTimeout(autoReplaceTimeoutRef.current);
      autoReplaceTimeoutRef.current = null;
    }
    
    setPendingCodeReplacement(null);
    setError('❌ Code replacement cancelled');
    setTimeout(() => setError(null), 2000);
  }, []);

  // Handle saving current file
  const handleSaveFile = useCallback(async () => {
    if (!editorState.isModified || !editorState.path) return;

    try {
      console.log('💾 Saving file to disk:', editorState.path);
      await fileSystemManager.writeFile(editorState.path, editorState.code);
      
      setEditorState(prev => ({ ...prev, isModified: false }));
      setError('✅ File saved successfully!');
      setTimeout(() => setError(null), 2000);
      
    } catch (err) {
      console.error('Failed to save file:', err);
      setError(`Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [editorState]);

  // Handle creating new files
  const handleCreateFile = useCallback(async (path: string) => {
    try {
      console.log('📄 Creating new file:', path);
      setError(`📄 Created new file: ${path}`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Failed to create file:', err);
      setError(`Failed to create file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);
    
  // Handle creating new folders
  const handleCreateFolder = useCallback(async (path: string) => {
    try {
      console.log('📁 Creating new folder:', path);
      setError(`📁 Created new folder: ${path}`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError(`Failed to create folder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Language detection helper - Focused on web technologies
  const getLanguageFromExtension = useCallback((filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'scss',
      'js': 'javascript',
      'mjs': 'javascript',
      'jsx': 'javascript',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[extension || ''] || 'html';
  }, []);

  // Resizable chat panel functionality
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = chatPanelWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX; // Negative delta means dragging right (expanding chat)
      const newWidth = Math.max(300, Math.min(800, startWidth + deltaX)); // Min 300px, Max 800px
      setChatPanelWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [chatPanelWidth]);

  // Resizable sidebar functionality
  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
    
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX; // Positive delta means dragging right (expanding sidebar)
      const newWidth = Math.max(200, Math.min(600, startWidth + deltaX)); // Min 200px, Max 600px
      setSidebarWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  // Reset panel widths on mobile
  const resetPanelWidths = useCallback(() => {
    if (window.innerWidth < 768) { // Mobile breakpoint
      setChatPanelWidth(400);
      setSidebarWidth(288);
      setIsSidebarVisible(true); // Show sidebar on mobile for better UX
    }
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resetPanelWidths);
    return () => window.removeEventListener('resize', resetPanelWidths);
  }, [resetPanelWidths]);

  // Keyboard shortcuts - MEMOIZED with Smart Code actions
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 🚀 CURSOR-STYLE ACCEPT/REJECT SHORTCUTS
    if (pendingCodeReplacement) {
      // ACCEPT changes - Enter key
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleApplyCodeReplacement(pendingCodeReplacement.isReplacement);
        setError('✅ Changes accepted via keyboard shortcut!');
        setTimeout(() => setError(null), 2000);
        return;
      }
      
      // REJECT changes - Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelReplacement();
        setError('❌ Changes rejected via keyboard shortcut!');
        setTimeout(() => setError(null), 2000);
        return;
      }
      
      // FORCE REPLACE - Ctrl+R
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleApplyCodeReplacement(true); // Force replace
        setError('🔄 Code forcefully replaced!');
        setTimeout(() => setError(null), 2000);
        return;
      }
      
      // FORCE APPEND - Ctrl+A
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleApplyCodeReplacement(false); // Force append
        setError('➕ Code appended via shortcut!');
        setTimeout(() => setError(null), 2000);
        return;
      }

      // QUICK ACCEPT (Alt+Enter) - Accept without confirmation
      if (e.key === 'Enter' && e.altKey) {
        e.preventDefault();
        handleApplyCodeReplacement(true);
        setError('⚡ Quick accept activated!');
        setTimeout(() => setError(null), 2000);
        return;
      }
    }

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSaveFile();
          break;
        case 'b':
          e.preventDefault();
          toggleSidebar();
          setError(`📁 Sidebar ${!isSidebarVisible ? 'shown' : 'hidden'} - More space for coding!`);
          setTimeout(() => setError(null), 2000);
          break;
        case 'n':
          if (e.shiftKey) {
            e.preventDefault();
            console.log('New file shortcut triggered');
          }
          break;
        case '`':
          if (process.env.NODE_ENV === 'development') {
            e.preventDefault();
            setShowDebugPanel(prev => !prev);
          }
          break;
        case 'z':
          if (pendingCodeReplacement) {
            e.preventDefault();
            handleCancelReplacement();
          }
          break;
      default:
          break;
      }
    }
  }, [handleSaveFile, pendingCodeReplacement, handleApplyCodeReplacement, handleCancelReplacement, toggleSidebar, isSidebarVisible]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup on unmount - OPTIMIZED
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      apiClient.cleanup();
      fileSystemManager.reset();
    };
  }, []); // No dependencies needed for cleanup

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
      
      <div className="flex flex-1 overflow-hidden">
          {/* 🎛️ SIDEBAR TOGGLE BUTTON */}
          <div className="hidden md:flex items-start pt-4">
            <button
              onClick={toggleSidebar}
              className={`z-10 p-2 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600/50 rounded-r-lg transition-all duration-200 flex items-center justify-center ${
                isSidebarVisible ? 'shadow-lg' : 'shadow-xl bg-blue-600/20 border-blue-500/50'
              }`}
              title={isSidebarVisible ? 'Hide sidebar (more space)' : 'Show sidebar'}
            >
              {isSidebarVisible ? (
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Enhanced File Explorer */}
          {isSidebarVisible && (
            <>
              <div 
                className={`hidden md:block bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 overflow-y-auto transition-all duration-200 ${
                  isResizingSidebar ? 'select-none' : ''
                }`}
                style={{ 
                  width: `${sidebarWidth}px`,
                  minWidth: '200px',
                  maxWidth: '600px'
                }}
              >
                <ProjectFileExplorer 
                  onFileSelect={handleFileSelect}
                  onCreateFile={handleCreateFile}
                  onCreateFolder={handleCreateFolder}
                />
              </div>

              {/* Sidebar Resize Handle */}
              <div 
                className={`hidden md:block w-1 resize-handle ${
                  isResizingSidebar ? 'resizing' : ''
                }`}
                onMouseDown={handleSidebarResizeStart}
                title="Drag to resize sidebar"
              >
                {/* Hover area for better UX */}
                <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
              </div>
            </>
          )}
          
          {/* Main Editor Area with Enhanced Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Advanced Code Editor */}
            <div className="h-1/2 md:h-auto md:flex-1 overflow-hidden relative">
              {/* Language Selector */}
              <div className="absolute top-4 left-4 z-10">
                <select 
                  value={editorState.language}
                  onChange={(e) => {
                    const newLanguage = e.target.value as 'html' | 'css' | 'javascript';
                    const templates = {
                      html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Generated Web Page</title>\n</head>\n<body>\n    <h1>🚀 AI Generated HTML</h1>\n    <p>Ask the AI to generate HTML structure!</p>\n</body>\n</html>',
                      css: '/* AI Generated CSS */\n/* Ask for: "Create a modern card component" */\n\n:root {\n    --primary-color: #3b82f6;\n    --secondary-color: #1f2937;\n    --accent-color: #10b981;\n}\n\nbody {\n    font-family: system-ui, -apple-system, sans-serif;\n    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));\n    margin: 0;\n    padding: 20px;\n}',
                      javascript: '// AI Generated JavaScript\n// Ask for: "Create interactive functionality"\n\n/**\n * Modern JavaScript for web interactivity\n */\n\ndocument.addEventListener(\'DOMContentLoaded\', function() {\n    console.log(\'🚀 Page loaded - Ready for AI magic!\');\n    initializeApp();\n});\n\nfunction initializeApp() {\n    // Your interactive code goes here\n    console.log(\'✨ App initialized successfully!\');\n}'
                    };
                    
                    setEditorState(prev => ({
                      ...prev,
                      language: newLanguage,
                      code: templates[newLanguage],
                      filename: newLanguage === 'html' ? 'index.html' : newLanguage === 'css' ? 'styles.css' : 'script.js',
                      path: `/${newLanguage === 'html' ? 'index.html' : newLanguage === 'css' ? 'styles.css' : 'script.js'}`,
                      isModified: false
                    }));
                  }}
                  className="bg-gray-800/90 border border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-200 backdrop-blur-sm"
                >
                  <option value="html">🌐 HTML</option>
                  <option value="css">🎨 CSS</option>
                  <option value="javascript">🟨 JavaScript</option>
                </select>
              </div>

              <CodeEditor 
                code={editorState.code} 
                onChange={handleCodeChange} 
                language={editorState.language}
              />
              
              {/* Save button */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {editorState.isModified && (
                  <button
                    onClick={handleSaveFile}
                    className="px-3 py-1 bg-green-600/30 hover:bg-green-600/50 border border-green-600/50 rounded text-green-300 text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>💾</span>
                    <span>Save</span>
                  </button>
                )}
                
                {/* Auto-save indicator */}
                {editorState.isModified && autoSave && fileSystemManager.getProjectStructure() && (
                  <div className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-xs border border-yellow-600/30">
                    🔄 Auto-saving...
                  </div>
                )}
              </div>
            </div>
            
            {/* Cursor-style Resize Handle */}
            <div 
              ref={resizeRef}
              className={`hidden md:block w-1 resize-handle ${
                isResizing ? 'resizing' : ''
              }`}
              onMouseDown={handleResizeStart}
              title="Drag to resize chat panel"
            >
              {/* Hover area for better UX */}
              <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize"></div>
            </div>

            {/* Enhanced Chat Panel */}
            <div 
              className={`h-1/2 md:h-auto bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-700 flex flex-col transition-all duration-200 ${
                isResizing ? 'select-none' : ''
              }`}
              style={{ 
                width: `${chatPanelWidth}px`,
                minWidth: '300px',
                maxWidth: '800px'
              }}
            >
            <ChatPanel 
                messages={messages.map(m => ({ role: m.role, content: m.content }))} 
              onSendMessage={handleSendMessage} 
              loading={loading} 
            />
            
              {/* 🔍 CURSOR-STYLE DIFF VIEWER */}
              {pendingCodeReplacement && (
                <div className="mx-3 mt-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-lg overflow-hidden">
                  {/* Diff Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-gray-600/30">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-400 text-lg">🔍</span>
                      <div>
                        <div className="text-blue-300 font-semibold text-sm">Code Changes Detected</div>
                        <div className="text-gray-400 text-xs">
                          {pendingCodeReplacement.isReplacement ? 'Proposed code replacement' : 'Code to append'}
                        </div>
                      </div>
                      {pendingCodeReplacement.diff && (
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-400">+{pendingCodeReplacement.diff.additions.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-400">-{pendingCodeReplacement.diff.deletions.length}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleCancelReplacement}
                      className="text-gray-400 hover:text-white text-sm p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Diff Viewer */}
                  {pendingCodeReplacement.diff && pendingCodeReplacement.isReplacement ? (
                    <div className="max-h-64 overflow-y-auto bg-gray-900/50">
                      <div className="font-mono text-xs">
                        {pendingCodeReplacement.diff.diffLines.map((line, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center px-4 py-0.5 ${
                              line.type === 'add' 
                                ? 'bg-green-500/20 border-l-2 border-green-500' 
                                : line.type === 'delete' 
                                ? 'bg-red-500/20 border-l-2 border-red-500'
                                : 'bg-gray-800/30'
                            }`}
                          >
                            <div className={`w-8 text-right mr-3 ${
                              line.type === 'add' ? 'text-green-400' : 
                              line.type === 'delete' ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              {line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' '}
                            </div>
                            <div className={`flex-1 ${
                              line.type === 'add' ? 'text-green-300' : 
                              line.type === 'delete' ? 'text-red-300' : 'text-gray-300'
                            }`}>
                              {line.content || ' '}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-900/30">
                      <div className="text-xs text-gray-400 mb-2">Preview of new code:</div>
                      <div className="bg-gray-800/50 rounded p-3 max-h-32 overflow-y-auto">
                        <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap">
                          {pendingCodeReplacement.code}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-800/30 border-t border-gray-600/30">
                    {/* Cursor-Style Accept/Reject Bar */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <button 
                        onClick={() => handleApplyCodeReplacement(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        <span className="text-lg">✓</span>
                        <span>Accept</span>
                        <kbd className="ml-2 px-2 py-1 bg-green-700 rounded text-xs">⏎</kbd>
                      </button>
                      
                      <button 
                        onClick={handleCancelReplacement}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                      >
                        <span className="text-lg">✕</span>
                        <span>Reject</span>
                        <kbd className="ml-2 px-2 py-1 bg-red-700 rounded text-xs">Esc</kbd>
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex justify-center space-x-2 mb-3">
                      <button 
                        onClick={() => handleApplyCodeReplacement(false)}
                        className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-600/50 rounded-lg text-blue-300 text-sm font-medium transition-all flex items-center space-x-2"
                      >
                        <span>➕</span>
                        <span>Append Instead</span>
                      </button>
                    </div>

                    {/* Quick Stats & Shortcuts */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>"{pendingCodeReplacement.userMessage}"</span>
                        <span>•</span>
                        <span>{pendingCodeReplacement.code.split('\n').length} lines</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Enter</kbd>
                        <span>Accept</span>
                        <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Esc</kbd>
                        <span>Reject</span>
                      </div>
                    </div>

                    {pendingCodeReplacement.isReplacement && (
                      <div className="mt-3 text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-2 flex items-center space-x-2">
                        <span>⚡</span>
                        <span>Auto-applying in 2 seconds (Press ESC to cancel)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clean Status Panel - Only show errors when needed */}
              {error && (
                <div className="p-3 border-t border-gray-700">
                  <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 p-3 text-sm text-orange-200 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-orange-400 mr-2 flex-shrink-0">⚡</span>
                      <span>{error}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>



        </div>
      </div>

      {/* Floating Progress Indicator for mobile/overlay scenarios */}
      <FloatingAIProgressIndicator 
        progress={aiProgress}
        onCancel={() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setLoading(false);
          setAiProgress(null);
        }}
      />

      {/* 🚀 CURSOR-STYLE FLOATING ACCEPT/REJECT BAR */}
      {pendingCodeReplacement && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 floating-accept-reject">
          <div className="floating-bar-backdrop bg-gray-900/95 border border-gray-600/50 rounded-xl shadow-2xl p-4">
            <div className="flex items-center space-x-4">
              {/* Change indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full change-indicator"></div>
                <span className="text-sm font-medium text-gray-300">
                  {pendingCodeReplacement.isReplacement ? 'Code changes ready' : 'New code ready'}
                </span>
                {pendingCodeReplacement.diff && (
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-green-400 font-mono">+{pendingCodeReplacement.diff.additions.length}</span>
                    <span className="text-red-400 font-mono">-{pendingCodeReplacement.diff.deletions.length}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleApplyCodeReplacement(true)}
                  className="accept-btn flex items-center space-x-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  <span className="text-lg">✓</span>
                  <span>Accept</span>
                  <kbd className="ml-1 px-1.5 py-0.5 bg-green-700 rounded text-xs font-mono">⏎</kbd>
                </button>
                
                <button 
                  onClick={handleCancelReplacement}
                  className="reject-btn flex items-center space-x-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-lg"
                >
                  <span className="text-lg">✕</span>
                  <span>Reject</span>
                  <kbd className="ml-1 px-1.5 py-0.5 bg-red-700 rounded text-xs font-mono">Esc</kbd>
                </button>

                <button 
                  onClick={() => handleApplyCodeReplacement(false)}
                  className="append-btn flex items-center space-x-1 px-4 py-2.5 bg-blue-600/70 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
                >
                  <span>➕</span>
                  <span className="text-sm">Append</span>
                </button>
              </div>
            </div>

            {/* Quick hint */}
            <div className="mt-2 pt-2 border-t border-gray-700/50">
              <p className="text-xs text-gray-400 text-center">
                Press <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">Enter</kbd> to accept • 
                <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs ml-1">Esc</kbd> to reject • 
                <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs ml-1">Ctrl+R</kbd> force replace
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel (Toggleable in Dev Mode) */}
      {process.env.NODE_ENV === 'development' && showDebugPanel && (
        <DebugPanel />
      )}
    </ErrorBoundary>
  );
} 