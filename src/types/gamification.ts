export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: BadgeCheckStats) => boolean;
}

export interface BadgeCheckStats {
  completedTopics: string[];
  totalDoubtsAsked: number;
  currentStreak: number;
  longestStreak: number;
  quizPerformance: Record<string, { total: number; firstAttemptCorrect: number }>;
  topicCompletionTimes: Record<string, number>;
}

export interface GamificationState {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  badges: string[];
  badgeTimestamps: Record<string, number>;
  totalDoubtsAsked: number;
  quizPerformance: Record<string, { total: number; firstAttemptCorrect: number }>;
  topicStartTimes: Record<string, number>;
  topicCompletionTimes: Record<string, number>;
  soundEnabled: boolean;
}
