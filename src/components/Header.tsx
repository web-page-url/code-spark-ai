'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  currentFile?: string;
}

const Header: React.FC<HeaderProps> = ({ currentFile }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 shadow-xl">
        <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
            {/* 🔥 Enhanced Logo and Branding */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                    ⚡
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 opacity-20 blur-lg animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                    CodeSpark
                  </span>
                  <div className="text-xs text-gray-400 -mt-1">AI-Powered Web Development</div>
                </div>
            </Link>
            
              {/* Status Badge */}
              <div className="hidden lg:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">LIVE</span>
              </div>
          </div>

            {/* 🎛️ Enhanced Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                href="/" 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-200 flex items-center space-x-2"
              >
                <span>💻</span>
                <span>Editor</span>
            </Link>
              
              <button
                onClick={() => setShowAbout(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>ℹ️</span>
                <span>About</span>
              </button>
              
              <Link 
                href="/docs" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>📚</span>
                <span>Docs</span>
            </Link>
              
              <Link 
                href="/settings" 
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Settings</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

        {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-600/50" id="mobile-menu">
            <div className="px-4 pt-2 pb-3 space-y-1 bg-gray-800/50 backdrop-blur-sm">
              <Link 
                href="/" 
                className="block px-4 py-3 rounded-lg text-base font-semibold text-white bg-blue-600/20 border border-blue-500/30 flex items-center space-x-3"
              >
                <span>💻</span>
                <span>Editor</span>
            </Link>
              
              <button
                onClick={() => {
                  setShowAbout(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center space-x-3"
              >
                <span>ℹ️</span>
                <span>About</span>
              </button>
              
              <Link 
                href="/docs" 
                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center space-x-3"
              >
                <span>📚</span>
                <span>Documentation</span>
            </Link>
              
              <Link 
                href="/settings" 
                className="block px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 flex items-center space-x-3"
              >
                <span>⚙️</span>
                <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </header>

      {/* 🎉 STUNNING ABOUT MODAL */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-600/50 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border-b border-gray-600/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                      CodeSpark
                    </h2>
                    <p className="text-sm text-gray-400">AI-Powered Web Development Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* About the Platform */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>🚀</span>
                  <span>About CodeSpark</span>
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  CodeSpark is a revolutionary AI-powered web development platform that transforms your ideas into production-ready HTML, CSS, and JavaScript code. 
                  Experience the future of web development with intelligent code generation, real-time preview, and professional-grade output.
                </p>
              </div>

              {/* Developer Credits */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-600/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>👨‍💻</span>
                  <span>Built by</span>
                </h3>
                <div className="space-y-2">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Anubhav Chaudhary
                  </div>
                  <div className="text-gray-300 font-medium">
                    B.Tech CSE, IIT Mandi
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-3">
                    <div className="flex items-center space-x-1">
                      <span>🎓</span>
                      <span>Computer Science & Engineering</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>🏛️</span>
                      <span>Indian Institute of Technology Mandi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <span>✨</span>
                  <span>Key Features</span>
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span>AI-powered HTML, CSS & JavaScript generation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span>Real-time code preview and editing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span>Professional code acceptance/rejection workflow</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    <span>Resizable panels for optimal workspace</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-600/30">
                <button
                  onClick={() => setShowAbout(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Got it! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 