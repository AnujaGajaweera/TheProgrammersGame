import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Lightbulb, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
  onRunCode: () => void;
  onReset: () => void;
  onHint: () => void;
  isRunning: boolean;
  hasError: boolean;
  glitchMode?: boolean;
  isMobile?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode,
  onCodeChange,
  onRunCode,
  onReset,
  onHint,
  isRunning,
  hasError,
  glitchMode = false,
  isMobile = false
}) => {
  const [code, setCode] = useState(initialCode);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      onCodeChange(newCode);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }

    if (e.ctrlKey && e.key === 'Enter') {
      onRunCode();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`
      bg-gray-900 rounded-lg border-2 transition-all duration-300 
      ${hasError ? 'border-red-500' : 'border-gray-700'}
      ${glitchMode ? 'animate-pulse' : ''}
      ${isFullscreen ? 'fixed inset-4 z-50' : ''}
    `}>
      {/* Editor Header */}
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 sm:ml-4 text-gray-400 font-mono text-xs sm:text-sm">code.py</span>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {isMobile && (
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-400 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          )}
          
          <button
            onClick={onHint}
            className="p-1.5 sm:p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
            title="Get Hint"
          >
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={onReset}
            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-400 transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className={`
              flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-xs sm:text-sm font-bold
              transition-all duration-300
              ${isRunning 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-105 active:scale-95'
              }
            `}
            title="Run Code (Ctrl+Enter)"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{isRunning ? 'RUNNING...' : 'RUN'}</span>
            <span className="sm:hidden">{isRunning ? '...' : 'RUN'}</span>
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-gray-800 border-r border-gray-700 p-2 sm:p-4 text-right min-w-[2rem] sm:min-w-[3rem]">
            {lineNumbers.map(num => (
              <div key={num} className="text-gray-500 font-mono text-xs sm:text-sm leading-5 sm:leading-6">
                {num}
              </div>
            ))}
          </div>
          
          {/* Code Input */}
          <textarea
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            className={`
              flex-1 bg-transparent text-white font-mono text-xs sm:text-sm p-2 sm:p-4 resize-none
              focus:outline-none leading-5 sm:leading-6 
              ${isFullscreen ? 'min-h-[calc(100vh-12rem)]' : isMobile ? 'min-h-[250px]' : 'min-h-[300px]'}
              ${glitchMode ? 'text-red-500' : ''}
            `}
            placeholder="# Start coding here..."
            spellCheck={false}
          />
        </div>
        
        {/* Glitch Overlay */}
        {glitchMode && (
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {hasError && (
        <div className="flex items-center space-x-2 p-2 sm:p-3 bg-red-900/30 border-t border-red-500">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <span className="text-red-400 font-mono text-xs sm:text-sm">Syntax Error Detected</span>
        </div>
      )}

      {/* Mobile Keyboard Helper */}
      {isMobile && (
        <div className="p-2 bg-gray-800 border-t border-gray-700 rounded-b-lg">
          <div className="flex flex-wrap gap-1 text-xs">
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newCode = code.substring(0, start) + '    ' + code.substring(start);
                  setCode(newCode);
                  onCodeChange(newCode);
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded font-mono"
            >
              TAB
            </button>
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newCode = code.substring(0, start) + '(' + code.substring(start);
                  setCode(newCode);
                  onCodeChange(newCode);
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded font-mono"
            >
              ( )
            </button>
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newCode = code.substring(0, start) + '[' + code.substring(start);
                  setCode(newCode);
                  onCodeChange(newCode);
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded font-mono"
            >
              [ ]
            </button>
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newCode = code.substring(0, start) + '"' + code.substring(start);
                  setCode(newCode);
                  onCodeChange(newCode);
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded font-mono"
            >
              " "
            </button>
            <button
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newCode = code.substring(0, start) + ':' + code.substring(start);
                  setCode(newCode);
                  onCodeChange(newCode);
                }
              }}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded font-mono"
            >
              :
            </button>
          </div>
        </div>
      )}
    </div>
  );
};