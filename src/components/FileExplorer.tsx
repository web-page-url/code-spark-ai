'use client';

import React, { useState, useRef, useEffect } from 'react';

// Define the file node interface
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path?: string;
  content?: string;
}

interface FileExplorerProps {
  onFileSelect?: (file: { name: string, content: string, path: string }) => void;
}

// Extend HTML input element attributes to include webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    // Add webkitdirectory
    webkitdirectory?: string;
    directory?: string;
  }
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'src/components': true,
  });
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Initialize with the mock structure
  useEffect(() => {
    setFileStructure(mockFileStructure);
  }, []);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleFileClick = async (node: FileNode) => {
    if (node.type === 'file' && onFileSelect && node.content) {
      onFileSelect({
        name: node.name,
        content: node.content,
        path: node.path || node.name
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    // Process each file
    const filePromises = Array.from(files).map(file => {
      return new Promise<FileNode>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: 'file',
            path: file.name,
            content: e.target?.result as string
          });
        };
        reader.readAsText(file);
      });
    });
    
    Promise.all(filePromises).then(newFiles => {
      setFileStructure(prev => [...prev, ...newFiles]);
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    });
  };

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    // Process folder structure
    const newStructure: Record<string, FileNode> = {};
    
    // Process each file into a folder structure
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath;
      const pathParts = path.split('/');
      
      // Skip the first level (folder name) as we'll create it manually
      if (pathParts.length <= 1) continue;
      
      const folderName = pathParts[0];
      
      // Create the folder if it doesn't exist
      if (!newStructure[folderName]) {
        newStructure[folderName] = {
          name: folderName,
          type: 'folder',
          children: [],
          path: folderName
        };
      }
      
      // For files directly in the folder
      if (pathParts.length === 2) {
        const reader = new FileReader();
        const fileContent = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
        
        newStructure[folderName].children?.push({
          name: pathParts[1],
          type: 'file',
          path: path,
          content: fileContent
        });
      }
      // For nested structures, we'd need recursive creation here
      // This is simplified for demonstration
    }
    
    // Add the new folders to our structure
    setFileStructure(prev => [...prev, ...Object.values(newStructure)]);
    setExpandedFolders(prev => {
      const newExpanded = { ...prev };
      Object.keys(newStructure).forEach(folder => {
        newExpanded[folder] = true;
      });
      return newExpanded;
    });
    
    setIsLoading(false);
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  const renderTree = (nodes: FileNode[], basePath: string = '') => {
    return (
      <ul className="pl-4">
        {nodes.map((node) => {
          const path = basePath ? `${basePath}/${node.name}` : node.name;
          
          if (node.type === 'file') {
            return (
              <li key={path} className="py-1">
                <div 
                  className="flex items-center text-gray-300 hover:text-white cursor-pointer"
                  onClick={() => handleFileClick(node)}
                >
                  <span className="mr-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span className="text-sm">{node.name}</span>
                </div>
              </li>
            );
          }
          
          return (
            <li key={path} className="py-1">
              <div 
                className="flex items-center text-gray-300 hover:text-white cursor-pointer"
                onClick={() => toggleFolder(path)}
              >
                <span className="mr-2">
                  {expandedFolders[path] ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
                <span className="mr-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </span>
                <span className="text-sm font-medium">{node.name}</span>
              </div>
              
              {expandedFolders[path] && node.children && renderTree(node.children, path)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Mock file structure for demo purposes
  const mockFileStructure: FileNode[] = [
    {
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Header.tsx', type: 'file', content: '// Header component code' },
            { name: 'CodeEditor.tsx', type: 'file', content: '// CodeEditor component code' },
            { name: 'ChatPanel.tsx', type: 'file', content: '// ChatPanel component code' },
            { name: 'FileExplorer.tsx', type: 'file', content: '// FileExplorer component code' },
          ]
        },
        {
          name: 'app',
          type: 'folder',
          children: [
            { name: 'page.tsx', type: 'file', content: '// Main page code' },
            { name: 'layout.tsx', type: 'file', content: '// Layout code' },
            { name: 'globals.css', type: 'file', content: '/* Global CSS styles */' },
          ]
        },
        {
          name: 'lib',
          type: 'folder',
          children: [
            { name: 'api.ts', type: 'file', content: '// API utility functions' },
            { name: 'utils.ts', type: 'file', content: '// Utility functions' },
          ]
        }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'favicon.ico', type: 'file', content: '// Binary content' },
      ]
    },
    { name: 'package.json', type: 'file', content: '{\n  "name": "ai-coding-assistant",\n  "version": "0.1.0"\n}' },
    { name: 'README.md', type: 'file', content: '# AI Coding Assistant\n\nA Next.js-based AI coding assistant.' },
  ];

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold uppercase text-gray-400">Explorer</h2>
        <div className="flex space-x-2">
          {/* File Upload Button */}
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Files"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            multiple 
          />
          
          {/* Folder Upload Button */}
          <button 
            className="text-gray-400 hover:text-white"
            onClick={() => folderInputRef.current?.click()}
            title="Upload Folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={folderInputRef} 
            className="hidden" 
            onChange={handleFolderUpload} 
            webkitdirectory="true"
            directory="true"
          />
          
          {/* Refresh Button */}
          <button className="text-gray-400 hover:text-white" title="Refresh">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-20 text-gray-400">
          <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading files...</span>
        </div>
      ) : (
        <div className="overflow-y-auto flex-1">
          {renderTree(fileStructure)}
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 