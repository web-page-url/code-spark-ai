// TypeScript declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }
  
  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
  }
  
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  }
  
  interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | ArrayBuffer | ArrayBufferView): Promise<void>;
    close(): Promise<void>;
  }
}

interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  size?: number;
  lastModified?: Date;
  children?: FileSystemItem[];
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
}

interface ProjectStructure {
  rootPath: string;
  files: FileSystemItem[];
  totalFiles: number;
  totalFolders: number;
  projectType?: string;
  framework?: string;
  packageJson?: any;
}

class FileSystemManager {
  private rootDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private projectStructure: ProjectStructure | null = null;
  private fileCache: Map<string, string> = new Map();
  private watchers: Array<(structure: ProjectStructure) => void> = [];

  // Check if File System Access API is supported
  get isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  // Select a project folder
  async selectProjectFolder(): Promise<ProjectStructure> {
    if (!this.isSupported) {
      throw new Error('File System Access API is not supported in this browser. Please use Chrome, Edge, or another compatible browser.');
    }

    try {
      console.log('🗂️ Opening directory picker...');
      
      this.rootDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
      });

      if (!this.rootDirectoryHandle) {
        throw new Error('Failed to get directory handle');
      }

      console.log('📁 Selected directory:', this.rootDirectoryHandle.name);
      
      // Build project structure
      const structure = await this.buildProjectStructure();
      this.projectStructure = structure;
      
      // Notify watchers
      this.notifyWatchers();
      
      return structure;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Folder selection was cancelled');
      }
      throw new Error(`Failed to select folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Build project structure from directory handle
  private async buildProjectStructure(): Promise<ProjectStructure> {
    if (!this.rootDirectoryHandle) {
      throw new Error('No directory selected');
    }

    console.log('🔍 Building project structure...');
    
    const files = await this.readDirectory(this.rootDirectoryHandle, '');
    const rootPath = this.rootDirectoryHandle.name;
    
    // Analyze project type
    const projectAnalysis = this.analyzeProjectType(files);
    
    const structure: ProjectStructure = {
      rootPath,
      files,
      totalFiles: this.countFiles(files),
      totalFolders: this.countFolders(files),
      ...projectAnalysis,
    };

    console.log('📊 Project structure built:', {
      totalFiles: structure.totalFiles,
      totalFolders: structure.totalFolders,
      projectType: structure.projectType,
      framework: structure.framework,
    });

    return structure;
  }

  // Recursively read directory contents
  private async readDirectory(
    dirHandle: FileSystemDirectoryHandle, 
    currentPath: string
  ): Promise<FileSystemItem[]> {
    const items: FileSystemItem[] = [];

    try {
      for await (const [name, handle] of dirHandle.entries()) {
        // Skip hidden files and node_modules by default
        if (name.startsWith('.') || name === 'node_modules') {
          continue;
        }

        const itemPath = currentPath ? `${currentPath}/${name}` : name;
        const id = `${handle.kind}-${itemPath}`;

        if (handle.kind === 'file') {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const item: FileSystemItem = {
            id,
            name,
            path: itemPath,
            type: 'file',
            size: file.size,
            lastModified: new Date(file.lastModified),
            handle: fileHandle,
          };

          // Read content for small text files
          if (this.isTextFile(name) && file.size < 1024 * 1024) { // < 1MB
            try {
              item.content = await file.text();
              this.fileCache.set(itemPath, item.content);
            } catch (error) {
              console.warn(`Failed to read file content: ${itemPath}`, error);
            }
          }

          items.push(item);
        } else if (handle.kind === 'directory') {
          const dirHandle = handle as FileSystemDirectoryHandle;
          const children = await this.readDirectory(dirHandle, itemPath);
          const item: FileSystemItem = {
            id,
            name,
            path: itemPath,
            type: 'folder',
            children,
            handle: dirHandle,
          };
          items.push(item);
        }
      }
    } catch (error) {
      console.error('Error reading directory:', currentPath, error);
    }

    return items.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Check if file is a text file
  private isTextFile(filename: string): boolean {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.scss', '.sass',
      '.md', '.txt', '.yml', '.yaml', '.xml', '.svg', '.vue', '.py', '.java',
      '.c', '.cpp', '.h', '.hpp', '.php', '.rb', '.go', '.rs', '.sh', '.sql',
      '.env', '.gitignore', '.dockerfile', '.lock', '.toml', '.ini', '.cfg'
    ];
    
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return textExtensions.includes(extension) || !filename.includes('.');
  }

  // Analyze project type based on files
  private analyzeProjectType(files: FileSystemItem[]): { projectType?: string; framework?: string; packageJson?: any } {
    const flatFiles = this.flattenFiles(files);
    const fileNames = flatFiles.map(f => f.name.toLowerCase());
    
    let projectType = 'unknown';
    let framework = 'unknown';
    let packageJson = null;

    // Check for package.json
    const packageJsonFile = flatFiles.find(f => f.name === 'package.json');
    if (packageJsonFile && packageJsonFile.content) {
      try {
        packageJson = JSON.parse(packageJsonFile.content);
        projectType = 'javascript';
        
        // Determine framework from dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps.react) framework = 'react';
        else if (deps.vue) framework = 'vue';
        else if (deps.angular) framework = 'angular';
        else if (deps.next) framework = 'nextjs';
        else if (deps.nuxt) framework = 'nuxtjs';
        else if (deps.svelte) framework = 'svelte';
        else if (deps.express) framework = 'express';
        else if (deps.nestjs) framework = 'nestjs';
      } catch (error) {
        console.warn('Failed to parse package.json', error);
      }
    }

    // Check other project types
    if (fileNames.includes('cargo.toml')) {
      projectType = 'rust';
      framework = 'cargo';
    } else if (fileNames.includes('go.mod')) {
      projectType = 'go';
    } else if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
      projectType = 'java';
      framework = fileNames.includes('pom.xml') ? 'maven' : 'gradle';
    } else if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
      projectType = 'python';
    } else if (fileNames.includes('gemfile')) {
      projectType = 'ruby';
      framework = 'ruby';
    }

    return { projectType, framework, packageJson };
  }

  // Flatten file structure for analysis
  private flattenFiles(files: FileSystemItem[]): FileSystemItem[] {
    const result: FileSystemItem[] = [];
    
    for (const file of files) {
      if (file.type === 'file') {
        result.push(file);
      } else if (file.children) {
        result.push(...this.flattenFiles(file.children));
      }
    }
    
    return result;
  }

  // Count files recursively
  private countFiles(files: FileSystemItem[]): number {
    return files.reduce((count, item) => {
      if (item.type === 'file') return count + 1;
      if (item.children) return count + this.countFiles(item.children);
      return count;
    }, 0);
  }

  // Count folders recursively
  private countFolders(files: FileSystemItem[]): number {
    return files.reduce((count, item) => {
      if (item.type === 'folder') {
        const childCount = item.children ? this.countFolders(item.children) : 0;
        return count + 1 + childCount;
      }
      return count;
    }, 0);
  }

  // Read file content
  async readFile(path: string): Promise<string> {
    if (this.fileCache.has(path)) {
      return this.fileCache.get(path)!;
    }

    const fileHandle = await this.getFileHandle(path);
    if (!fileHandle) {
      throw new Error(`File not found: ${path}`);
    }

    const file = await fileHandle.getFile();
    const content = await file.text();
    this.fileCache.set(path, content);
    return content;
  }

  // Write file content
  async writeFile(path: string, content: string): Promise<void> {
    console.log('💾 Writing file:', path);
    
    const fileHandle = await this.getFileHandle(path, true);
    if (!fileHandle) {
      throw new Error(`Cannot create/access file: ${path}`);
    }

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // Update cache
    this.fileCache.set(path, content);
    
    // Refresh project structure
    await this.refreshProjectStructure();
    
    console.log('✅ File written successfully:', path);
  }

  // Create new file
  async createFile(path: string, content: string = ''): Promise<void> {
    console.log('📄 Creating new file:', path);
    
    if (!this.rootDirectoryHandle) {
      throw new Error('No project folder selected');
    }

    const pathParts = path.split('/');
    const fileName = pathParts.pop()!;
    const dirPath = pathParts;

    // Create directories if needed
    let currentDir = this.rootDirectoryHandle;
    for (const dirName of dirPath) {
      if (dirName) {
        currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
      }
    }

    // Create file
    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // Update cache
    this.fileCache.set(path, content);
    
    // Refresh project structure
    await this.refreshProjectStructure();
    
    console.log('✅ File created successfully:', path);
  }

  // Create new folder
  async createFolder(path: string): Promise<void> {
    console.log('📁 Creating new folder:', path);
    
    if (!this.rootDirectoryHandle) {
      throw new Error('No project folder selected');
    }

    const pathParts = path.split('/').filter(part => part);
    let currentDir = this.rootDirectoryHandle;
    
    for (const dirName of pathParts) {
      currentDir = await currentDir.getDirectoryHandle(dirName, { create: true });
    }

    // Refresh project structure
    await this.refreshProjectStructure();
    
    console.log('✅ Folder created successfully:', path);
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    console.log('🗑️ Deleting file:', path);
    
    const pathParts = path.split('/');
    const fileName = pathParts.pop()!;
    const fileHandle = await this.getFileHandle(pathParts.join('/'));
    
    if (!fileHandle) {
      throw new Error(`File not found: ${path}`);
    }

    // Note: File System Access API doesn't have delete yet, so we'll just clear the file
    const writable = await fileHandle.createWritable();
    await writable.write('');
    await writable.close();

    // Remove from cache
    this.fileCache.delete(path);
    
    console.log('✅ File deleted (cleared):', path);
  }

  // Get file handle by path
  private async getFileHandle(path: string, create: boolean = false): Promise<FileSystemFileHandle | null> {
    if (!this.rootDirectoryHandle) return null;

    const pathParts = path.split('/').filter(part => part);
    let currentDir = this.rootDirectoryHandle;

    // Navigate to directory
    for (let i = 0; i < pathParts.length - 1; i++) {
      try {
        currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create });
      } catch (error) {
        if (!create) return null;
        throw error;
      }
    }

    // Get file handle
    const fileName = pathParts[pathParts.length - 1];
    if (!fileName) return null;

    try {
      return await currentDir.getFileHandle(fileName, { create });
    } catch (error) {
      if (!create) return null;
      throw error;
    }
  }

  // Refresh project structure
  private async refreshProjectStructure(): Promise<void> {
    if (this.rootDirectoryHandle) {
      this.projectStructure = await this.buildProjectStructure();
      this.notifyWatchers();
    }
  }

  // Watch for structure changes
  onStructureChange(callback: (structure: ProjectStructure) => void): () => void {
    this.watchers.push(callback);
    return () => {
      const index = this.watchers.indexOf(callback);
      if (index > -1) this.watchers.splice(index, 1);
    };
  }

  // Notify all watchers
  private notifyWatchers(): void {
    if (this.projectStructure) {
      this.watchers.forEach(callback => callback(this.projectStructure!));
    }
  }

  // Get current project structure
  getProjectStructure(): ProjectStructure | null {
    return this.projectStructure;
  }

  // Generate project context for AI
  generateProjectContext(): string {
    if (!this.projectStructure) {
      return 'No project selected';
    }

    const { rootPath, projectType, framework, totalFiles, totalFolders, packageJson } = this.projectStructure;
    
    let context = `**Current Project: ${rootPath}**\n\n`;
    context += `**Project Type:** ${projectType}\n`;
    context += `**Framework:** ${framework}\n`;
    context += `**Total Files:** ${totalFiles}\n`;
    context += `**Total Folders:** ${totalFolders}\n\n`;

    if (packageJson) {
      context += `**Package.json Info:**\n`;
      context += `- Name: ${packageJson.name || 'N/A'}\n`;
      context += `- Version: ${packageJson.version || 'N/A'}\n`;
      context += `- Description: ${packageJson.description || 'N/A'}\n`;
      
      if (packageJson.scripts) {
        context += `- Scripts: ${Object.keys(packageJson.scripts).join(', ')}\n`;
      }
    }

    context += `\n**Project Structure:**\n`;
    context += this.generateFileTree(this.projectStructure.files, 0);

    return context;
  }

  // Generate file tree string
  private generateFileTree(files: FileSystemItem[], depth: number): string {
    const indent = '  '.repeat(depth);
    let tree = '';

    for (const file of files.slice(0, 50)) { // Limit to first 50 items
      const icon = file.type === 'folder' ? '📁' : '📄';
      tree += `${indent}${icon} ${file.name}\n`;
      
      if (file.children && depth < 3) { // Limit depth to 3
        tree += this.generateFileTree(file.children, depth + 1);
      }
    }

    return tree;
  }

  // Clear cache and reset
  reset(): void {
    this.rootDirectoryHandle = null;
    this.projectStructure = null;
    this.fileCache.clear();
    this.watchers = [];
  }
}

// Export singleton instance
export const fileSystemManager = new FileSystemManager();

// Export types
export type { FileSystemItem, ProjectStructure }; 