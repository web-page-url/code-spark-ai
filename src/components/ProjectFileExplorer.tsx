'use client';

import React, { useState, useEffect } from 'react';
import { fileSystemManager, FileSystemItem, ProjectStructure } from '@/lib/fileSystemManager';

interface ProjectFileExplorerProps {
  onFileSelect?: (file: { name: string; content: string; path: string }) => void;
  onCreateFile?: (path: string) => void;
  onCreateFolder?: (path: string) => void;
}

const ProjectFileExplorer: React.FC<ProjectFileExplorerProps> = ({
  onFileSelect,
  onCreateFile,
  onCreateFolder,
}) => {
  const [mounted, setMounted] = useState(false);
  const [projectStructure, setProjectStructure] = useState<ProjectStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FileSystemItem;
  } | null>(null);

  // Ensure component is mounted before doing browser-specific operations
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Watch for project structure changes
    const unwatch = fileSystemManager.onStructureChange((structure) => {
      setProjectStructure(structure);
      console.log('📊 Project structure updated:', structure);
    });

    // Get initial project structure
    const currentStructure = fileSystemManager.getProjectStructure();
    if (currentStructure) {
      setProjectStructure(currentStructure);
    }

    return unwatch;
  }, [mounted]);

  const handleSelectProject = async () => {
    if (!fileSystemManager.isSupported) {
      setError('Your browser doesn\'t support the File System Access API. Please use Chrome, Edge, or another compatible browser.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🗂️ Selecting project folder...');
      const structure = await fileSystemManager.selectProjectFolder();
      setProjectStructure(structure);
      
      // Auto-expand root folders
      const rootFolders = structure.files
        .filter(item => item.type === 'folder')
        .map(item => item.path);
      setExpandedFolders(new Set(rootFolders.slice(0, 3))); // Expand first 3 folders
      
      console.log('✅ Project loaded successfully:', structure.rootPath);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select project folder';
      setError(errorMessage);
      console.error('❌ Project selection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = async (item: FileSystemItem) => {
    if (item.type === 'file') {
      setSelectedFile(item.path);
      
      try {
        let content = item.content || '';
        
        // If content is not cached, read it
        if (!content) {
          console.log('📖 Reading file content:', item.path);
          content = await fileSystemManager.readFile(item.path);
        }
        
        onFileSelect?.({
          name: item.name,
          content,
          path: item.path,
        });
        
        console.log('📄 File selected:', item.path);
      } catch (err) {
        console.error('Failed to read file:', err);
        setError(`Failed to read file: ${item.name}`);
      }
    } else {
      // Toggle folder expansion
      const newExpanded = new Set(expandedFolders);
      if (newExpanded.has(item.path)) {
        newExpanded.delete(item.path);
      } else {
        newExpanded.add(item.path);
      }
      setExpandedFolders(newExpanded);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleCreateFile = async (basePath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName) return;

    const fullPath = basePath ? `${basePath}/${fileName}` : fileName;
    
    try {
      await fileSystemManager.createFile(fullPath, '// New file created by AI Assistant\n');
      onCreateFile?.(fullPath);
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to create file:', err);
      setError(`Failed to create file: ${fileName}`);
    }
  };

  const handleCreateFolder = async (basePath: string) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName) return;

    const fullPath = basePath ? `${basePath}/${folderName}` : folderName;
    
    try {
      await fileSystemManager.createFolder(fullPath);
      onCreateFolder?.(fullPath);
      setContextMenu(null);
      
      // Auto-expand the new folder
      setExpandedFolders(prev => new Set([...Array.from(prev), fullPath]));
    } catch (err) {
      console.error('Failed to create folder:', err);
      setError(`Failed to create folder: ${folderName}`);
    }
  };

  const renderFileTree = (items: FileSystemItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-700/50 cursor-pointer transition-colors ${
            selectedFile === item.path ? 'bg-blue-600/30 border-l-2 border-blue-500' : ''
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => handleFileClick(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          {item.type === 'folder' && (
            <span className="mr-1 text-gray-400 text-xs w-3">
              {expandedFolders.has(item.path) ? '▼' : '▶'}
            </span>
          )}
          
          <span className="mr-2 text-sm">
            {item.type === 'folder' ? '📁' : getFileIcon(item.name)}
          </span>
          
          <span className="text-sm text-gray-200 truncate flex-1">{item.name}</span>
          
          {item.type === 'file' && item.size && (
            <span className="text-xs text-gray-500 ml-2">
              {formatFileSize(item.size)}
            </span>
          )}
        </div>

        {item.type === 'folder' && 
         item.children && 
         expandedFolders.has(item.path) && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  const getFileIcon = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      // Primary web technologies (main focus)
      'html': '🌐',
      'htm': '🌐',
      'css': '🎨',
      'scss': '🎨',
      'sass': '🎨',
      'js': '🟨',
      'mjs': '🟨',
      'jsx': '🟨',
      
      // Supporting files
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      
      // Web assets
      'svg': '🎭',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'webp': '🖼️',
      'ico': '🖼️',
      
      // Fonts
      'woff': '🔤',
      'woff2': '🔤',
      'ttf': '🔤',
      'eot': '🔤',
      
      // Other common files
      'xml': '📊',
      'env': '🔐',
      'zip': '📦',
    };
    
    return iconMap[extension || ''] || '📄';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mounted]);

  // Show loading state while mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Project Explorer</h3>
          <p className="text-sm text-gray-400 mb-4">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!projectStructure) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">🚀 Web Code Generator</h3>
          <p className="text-sm text-gray-400 mb-4">
            Ready to generate HTML, CSS & JavaScript
          </p>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 p-3 rounded-lg">
              <p className="text-blue-300 text-sm flex items-center space-x-2">
                <span>🌐</span>
                <span>HTML - Structure & Content</span>
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-pink-900/30 to-red-900/30 border border-pink-700/50 p-3 rounded-lg">
              <p className="text-pink-300 text-sm flex items-center space-x-2">
                <span>🎨</span>
                <span>CSS - Styling & Animation</span>
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 p-3 rounded-lg">
              <p className="text-yellow-300 text-sm flex items-center space-x-2">
                <span>🟨</span>
                <span>JavaScript - Interactivity</span>
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mt-3 bg-red-900/30 border border-red-700/50 p-3 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">📁 {projectStructure.rootPath}</h3>
          <button
            onClick={handleSelectProject}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Change
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <span>🔧 {projectStructure.framework}</span>
          <span>📄 {projectStructure.totalFiles} files</span>
          <span>📁 {projectStructure.totalFolders} folders</span>
        </div>
        
        {projectStructure.projectType && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded border border-blue-600/30">
              {projectStructure.projectType}
            </span>
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {renderFileTree(projectStructure.files)}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleCreateFile(contextMenu.item.type === 'folder' ? contextMenu.item.path : '')}
            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
          >
            📄 New File
          </button>
          <button
            onClick={() => handleCreateFolder(contextMenu.item.type === 'folder' ? contextMenu.item.path : '')}
            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors"
          >
            📁 New Folder
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/30 border-t border-red-700/50">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectFileExplorer; 