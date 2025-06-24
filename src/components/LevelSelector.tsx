import React from 'react';
import { Lock, CheckCircle, AlertTriangle, Skull, Crown, Eye, Zap } from 'lucide-react';
import { GameLevel } from '../types/game';

interface LevelSelectorProps {
  levels: GameLevel[];
  currentLevel: number;
  onLevelSelect: (levelId: number) => void;
}

const difficultyColors = {
  practice: 'bg-gray-600 text-gray-300 border-gray-500',
  noob: 'bg-green-600 text-green-300 border-green-500',
  easy: 'bg-blue-600 text-blue-300 border-blue-500',
  normal: 'bg-yellow-600 text-yellow-300 border-yellow-500',
  hard: 'bg-orange-600 text-orange-300 border-orange-500',
  veryhard: 'bg-red-600 text-red-300 border-red-500',
  extreme: 'bg-purple-600 text-purple-300 border-purple-500',
  pro: 'bg-pink-600 text-pink-300 border-pink-500',
  ultrapro: 'bg-indigo-600 text-indigo-300 border-indigo-500',
  max: 'bg-red-800 text-red-400 border-red-600',
  legendary: 'bg-black text-red-500 border-red-500 shadow-red-500/50'
};

const difficultyIcons = {
  practice: '🌱',
  noob: '🟢',
  easy: '🟢',
  normal: '🟡',
  hard: '🟠',
  veryhard: '🔴',
  extreme: '🔴',
  pro: '🟣',
  ultrapro: '🟣',
  max: '🔵',
  legendary: '🔥'
};

export const LevelSelector: React.FC<LevelSelectorProps> = ({ 
  levels, 
  currentLevel, 
  onLevelSelect 
}) => {
  const getSpecialIcon = (level: GameLevel) => {
    if (level.id === 11) return <Crown className="w-4 h-4 text-yellow-500" />; // God Mode
    if (level.cyberAttack) return <Skull className="w-4 h-4 text-red-500" />;
    if (level.id >= 7) return <Zap className="w-4 h-4 text-purple-500" />; // Pro levels
    return null;
  };

  const getLevelDescription = (level: GameLevel) => {
    if (level.id === 11) return "🕵️‍♂️ CLASSIFIED - Perfect completion required";
    return level.description;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 font-mono">
          SELECT DIFFICULTY LEVEL
        </h2>
        <p className="text-gray-400">
          Rules stack as you progress. Break them at your own risk.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => level.unlocked && onLevelSelect(level.id)}
            disabled={!level.unlocked}
            className={`
              p-4 rounded-lg border-2 transition-all duration-300 text-left relative
              ${currentLevel === level.id 
                ? 'border-green-500 bg-green-900/30 shadow-lg shadow-green-500/20' 
                : level.unlocked 
                  ? 'border-gray-600 hover:border-gray-500 hover:shadow-lg' 
                  : 'border-gray-700 opacity-50'
              }
              ${!level.unlocked 
                ? 'cursor-not-allowed' 
                : 'hover:scale-105 cursor-pointer'
              }
              ${level.cyberAttack ? 'animate-pulse' : ''}
              ${level.id === 11 ? 'bg-gradient-to-br from-purple-900/30 to-black border-yellow-500' : ''}
            `}
          >
            {/* Level Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {!level.unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                {level.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                {getSpecialIcon(level)}
                
                <span className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                  difficultyColors[level.difficulty]
                }`}>
                  {difficultyIcons[level.difficulty]} {level.name.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 text-xs font-mono">
                  {level.challenges.length}
                </span>
                <Eye className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            
            {/* Level Title */}
            <h3 className={`font-bold font-mono mb-2 ${
              level.id === 11 ? 'text-yellow-400' : 'text-white'
            }`}>
              {level.title}
            </h3>
            
            {/* Level Description */}
            <p className="text-gray-400 text-sm leading-relaxed">
              {getLevelDescription(level)}
            </p>
            
            {/* Special Indicators */}
            <div className="mt-3 flex flex-wrap gap-1">
              {level.cyberAttack && (
                <div className="flex items-center space-x-1 text-red-500 bg-red-900/20 px-2 py-1 rounded text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-mono font-bold">CYBER ZONE</span>
                </div>
              )}
              
              {level.id === 11 && (
                <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-900/20 px-2 py-1 rounded text-xs">
                  <Crown className="w-3 h-3" />
                  <span className="font-mono font-bold">SECRET LEVEL</span>
                </div>
              )}
              
              {level.id >= 7 && level.id < 11 && (
                <div className="flex items-center space-x-1 text-purple-500 bg-purple-900/20 px-2 py-1 rounded text-xs">
                  <Zap className="w-3 h-3" />
                  <span className="font-mono font-bold">EXPERT</span>
                </div>
              )}
            </div>
            
            {/* Progress Indicator */}
            {level.unlocked && (
              <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    level.completed ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: level.completed ? '100%' : '0%' 
                  }}
                />
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <h3 className="text-sm font-bold text-white mb-2 font-mono">LEGEND</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-1">
            <Skull className="w-3 h-3 text-red-500" />
            <span className="text-gray-400">Cyber Attack</span>
          </div>
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span className="text-gray-400">Secret Level</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-400">Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};