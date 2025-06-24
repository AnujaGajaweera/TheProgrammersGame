import React, { useEffect, useRef } from 'react';
import { Terminal, Check, X, AlertTriangle } from 'lucide-react';

interface OutputConsoleProps {
  output: string;
  error?: string;
  success?: boolean;
  isRunning: boolean;
  testResults?: {
    passed: number;
    total: number;
  };
  glitchMode?: boolean;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  output,
  error,
  success,
  isRunning,
  testResults,
  glitchMode = false
}) => {
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output, error]);

  const getStatusIcon = () => {
    if (isRunning) return <Terminal className="w-4 h-4 animate-spin" />;
    if (error) return <X className="w-4 h-4 text-red-500" />;
    if (success) return <Check className="w-4 h-4 text-green-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isRunning) return 'EXECUTING...';
    if (error) return 'ERROR';
    if (success) return 'SUCCESS';
    return 'READY';
  };

  const getStatusColor = () => {
    if (isRunning) return 'text-blue-500';
    if (error) return 'text-red-500';
    if (success) return 'text-green-500';
    return 'text-yellow-500';
  };

  return (
    <div className={`bg-gray-900 rounded-lg border-2 transition-all duration-300 ${
      error ? 'border-red-500' : success ? 'border-green-500' : 'border-gray-700'
    } ${glitchMode ? 'animate-pulse' : ''}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-mono text-sm font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {testResults && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-mono text-sm">Tests:</span>
            <span className={`font-mono text-sm font-bold ${
              testResults.passed === testResults.total ? 'text-green-500' : 'text-red-500'
            }`}>
              {testResults.passed}/{testResults.total}
            </span>
          </div>
        )}
      </div>

      {/* Console Output */}
      <div 
        ref={consoleRef}
        className={`p-4 font-mono text-sm min-h-[200px] max-h-[300px] overflow-y-auto ${
          glitchMode ? 'text-red-400' : 'text-green-400'
        }`}
      >
        {isRunning && (
          <div className="text-blue-400 animate-pulse">
            &gt; Executing code...
          </div>
        )}
        
        {output && (
          <div className="whitespace-pre-wrap">
            <span className="text-gray-500">&gt; </span>
            {output}
          </div>
        )}
        
        {error && (
          <div className="text-red-400 mt-2">
            <span className="text-gray-500">&gt; ERROR: </span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-400 mt-2">
            <span className="text-gray-500">&gt; </span>
            ✓ Challenge completed successfully!
          </div>
        )}
        
        {/* Glitch Effect */}
        {glitchMode && (
          <div className="text-red-500 animate-pulse mt-2">
            <span className="text-gray-500">&gt; </span>
            [CORRUPTED DATA DETECTED] [MALWARE INJECTION ATTEMPT]
          </div>
        )}
      </div>
    </div>
  );
};