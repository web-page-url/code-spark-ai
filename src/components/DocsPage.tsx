'use client';

import React, { useState } from 'react';

const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'ai-generation', title: 'AI Code Generation', icon: '🤖' },
    { id: 'accept-reject', title: 'Accept/Reject Workflow', icon: '✅' },
    { id: 'workspace', title: 'Workspace Management', icon: '🎛️' },
    { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: '⌨️' },
    { id: 'tips', title: 'Pro Tips', icon: '💡' },
  ];

  const ScrollToSection = ({ sectionId }: { sectionId: string }) => (
    <button
      onClick={() => setActiveSection(sectionId)}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
        activeSection === sectionId 
          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-300' 
          : 'text-gray-300 hover:bg-gray-700/30 hover:text-white'
      }`}
    >
      <span className="text-lg">{sections.find(s => s.id === sectionId)?.icon}</span>
      <span className="font-medium">{sections.find(s => s.id === sectionId)?.title}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-cyan-900/30 border-b border-gray-600/50">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <span className="text-6xl animate-pulse">⚡</span>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                CodeSpark Docs
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master the art of AI-powered web development. Transform your ideas into production-ready 
              HTML, CSS, and JavaScript code with the most advanced AI coding assistant.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2 text-green-400">
                <span>✨</span>
                <span className="font-medium">Intelligent Code Generation</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span>🚀</span>
                <span className="font-medium">Real-time Preview</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400">
                <span>⚡</span>
                <span className="font-medium">Professional Workflow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 space-y-2">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <span>📚</span>
                <span>Table of Contents</span>
              </h3>
              <div className="space-y-1">
                {sections.map(section => (
                  <ScrollToSection key={section.id} sectionId={section.id} />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Getting Started Section */}
            {activeSection === 'getting-started' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">🚀</span>
                    <span>Getting Started with CodeSpark</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Welcome to the future of web development! CodeSpark is your AI-powered companion that transforms 
                    natural language into professional web code.
                  </p>
                </div>

                {/* Quick Start Guide */}
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Quick Start in 3 Steps</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <h4 className="font-semibold text-green-300">Choose Your Language</h4>
                        <p className="text-gray-300">Select HTML, CSS, or JavaScript from the language dropdown in the top-left.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <h4 className="font-semibold text-green-300">Describe What You Want</h4>
                        <p className="text-gray-300">Type your request in the chat panel: "Create a modern landing page" or "Add smooth animations"</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <h4 className="font-semibold text-green-300">Accept or Refine</h4>
                        <p className="text-gray-300">Review the generated code and use the Accept/Reject buttons to control your codebase.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="text-lg font-semibold text-white mb-2">HTML Generation</h3>
                    <p className="text-gray-300 text-sm">Create semantic, accessible HTML structures with modern best practices.</p>
                    <div className="mt-3 text-xs text-blue-300">
                      <span className="bg-blue-900/30 px-2 py-1 rounded">Semantic Elements</span>
                      <span className="bg-blue-900/30 px-2 py-1 rounded ml-1">Accessibility</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 border border-pink-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">🎨</div>
                    <h3 className="text-lg font-semibold text-white mb-2">CSS Styling</h3>
                    <p className="text-gray-300 text-sm">Generate modern CSS with Flexbox, Grid, animations, and responsive design.</p>
                    <div className="mt-3 text-xs text-pink-300">
                      <span className="bg-pink-900/30 px-2 py-1 rounded">Flexbox</span>
                      <span className="bg-pink-900/30 px-2 py-1 rounded ml-1">Animations</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">🟨</div>
                    <h3 className="text-lg font-semibold text-white mb-2">JavaScript Logic</h3>
                    <p className="text-gray-300 text-sm">Create interactive functionality with modern ES6+ JavaScript and DOM manipulation.</p>
                    <div className="mt-3 text-xs text-yellow-300">
                      <span className="bg-yellow-900/30 px-2 py-1 rounded">ES6+</span>
                      <span className="bg-yellow-900/30 px-2 py-1 rounded ml-1">DOM APIs</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generation Section */}
            {activeSection === 'ai-generation' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">🤖</span>
                    <span>AI Code Generation Mastery</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Learn how to communicate effectively with CodeSpark's AI to get exactly the code you need.
                  </p>
                </div>

                {/* Effective Prompting */}
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>💬</span>
                    <span>Effective Prompting Techniques</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-green-300 mb-2">✅ Great Prompts</h4>
                      <div className="space-y-2">
                        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                          <code className="text-green-300">"Create a responsive navigation bar with a logo and 4 menu items"</code>
                        </div>
                        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                          <code className="text-green-300">"Add CSS animations to make the cards slide in from the left"</code>
                        </div>
                        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                          <code className="text-green-300">"Create a JavaScript function to validate email input with regex"</code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">❌ Avoid These</h4>
                      <div className="space-y-2">
                        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                          <code className="text-red-300">"Make it better" (too vague)</code>
                        </div>
                        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                          <code className="text-red-300">"Add stuff" (not specific)</code>
                        </div>
                        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                          <code className="text-red-300">"Fix this" (no context)</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prompt Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center space-x-2">
                      <span>🌐</span>
                      <span>HTML Prompt Templates</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">• "Create a [component] with [features]"</div>
                      <div className="text-gray-300">• "Build a [page type] that includes [elements]"</div>
                      <div className="text-gray-300">• "Add [semantic element] for [purpose]"</div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                    <h4 className="font-semibold text-pink-300 mb-3 flex items-center space-x-2">
                      <span>🎨</span>
                      <span>CSS Prompt Templates</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-300">• "Style [element] with [design pattern]"</div>
                      <div className="text-gray-300">• "Create [animation type] for [target]"</div>
                      <div className="text-gray-300">• "Make it responsive for [device sizes]"</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accept/Reject Workflow */}
            {activeSection === 'accept-reject' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">✅</span>
                    <span>Accept/Reject Workflow</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Master the professional code review workflow that gives you complete control over your codebase.
                  </p>
                </div>

                {/* Workflow Steps */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <span>🔄</span>
                    <span>The Professional Workflow</span>
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-300 mb-2">AI Generates Code</h4>
                        <p className="text-gray-300 mb-3">After you submit a request, the AI analyzes your current code and generates improvements.</p>
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-300">Code changes ready</span>
                            <span className="text-green-400 font-mono">+15</span>
                            <span className="text-red-400 font-mono">-3</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-300 mb-2">Review the Diff</h4>
                        <p className="text-gray-300 mb-3">Examine line-by-line changes with professional diff viewer showing additions and deletions.</p>
                        <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs">
                          <div className="flex items-center px-2 py-1 bg-green-500/20 border-l-2 border-green-500">
                            <span className="text-green-400 w-6">+</span>
                            <span className="text-green-300">&lt;nav class="navbar modern"&gt;</span>
                          </div>
                          <div className="flex items-center px-2 py-1 bg-red-500/20 border-l-2 border-red-500">
                            <span className="text-red-400 w-6">-</span>
                            <span className="text-red-300">&lt;div class="menu"&gt;</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-300 mb-2">Make Your Decision</h4>
                        <p className="text-gray-300 mb-3">Choose from multiple options to control exactly how the code is applied.</p>
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center space-x-1">
                            <span>✓</span>
                            <span>Accept</span>
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center space-x-1">
                            <span>✕</span>
                            <span>Reject</span>
                          </button>
                          <button className="px-3 py-2 bg-blue-600/70 text-white rounded-lg text-sm flex items-center space-x-1">
                            <span>➕</span>
                            <span>Append</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-green-300 mb-2">Accept Changes</h3>
                    <p className="text-gray-300 text-sm mb-3">Replace your current code with the AI's improved version. Perfect for upgrades and fixes.</p>
                    <div className="text-xs text-green-400">
                      <kbd className="bg-green-800 px-2 py-1 rounded">Enter</kbd> or click Accept
                    </div>
                  </div>

                  <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">❌</div>
                    <h3 className="text-lg font-semibold text-red-300 mb-2">Reject Changes</h3>
                    <p className="text-gray-300 text-sm mb-3">Keep your current code unchanged. Use when the AI's suggestion doesn't fit your needs.</p>
                    <div className="text-xs text-red-400">
                      <kbd className="bg-red-800 px-2 py-1 rounded">Esc</kbd> or click Reject
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-6">
                    <div className="text-3xl mb-3">➕</div>
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Append Code</h3>
                    <p className="text-gray-300 text-sm mb-3">Add the AI's code to the end of your existing code. Great for adding new features.</p>
                    <div className="text-xs text-blue-400">
                      Click Append Instead
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Management */}
            {activeSection === 'workspace' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">🎛️</span>
                    <span>Workspace Management</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Customize your development environment for maximum productivity and comfort.
                  </p>
                </div>

                {/* Panel Controls */}
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <span>📐</span>
                    <span>Resizable Panels</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-3">Sidebar Control</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <button className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-gray-300">Toggle sidebar visibility</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          • Drag resize handle to adjust width<br />
                          • Press <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">Ctrl+B</kbd> to toggle<br />
                          • Min: 200px, Max: 600px
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-cyan-300 mb-3">Chat Panel</h4>
                      <div className="space-y-3">
                        <div className="text-gray-300">Resize chat for optimal workflow</div>
                        <div className="text-sm text-gray-400">
                          • Drag the vertical resize handle<br />
                          • Wider for detailed conversations<br />
                          • Min: 300px, Max: 800px
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editor Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center space-x-2">
                      <span>⚙️</span>
                      <span>Editor Controls</span>
                    </h4>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Language selector (HTML/CSS/JS)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Copy, Save, Live Preview buttons</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>Monaco Editor with syntax highlighting</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6">
                    <h4 className="font-semibold text-green-300 mb-3 flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Auto-Save & Status</span>
                    </h4>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span>Auto-save when files are modified</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Manual save with Ctrl+S</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Real-time modification tracking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {activeSection === 'shortcuts' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">⌨️</span>
                    <span>Keyboard Shortcuts</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Master these shortcuts to become a CodeSpark power user and boost your productivity.
                  </p>
                </div>

                {/* Shortcut Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-600/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <span>✅</span>
                      <span>Code Review Shortcuts</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Accept changes</span>
                        <kbd className="bg-green-800 px-2 py-1 rounded text-green-300 text-sm">Enter</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Reject changes</span>
                        <kbd className="bg-red-800 px-2 py-1 rounded text-red-300 text-sm">Esc</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Force replace</span>
                        <kbd className="bg-blue-800 px-2 py-1 rounded text-blue-300 text-sm">Ctrl+R</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Force append</span>
                        <kbd className="bg-purple-800 px-2 py-1 rounded text-purple-300 text-sm">Ctrl+A</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-600/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <span>🎛️</span>
                      <span>Workspace Shortcuts</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Toggle sidebar</span>
                        <kbd className="bg-blue-800 px-2 py-1 rounded text-blue-300 text-sm">Ctrl+B</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Save file</span>
                        <kbd className="bg-green-800 px-2 py-1 rounded text-green-300 text-sm">Ctrl+S</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">New file</span>
                        <kbd className="bg-yellow-800 px-2 py-1 rounded text-yellow-300 text-sm">Ctrl+Shift+N</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Debug panel</span>
                        <kbd className="bg-gray-800 px-2 py-1 rounded text-gray-300 text-sm">Ctrl+`</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Power User Tips</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Hold <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">Alt+Enter</kbd> for quick accept without review</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Use <kbd className="bg-gray-700 px-1 py-0.5 rounded text-xs">Ctrl+Z</kbd> to cancel pending code replacements</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Resize panels by dragging the vertical handles</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Auto-replacement triggers in 2 seconds for obvious improvements</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pro Tips Section */}
            {activeSection === 'tips' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                    <span className="text-4xl">💡</span>
                    <span>Pro Tips & Best Practices</span>
                  </h2>
                  <p className="text-gray-300 text-lg mb-8">
                    Unlock the full potential of CodeSpark with these expert techniques and workflows.
                  </p>
                </div>

                {/* Advanced Techniques */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <span>🧠</span>
                      <span>Advanced AI Prompting</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-purple-300 mb-3">Context-Aware Requests</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>• "Based on the current navigation, add a mobile hamburger menu"</div>
                          <div>• "Extend this card component with hover animations"</div>
                          <div>• "Make this form responsive and add validation feedback"</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-pink-300 mb-3">Iterative Improvement</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>• "Make the colors more vibrant and modern"</div>
                          <div>• "Add smooth transitions to all interactive elements"</div>
                          <div>• "Optimize this code for better performance"</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-600/30 rounded-xl p-6">
                      <div className="text-3xl mb-3">🚀</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Productivity Hacks</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>• Use specific component names in requests</div>
                        <div>• Reference existing styles for consistency</div>
                        <div>• Ask for explanations of complex code</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-xl p-6">
                      <div className="text-3xl mb-3">🎨</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Design Patterns</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>• Request specific CSS methodologies (BEM, etc.)</div>
                        <div>• Ask for accessibility improvements</div>
                        <div>• Include responsive breakpoints in requests</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-600/30 rounded-xl p-6">
                      <div className="text-3xl mb-3">⚡</div>
                      <h3 className="text-lg font-semibold text-white mb-2">Performance Tips</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <div>• Request optimized CSS selectors</div>
                        <div>• Ask for efficient JavaScript patterns</div>
                        <div>• Include performance considerations</div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow Examples */}
                  <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-600/30 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Recommended Workflows</span>
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-cyan-300 mb-2">Building a Complete Page</h4>
                        <div className="space-y-1 text-sm text-gray-300 ml-4">
                          <div>1. Start with HTML structure: "Create a landing page with header, hero, features, and footer"</div>
                          <div>2. Add CSS styling: "Style the hero section with a gradient background and centered content"</div>
                          <div>3. Enhance interactivity: "Add smooth scroll navigation and hover effects"</div>
                          <div>4. Refine details: "Make the call-to-action button more prominent with animations"</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-cyan-300 mb-2">Debugging & Optimization</h4>
                        <div className="space-y-1 text-sm text-gray-300 ml-4">
                          <div>1. Identify issues: "This layout breaks on mobile, fix the responsive design"</div>
                          <div>2. Performance tuning: "Optimize this CSS for better loading speed"</div>
                          <div>3. Accessibility: "Add proper ARIA labels and keyboard navigation"</div>
                          <div>4. Cross-browser: "Ensure this works in older browsers with fallbacks"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage; 