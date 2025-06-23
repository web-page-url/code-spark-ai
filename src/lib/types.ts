// Advanced type definitions for world-class AI coding assistant

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  model?: string;
  thinking?: string; // For chain-of-thought reasoning
  status: 'sending' | 'sent' | 'received' | 'error';
  metadata?: {
    codeBlocks?: CodeBlock[];
    suggestions?: CodeSuggestion[];
    files?: string[];
  };
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  startLine?: number;
  endLine?: number;
  explanation?: string;
}

export interface CodeSuggestion {
  id: string;
  type: 'fix' | 'optimize' | 'refactor' | 'feature';
  description: string;
  code: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
  content?: string;
  language?: string;
  children?: FileNode[];
  isGitTracked?: boolean;
  gitStatus?: 'untracked' | 'modified' | 'staged' | 'committed';
  aiAnalysis?: {
    complexity: number;
    issues: LintIssue[];
    suggestions: CodeSuggestion[];
  };
}

export interface LintIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  column: number;
  rule?: string;
  fixable?: boolean;
  suggestion?: string;
}

export interface EditorState {
  code: string;
  language: string;
  filename: string;
  path: string;
  isModified: boolean;
  cursor: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  foldedRegions: number[];
  breakpoints: number[];
  decorations: EditorDecoration[];
}

export interface EditorDecoration {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion' | 'highlight';
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  message?: string;
  hoverMessage?: string;
}

export interface AIProgress {
  stage: 'thinking' | 'analyzing' | 'generating' | 'reviewing' | 'complete';
  message: string;
  progress: number; // 0-100
  estimatedTime?: number; // seconds
  details?: {
    tokensProcessed?: number;
    totalTokens?: number;
    currentThought?: string;
    codeBlocksGenerated?: number;
  };
}

export interface ProjectContext {
  name: string;
  description: string;
  tech_stack: string[];
  files: FileNode[];
  dependencies: Record<string, string>;
  gitRepository?: {
    url: string;
    branch: string;
    lastCommit: string;
  };
  aiContext: {
    projectType: 'web' | 'mobile' | 'desktop' | 'api' | 'library';
    framework: string;
    conventions: string[];
    codeStyle: string;
  };
}

export interface CollaborationSession {
  id: string;
  name: string;
  participants: Participant[];
  cursors: Record<string, CursorPosition>;
  activeFile: string;
  changes: Change[];
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  isOnline: boolean;
  lastSeen: Date;
}

export interface CursorPosition {
  userId: string;
  line: number;
  column: number;
  color: string;
}

export interface Change {
  id: string;
  userId: string;
  type: 'insert' | 'delete' | 'replace';
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  content: string;
  timestamp: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  aiAssistance: {
    enabled: boolean;
    autoComplete: boolean;
    codeReview: boolean;
    suggestions: boolean;
    explanations: boolean;
  };
  shortcuts: Record<string, string>;
} 