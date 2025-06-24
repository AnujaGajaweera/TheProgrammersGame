export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'debug' | 'reverse' | 'decode' | 'repair';
  starterCode?: string;
  expectedOutput?: string;
  testCases?: TestCase[];
  solution?: string;
  hint?: string;
  timeLimit?: number; // seconds for timed challenges
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface GameLevel {
  id: number;
  name: string;
  title: string;
  description: string;
  difficulty: 'practice' | 'noob' | 'easy' | 'normal' | 'hard' | 'veryhard' | 'extreme' | 'pro' | 'ultrapro' | 'max' | 'legendary';
  challenges: Challenge[];
  rules: string[];
  newRules: string[];
  unlocked: boolean;
  completed: boolean;
  cyberAttack?: boolean;
  secretLevel?: boolean;
  perfectScoreRequired?: boolean;
}

export interface GameState {
  currentLevel: number;
  currentChallenge: number;
  activeRules: string[];
  score: number;
  lives: number;
  achievements: string[];
  playerCode: string;
  isHacked: boolean;
  glitchMode: boolean;
  perfectScore: boolean;
  completedLevels: number[];
  timeRemaining?: number;
}

export interface AIResponse {
  message: string;
  type: 'success' | 'error' | 'hint' | 'sarcastic' | 'hack' | 'warning' | 'classified';
  animation?: 'glitch' | 'corrupt' | 'scan' | 'decrypt';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  secret?: boolean;
}