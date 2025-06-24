import { useState, useCallback } from 'react';
import { GameState, AIResponse } from '../types/game';
import { gameLevels, isSecretLevelUnlocked } from '../data/levels';

const initialGameState: GameState = {
  currentLevel: 0,
  currentChallenge: 0,
  activeRules: [],
  score: 0,
  lives: 3,
  achievements: [],
  playerCode: '',
  isHacked: false,
  glitchMode: false,
  perfectScore: true,
  completedLevels: [],
  timeRemaining: undefined
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLevel = useCallback((levelId: number) => {
    const level = gameLevels.find(l => l.id === levelId);
    if (level && level.unlocked) {
      // Check if trying to access secret level
      if (levelId === 11 && !isSecretLevelUnlocked()) {
        sendAIResponse("🔒 CLASSIFIED: Complete all previous levels with perfect scores to unlock God Mode.", 'warning');
        return;
      }

      setGameState(prev => ({
        ...prev,
        currentLevel: levelId,
        currentChallenge: 0,
        activeRules: level.rules,
        isHacked: level.cyberAttack || false,
        glitchMode: level.cyberAttack || false,
        timeRemaining: level.challenges[0]?.timeLimit
      }));

      // Special messages for different levels
      if (levelId === 4) {
        sendAIResponse("🚨 CYBER ATTACK INITIATED! Timed challenges are now active. Code fast or face the consequences!", 'hack');
      } else if (levelId === 11) {
        sendAIResponse("🕵️‍♂️ Welcome to God Mode. You've proven yourself worthy. Now face the ultimate challenges.", 'classified');
      } else if (levelId >= 7) {
        sendAIResponse("⚡ Expert territory. Hope you brought your A-game because the rules are about to get ridiculous.", 'warning');
      }
    }
  }, []);

  const nextChallenge = useCallback(() => {
    const currentLevel = gameLevels.find(l => l.id === gameState.currentLevel);
    if (currentLevel && gameState.currentChallenge < currentLevel.challenges.length - 1) {
      // Move to next challenge in same level
      const nextChallengeIndex = gameState.currentChallenge + 1;
      const nextChallenge = currentLevel.challenges[nextChallengeIndex];
      
      setGameState(prev => ({
        ...prev,
        currentChallenge: nextChallengeIndex,
        timeRemaining: nextChallenge?.timeLimit
      }));
    } else {
      // Level completed, unlock next level
      const nextLevelId = gameState.currentLevel + 1;
      const completedLevels = [...gameState.completedLevels, gameState.currentLevel];
      
      // Mark current level as completed
      if (currentLevel) {
        currentLevel.completed = true;
      }
      
      if (nextLevelId < gameLevels.length) {
        // Unlock next level
        gameLevels[nextLevelId].unlocked = true;
        
        // Check if secret level should be unlocked
        if (nextLevelId === 11) {
          if (isSecretLevelUnlocked()) {
            gameLevels[11].unlocked = true;
            sendAIResponse("🎉 ACHIEVEMENT UNLOCKED: God Mode is now available! You've mastered all levels with perfection.", 'success');
          }
        }
        
        const nextLevel = gameLevels[nextLevelId];
        setGameState(prev => ({
          ...prev,
          score: prev.score + 1000,
          currentLevel: nextLevelId,
          currentChallenge: 0,
          activeRules: [...prev.activeRules, ...nextLevel.newRules],
          isHacked: nextLevel.cyberAttack || false,
          glitchMode: nextLevel.cyberAttack || false,
          completedLevels,
          timeRemaining: nextLevel.challenges[0]?.timeLimit
        }));

        // Level completion messages
        sendAIResponse(`🎯 Level ${gameState.currentLevel} conquered! Welcome to ${nextLevel.name}. ${nextLevel.newRules.length > 0 ? 'New rules are now active!' : ''}`, 'success');
      } else {
        // Game completed!
        setGameState(prev => ({
          ...prev,
          completedLevels,
          score: prev.score + 5000
        }));
        sendAIResponse("🏆 LEGENDARY STATUS ACHIEVED! You've conquered all levels. You are now a true Programming Master!", 'success');
      }
    }
  }, [gameState.currentLevel, gameState.currentChallenge, gameState.completedLevels]);

  const addScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points
    }));
  }, []);

  const loseLife = useCallback(() => {
    setGameState(prev => {
      const newLives = Math.max(0, prev.lives - 1);
      const newPerfectScore = false; // Losing life breaks perfect score
      
      if (newLives === 0) {
        sendAIResponse("💀 GAME OVER! Your code has been consumed by the digital void. Restart to try again!", 'hack');
      }
      
      return {
        ...prev,
        lives: newLives,
        perfectScore: newPerfectScore
      };
    });
  }, []);

  const triggerHack = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isHacked: true,
      glitchMode: true
    }));
    
    const hackMessages = [
      "💀 SYSTEM COMPROMISED 💀 Your functions are now encrypted memes!",
      "🔥 MALWARE DETECTED 🔥 Your variables have been replaced with cat pictures!",
      "⚡ CYBER ATTACK ⚡ Someone's trying to inject SQL into your Python!",
      "🚨 BREACH ALERT 🚨 Your code is being held hostage by ransomware!"
    ];
    
    const randomMessage = hackMessages[Math.floor(Math.random() * hackMessages.length)];
    setAiResponse({
      message: randomMessage,
      type: 'hack',
      animation: 'corrupt',
      priority: 'critical'
    });
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        glitchMode: false
      }));
    }, 3000);
  }, []);

  const sendAIResponse = useCallback((message: string, type: AIResponse['type'] = 'sarcastic') => {
    setAiResponse({ 
      message, 
      type,
      priority: type === 'hack' || type === 'classified' ? 'critical' : 'medium'
    });
  }, []);

  const startTimer = useCallback((seconds: number) => {
    setGameState(prev => ({ ...prev, timeRemaining: seconds }));
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining && prev.timeRemaining > 0) {
          const newTime = prev.timeRemaining - 1;
          
          if (newTime === 0) {
            // Time's up!
            sendAIResponse("⏰ TIME'S UP! The cyber attack succeeded. Your system is now compromised!", 'hack');
            triggerHack();
            loseLife();
          }
          
          return { ...prev, timeRemaining: newTime };
        }
        return prev;
      });
    }, 1000);

    // Clean up timer after 5 minutes max
    setTimeout(() => clearInterval(timer), 300000);
  }, [sendAIResponse, triggerHack, loseLife]);

  return {
    gameState,
    aiResponse,
    updateGameState,
    setLevel,
    nextChallenge,
    addScore,
    loseLife,
    triggerHack,
    sendAIResponse,
    startTimer
  };
};