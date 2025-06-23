'use client';

import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  language = 'html' 
}) => {
  const editorRef = useRef<any>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [fileName, setFileName] = useState<string>('code.html');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<string>('');

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Add context menu event
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener('contextmenu', handleContextMenu);
    }
  };

  // Handle context menu (right-click)
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    
    // Get selected text
    const selection = editorRef.current?.getSelection();
    const model = editorRef.current?.getModel();
    if (selection && model) {
      const selectedText = model.getValueInRange(selection);
      setSelectedText(selectedText);
    }
    
    // Position and show context menu
    setContextMenuPosition({ 
      x: event.clientX, 
      y: event.clientY 
    });
    setShowContextMenu(true);
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to download the code as a file
  const handleDownload = () => {
    if (!editorRef.current) return;
    
    const currentCode = editorRef.current.getValue();
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to save to clipboard
  const handleCopyToClipboard = () => {
    if (!editorRef.current) return;
    
    const currentCode = editorRef.current.getValue();
    navigator.clipboard.writeText(currentCode)
      .then(() => {
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  // Function to open code in a new window as live preview
  const handleOpenLiveServer = () => {
    if (!editorRef.current) return;
    
    const currentCode = editorRef.current.getValue();
    
    // Create a new window with the HTML content
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(currentCode);
      newWindow.document.close();
    }
    
    setShowContextMenu(false);
  };

  // Function to insert code on click from AI response
  const handleInsertCodeFromResponse = (code: string) => {
    if (!editorRef.current) return;
    
    // Insert at cursor position
    const position = editorRef.current.getPosition();
    editorRef.current.executeEdits('insert-code', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: code
    }]);

    // Update parent component's state
    const newValue = editorRef.current.getValue();
    onChange(newValue);
  };

  // Make this method available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - Add a global function to insert code
      window.insertCodeToEditor = handleInsertCodeFromResponse;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore - Clean up
        delete window.insertCodeToEditor;
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Editor Controls */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-gray-400 text-sm px-2 py-1">
            {language.toUpperCase()} Editor
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handleCopyToClipboard}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm rounded px-3 py-1 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </button>
          <button 
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded px-3 py-1 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save
          </button>
          <button 
            onClick={handleOpenLiveServer}
            className="bg-green-600 hover:bg-green-700 text-white text-sm rounded px-3 py-1 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Live Preview
          </button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            padding: { top: 10 },
            scrollbar: { verticalScrollbarSize: 10 },
            lineNumbers: 'on',
            wordWrap: 'on',
            tabSize: 2,
          }}
        />
      </div>
      
      {/* Right-click Context Menu */}
      {showContextMenu && (
        <div 
          ref={contextMenuRef}
          className="absolute bg-gray-800 border border-gray-700 shadow-lg rounded-md overflow-hidden z-50"
          style={{ 
            top: `${contextMenuPosition.y}px`, 
            left: `${contextMenuPosition.x}px` 
          }}
        >
          <ul className="text-sm">
            <li>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center"
                onClick={handleCopyToClipboard}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center"
                onClick={handleOpenLiveServer}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open as Live Server
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-white flex items-center"
                onClick={handleDownload}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save As...
              </button>
            </li>
          </ul>
        </div>
      )}
      
      {/* Mobile touch-friendly resize handle */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-4 bg-gray-700 flex items-center justify-center cursor-row-resize touch-manipulation">
        <div className="w-10 h-1 bg-gray-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default CodeEditor; 