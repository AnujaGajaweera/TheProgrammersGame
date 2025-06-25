import React from 'react';
import { Target, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Challenge } from '../types/game';

interface ChallengePanelProps {
  challenge: Challenge;
  currentChallenge: number;
  totalChallenges: number;
  activeRules: string[];
  timeLeft?: number;
  isHacked: boolean;
}

export const ChallengePanel: React.FC<ChallengePanelProps> = ({
  challenge,
  currentChallenge,
  totalChallenges,
  activeRules,
  timeLeft,
  isHacked
}) => {
  const getChallengeIcon = () => {
    switch (challenge.type) {
      case 'debug': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'repair': return <Shield className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'reverse': return <Target className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <Target className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getChallengeColor = () => {
    switch (challenge.type) {
      case 'debug': return 'text-yellow-500';
      case 'repair': return 'text-red-500';
      case 'reverse': return 'text-purple-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border-2 p-4 sm:p-6 transition-all duration-300 ${
      isHacked ? 'border-red-500 animate-pulse' : 'border-gray-700'
    }`}>
      {/* Challenge Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={getChallengeColor()}>
            {getChallengeIcon()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-mono">
              {challenge.title}
            </h2>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
              <span>Challenge {currentChallenge + 1} of {totalChallenges}</span>
              <span>•</span>
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold ${getChallengeColor()} bg-opacity-20`}>
                {challenge.type.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        {timeLeft && (
          <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg ${
            timeLeft < 30 ? 'bg-red-900 text-red-400' : 'bg-gray-700 text-gray-300'
          }`}>
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-mono font-bold text-xs sm:text-sm">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Challenge Description */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Objective</h3>
        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
          {challenge.description}
        </p>
      </div>

      {/* Expected Output */}
      {challenge.expectedOutput && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Expected Output</h3>
          <pre className="bg-gray-900 border border-gray-600 rounded-lg p-2 sm:p-3 text-green-400 font-mono text-xs sm:text-sm overflow-x-auto">
            {challenge.expectedOutput}
          </pre>
        </div>
      )}

      {/* Active Rules */}
      {activeRules.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center space-x-2">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            <span>Active Rules</span>
          </h3>
          <div className="space-y-2">
            {activeRules.map((rule, index) => (
              <div 
                key={index}
                className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-2 sm:p-3"
              >
                <span className="text-yellow-400 font-mono text-xs sm:text-sm">
                  ⚠️ {rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hack Warning */}
      {isHacked && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 sm:p-4 animate-pulse">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-mono font-bold text-sm sm:text-base">
              CYBER ATTACK IN PROGRESS
            </span>
          </div>
          <p className="text-red-300 text-xs sm:text-sm mt-2">
            Your system has been compromised! Complete the challenge quickly before total system failure.
          </p>
        </div>
      )}
    </div>
  );
};