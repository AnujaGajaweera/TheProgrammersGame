import React from 'react';
import { Terminal, Zap, Shield, Skull } from 'lucide-react';
import { GameState } from '../types/game';

interface GameHeaderProps {
  gameState: GameState;
  currentLevelName: string;
  isHacked: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  gameState, 
  currentLevelName, 
  isHacked 
}) => {
  return (
    <div className={`bg-gray-900 border-b-2 p-4 transition-all duration-300 ${
      isHacked ? 'border-red-500 bg-red-900/20' : 'border-green-500'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Terminal className={`w-8 h-8 ${isHacked ? 'text-red-500' : 'text-green-500'}`} />
            <h1 className="text-2xl font-bold font-mono">
              <span className="text-green-500">THE</span>
              <span className="text-white mx-2">PROGRAMMER'S</span>
              <span className="text-red-500">GAME</span>
            </h1>
          </div>
          
          {isHacked && (
            <div className="flex items-center space-x-2 animate-pulse">
              <Skull className="w-6 h-6 text-red-500" />
              <span className="text-red-500 font-mono text-sm font-bold">
                SYSTEM COMPROMISED
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Level Display */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-mono text-sm">LEVEL:</span>
            <span className={`font-mono font-bold ${
              isHacked ? 'text-red-500' : 'text-green-500'
            }`}>
              {currentLevelName}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400 font-mono text-sm">SCORE:</span>
            <span className="text-yellow-500 font-mono font-bold">
              {gameState.score.toLocaleString()}
            </span>
          </div>

          {/* Lives */}
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400 font-mono text-sm">LIVES:</span>
            <div className="flex space-x-1">
              {Array.from({ length: gameState.lives }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};