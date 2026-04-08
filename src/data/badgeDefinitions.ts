import type { BadgeDefinition } from '../types/gamification';

const quadTypeTopics = [
  'quadrilateral-basics', 'parallelogram', 'rhombus',
  'rectangle', 'square', 'kite', 'trapezium',
];

const allTopics = [
  'polygons-basics', 'angle-sum-property',
  ...quadTypeTopics,
  'diagonal-properties', 'quadrilateral-family',
];

export const badges: BadgeDefinition[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first topic',
    icon: '🎯',
    condition: (stats) => stats.completedTopics.length >= 1,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get all quizzes right in a topic on first attempt',
    icon: '⭐',
    condition: (stats) => {
      return Object.values(stats.quizPerformance).some(
        p => p.total >= 2 && p.firstAttemptCorrect === p.total
      );
    },
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥🔥',
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'shape-master',
    name: 'Shape Master',
    description: 'Complete all 7 quadrilateral type topics',
    icon: '📐',
    condition: (stats) => quadTypeTopics.every(t => stats.completedTopics.includes(t)),
  },
  {
    id: 'chapter-champion',
    name: 'Chapter Champion',
    description: 'Complete all 11 topics in Chapter 3',
    icon: '🏆',
    condition: (stats) => allTopics.every(t => stats.completedTopics.includes(t)),
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete a topic in under 5 minutes',
    icon: '⚡',
    condition: (stats) => {
      return Object.values(stats.topicCompletionTimes).some(t => t < 300);
    },
  },
  {
    id: 'curious-mind',
    name: 'Curious Mind',
    description: 'Ask 10 doubts via chat',
    icon: '💬',
    condition: (stats) => stats.totalDoubtsAsked >= 10,
  },
];
