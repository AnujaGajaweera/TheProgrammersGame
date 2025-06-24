import React, { useEffect, useState } from 'react';
import { Bot, MessageCircle, AlertTriangle, Skull } from 'lucide-react';
import { AIResponse } from '../types/game';

interface AIGuideProps {
  response: AIResponse | null;
  isHacked: boolean;
}

const aiPersonalities = {
  success: "Nice work! Your code doesn't make me want to format my hard drive.",
  error: "That code has more bugs than a summer camping trip. Try again!",
  hint: "Here's a hint that might save you from digital embarrassment...",
  sarcastic: "Oh wow, groundbreaking stuff. Shakespeare would weep at this poetry.",
  hack: "💀 SYSTEM COMPROMISED 💀 Your functions are now encrypted memes."
};

export const AIGuide: React.FC<AIGuideProps> = ({ response, isHacked }) => {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (response?.message) {
      setIsTyping(true);
      typeMessage(response.message);
    }
  }, [response]);

  const typeMessage = async (message: string) => {
    setCurrentMessage('');
    for (let i = 0; i <= message.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      setCurrentMessage(message.slice(0, i));
    }
    setIsTyping(false);
  };

  const getIcon = () => {
    if (isHacked) return <Skull className="w-6 h-6 text-red-500 animate-pulse" />;
    if (response?.type === 'error') return <AlertTriangle className="w-6 h-6 text-red-500" />;
    return <Bot className="w-6 h-6 text-green-500" />;
  };

  const getMessageStyle = () => {
    if (isHacked) return 'text-red-400 animate-pulse';
    switch (response?.type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'hint': return 'text-yellow-400';
      case 'sarcastic': return 'text-purple-400';
      case 'hack': return 'text-red-500 animate-pulse';
      default: return 'text-gray-300';
    }
  };

  const getAIName = () => {
    if (isHacked) return 'CORRUPTED_AI.exe';
    return 'CodeMentor v2.0';
  };

  return (
    <div className={`bg-gray-800 rounded-lg border-2 p-4 transition-all duration-300 ${
      isHacked ? 'border-red-500 bg-red-900/20' : 'border-gray-700'
    }`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`font-mono text-sm font-bold ${
              isHacked ? 'text-red-500' : 'text-green-500'
            }`}>
              {getAIName()}
            </span>
            {isTyping && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
          
          <div className={`font-mono text-sm ${getMessageStyle()}`}>
            {currentMessage || (isHacked 
              ? "💀 I've been compromised! Your code is now property of the shadow realm!"
              : "Ready to help you write code that doesn't make senior developers cry."
            )}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>
          
          {response?.animation && (
            <div className="mt-2 text-xs text-gray-500 font-mono">
              [RUNNING: {response.animation.toUpperCase()}_ANIMATION.exe]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};