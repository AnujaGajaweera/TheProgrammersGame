import React, { useState, useCallback } from 'react';
import { GameHeader } from './components/GameHeader';
import { LevelSelector } from './components/LevelSelector';
import { ChallengePanel } from './components/ChallengePanel';
import { CodeEditor } from './components/CodeEditor';
import { OutputConsole } from './components/OutputConsole';
import { AIGuide } from './components/AIGuide';
import { useGameState } from './hooks/useGameState';
import { gameLevels } from './data/levels';
import { CodeEvaluator } from './utils/codeEvaluator';

// Initialize first level as unlocked
gameLevels[1].unlocked = true;

function App() {
  const {
    gameState,
    aiResponse,
    setLevel,
    nextChallenge,
    addScore,
    loseLife,
    triggerHack,
    sendAIResponse
  } = useGameState();

  const [playerCode, setPlayerCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<'challenge' | 'code' | 'output' | 'ai'>('challenge');

  const codeEvaluator = new CodeEvaluator();
  const currentLevel = gameLevels.find(l => l.id === gameState.currentLevel);
  const currentChallenge = currentLevel?.challenges[gameState.currentChallenge];

  const handleLevelSelect = useCallback((levelId: number) => {
    setLevel(levelId);
    setShowLevelSelector(false);
    setPlayerCode(gameLevels[levelId]?.challenges[0]?.starterCode || '');
    setOutput('');
    setError(undefined);
    setSuccess(false);
    setMobileActiveTab('challenge');
  }, [setLevel]);

  const handleCodeChange = useCallback((code: string) => {
    setPlayerCode(code);
    setError(undefined);
    setSuccess(false);
  }, []);

  const handleRunCode = useCallback(async () => {
    if (!currentChallenge) return;

    setIsRunning(true);
    setOutput('');
    setError(undefined);
    setSuccess(false);
    setMobileActiveTab('output'); // Auto-switch to output on mobile

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validate rules first
    const ruleValidation = codeEvaluator.validateRules(playerCode, gameState.activeRules);
    if (!ruleValidation.valid) {
      setError(ruleValidation.violations.join('\n'));
      sendAIResponse(ruleValidation.violations[0], 'error');
      loseLife();
      setIsRunning(false);
      return;
    }

    // Evaluate code
    const result = codeEvaluator.evaluateCode(playerCode, currentChallenge);
    
    setOutput(result.output);
    setError(result.error);
    setSuccess(result.success);
    setIsRunning(false);

    if (result.success) {
      addScore(100);
      sendAIResponse("Nice work! Your code doesn't make me want to format my hard drive.", 'success');
      
      // Auto-advance after success
      setTimeout(() => {
        nextChallenge();
        const nextLevel = gameLevels.find(l => l.id === gameState.currentLevel + 1);
        const nextChallengeInLevel = currentLevel?.challenges[gameState.currentChallenge + 1];
        
        if (nextChallengeInLevel) {
          setPlayerCode(nextChallengeInLevel.starterCode || '');
        } else if (nextLevel) {
          setPlayerCode(nextLevel.challenges[0]?.starterCode || '');
        }
        
        setOutput('');
        setError(undefined);
        setSuccess(false);
        setMobileActiveTab('challenge');
      }, 2000);
    } else {
      sendAIResponse("That code has more bugs than a summer camping trip. Try again!", 'error');
      
      // Trigger hack for cyber attack levels
      if (currentLevel?.cyberAttack && Math.random() < 0.3) {
        triggerHack();
      }
    }
  }, [currentChallenge, playerCode, gameState.activeRules, addScore, sendAIResponse, loseLife, nextChallenge, triggerHack, currentLevel, gameState.currentChallenge]);

  const handleReset = useCallback(() => {
    if (currentChallenge) {
      setPlayerCode(currentChallenge.starterCode || '');
      setOutput('');
      setError(undefined);
      setSuccess(false);
    }
  }, [currentChallenge]);

  const handleHint = useCallback(() => {
    if (currentChallenge?.hint) {
      sendAIResponse(currentChallenge.hint, 'hint');
    } else {
      sendAIResponse("Here's a hint: try reading the error messages. They're like breadcrumbs, but for code.", 'hint');
    }
    setMobileActiveTab('ai'); // Switch to AI tab on mobile
  }, [currentChallenge, sendAIResponse]);

  if (showLevelSelector) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <GameHeader 
          gameState={gameState} 
          currentLevelName="LEVEL SELECT" 
          isHacked={gameState.isHacked}
        />
        
        <div className="max-w-6xl mx-auto p-3 sm:p-6">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold font-mono mb-2 sm:mb-4">
              <span className="text-green-500">THE</span>
              <span className="text-white mx-1 sm:mx-2">PROGRAMMER'S</span>
              <span className="text-red-500">GAME</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg px-4">
              Test your coding skills from noob to legendary. Rules stack, chaos ensues.
            </p>
          </div>
          
          <LevelSelector 
            levels={gameLevels}
            currentLevel={gameState.currentLevel}
            onLevelSelect={handleLevelSelect}
          />
        </div>
      </div>
    );
  }

  if (!currentLevel || !currentChallenge) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">ERROR: LEVEL NOT FOUND</h2>
          <button 
            onClick={() => setShowLevelSelector(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 rounded-lg font-mono font-bold text-sm sm:text-base"
          >
            RETURN TO LEVEL SELECT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <GameHeader 
        gameState={gameState} 
        currentLevelName={currentLevel.name}
        isHacked={gameState.isHacked}
      />
      
      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto p-6 grid grid-cols-3 gap-6">
        {/* Left Column - Challenge Info */}
        <div className="space-y-6">
          <button 
            onClick={() => setShowLevelSelector(true)}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-mono text-sm transition-colors"
          >
            ← BACK TO LEVELS
          </button>
          
          <ChallengePanel 
            challenge={currentChallenge}
            currentChallenge={gameState.currentChallenge}
            totalChallenges={currentLevel.challenges.length}
            activeRules={gameState.activeRules}
            isHacked={gameState.isHacked}
          />
          
          <AIGuide 
            response={aiResponse}
            isHacked={gameState.isHacked}
          />
        </div>
        
        {/* Right Column - Code Editor & Output */}
        <div className="col-span-2 space-y-6">
          <CodeEditor 
            initialCode={playerCode}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
            onReset={handleReset}
            onHint={handleHint}
            isRunning={isRunning}
            hasError={!!error}
            glitchMode={gameState.glitchMode}
          />
          
          <OutputConsole 
            output={output}
            error={error}
            success={success}
            isRunning={isRunning}
            glitchMode={gameState.glitchMode}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Navigation */}
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setMobileActiveTab('challenge')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-mono font-bold border-b-2 transition-colors ${
                mobileActiveTab === 'challenge'
                  ? 'border-green-500 text-green-500 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              CHALLENGE
            </button>
            <button
              onClick={() => setMobileActiveTab('code')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-mono font-bold border-b-2 transition-colors ${
                mobileActiveTab === 'code'
                  ? 'border-green-500 text-green-500 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              CODE
            </button>
            <button
              onClick={() => setMobileActiveTab('output')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-mono font-bold border-b-2 transition-colors ${
                mobileActiveTab === 'output'
                  ? 'border-green-500 text-green-500 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              OUTPUT
              {(error || success) && (
                <span className={`ml-1 w-2 h-2 rounded-full inline-block ${
                  error ? 'bg-red-500' : 'bg-green-500'
                }`} />
              )}
            </button>
            <button
              onClick={() => setMobileActiveTab('ai')}
              className={`flex-shrink-0 px-4 py-3 text-sm font-mono font-bold border-b-2 transition-colors ${
                mobileActiveTab === 'ai'
                  ? 'border-green-500 text-green-500 bg-gray-700'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              AI GUIDE
              {aiResponse && (
                <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-3 sm:p-4">
          {/* Back Button */}
          <button 
            onClick={() => setShowLevelSelector(true)}
            className="w-full mb-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-mono text-sm transition-colors"
          >
            ← BACK TO LEVELS
          </button>

          {/* Tab Content */}
          {mobileActiveTab === 'challenge' && (
            <ChallengePanel 
              challenge={currentChallenge}
              currentChallenge={gameState.currentChallenge}
              totalChallenges={currentLevel.challenges.length}
              activeRules={gameState.activeRules}
              isHacked={gameState.isHacked}
            />
          )}

          {mobileActiveTab === 'code' && (
            <CodeEditor 
              initialCode={playerCode}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
              onReset={handleReset}
              onHint={handleHint}
              isRunning={isRunning}
              hasError={!!error}
              glitchMode={gameState.glitchMode}
              isMobile={true}
            />
          )}

          {mobileActiveTab === 'output' && (
            <OutputConsole 
              output={output}
              error={error}
              success={success}
              isRunning={isRunning}
              glitchMode={gameState.glitchMode}
            />
          )}

          {mobileActiveTab === 'ai' && (
            <AIGuide 
              response={aiResponse}
              isHacked={gameState.isHacked}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;