import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GamificationState, BadgeCheckStats } from '../types/gamification';
import { getItem, setItem } from '../lib/storage';
import { getLevelForXP } from '../data/levelDefinitions';
import { badges } from '../data/badgeDefinitions';

const STORAGE_KEY = 'gamification';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

const defaultState: GamificationState = {
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  badges: [],
  badgeTimestamps: {},
  totalDoubtsAsked: 0,
  quizPerformance: {},
  topicStartTimes: {},
  topicCompletionTimes: {},
  soundEnabled: true,
};

interface GamificationContextValue {
  gamification: GamificationState;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  updateStreak: () => boolean;
  recordQuizAttempt: (topicId: string, firstAttemptCorrect: boolean) => void;
  recordTopicStart: (topicId: string) => void;
  recordTopicComplete: (topicId: string) => void;
  incrementDoubts: () => void;
  checkAndAwardBadges: (completedTopics: string[]) => string[];
  toggleSound: () => void;
  resetGamification: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [gamification, setGamification] = useState<GamificationState>(() =>
    getItem<GamificationState>(STORAGE_KEY, defaultState)
  );

  const persist = useCallback((updated: GamificationState) => {
    setGamification(updated);
    setItem(STORAGE_KEY, updated);
  }, []);

  const addXP = useCallback((amount: number) => {
    let leveledUp = false;
    let newLevel = 0;
    setGamification(prev => {
      const oldLevel = getLevelForXP(prev.xp).level;
      const updated = { ...prev, xp: prev.xp + amount };
      newLevel = getLevelForXP(updated.xp).level;
      leveledUp = newLevel > oldLevel;
      persist(updated);
      return updated;
    });
    return { leveledUp, newLevel };
  }, [persist]);

  const updateStreak = useCallback(() => {
    let streakMaintained = false;
    setGamification(prev => {
      const today = todayString();
      if (prev.lastActiveDate === today) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      let newStreak = 1;
      if (prev.lastActiveDate === yesterdayStr) {
        newStreak = prev.currentStreak + 1;
        streakMaintained = true;
      }
      const updated = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
      };
      persist(updated);
      return updated;
    });
    return streakMaintained;
  }, [persist]);

  const recordQuizAttempt = useCallback((topicId: string, firstAttemptCorrect: boolean) => {
    setGamification(prev => {
      const existing = prev.quizPerformance[topicId] ?? { total: 0, firstAttemptCorrect: 0 };
      const updated = {
        ...prev,
        quizPerformance: {
          ...prev.quizPerformance,
          [topicId]: {
            total: existing.total + 1,
            firstAttemptCorrect: existing.firstAttemptCorrect + (firstAttemptCorrect ? 1 : 0),
          },
        },
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const recordTopicStart = useCallback((topicId: string) => {
    setGamification(prev => {
      const updated = {
        ...prev,
        topicStartTimes: { ...prev.topicStartTimes, [topicId]: Date.now() },
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const recordTopicComplete = useCallback((topicId: string) => {
    setGamification(prev => {
      const startTime = prev.topicStartTimes[topicId] ?? Date.now();
      const seconds = Math.round((Date.now() - startTime) / 1000);
      const updated = {
        ...prev,
        topicCompletionTimes: { ...prev.topicCompletionTimes, [topicId]: seconds },
      };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const incrementDoubts = useCallback(() => {
    setGamification(prev => {
      const updated = { ...prev, totalDoubtsAsked: prev.totalDoubtsAsked + 1 };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const checkAndAwardBadges = useCallback((completedTopics: string[]) => {
    const newBadges: string[] = [];
    setGamification(prev => {
      const stats: BadgeCheckStats = {
        completedTopics,
        totalDoubtsAsked: prev.totalDoubtsAsked,
        currentStreak: prev.currentStreak,
        longestStreak: prev.longestStreak,
        quizPerformance: prev.quizPerformance,
        topicCompletionTimes: prev.topicCompletionTimes,
      };
      const awardedIds = [...prev.badges];
      const timestamps = { ...prev.badgeTimestamps };
      for (const badge of badges) {
        if (!awardedIds.includes(badge.id) && badge.condition(stats)) {
          awardedIds.push(badge.id);
          timestamps[badge.id] = Date.now();
          newBadges.push(badge.id);
        }
      }
      if (newBadges.length === 0) return prev;
      const updated = { ...prev, badges: awardedIds, badgeTimestamps: timestamps };
      persist(updated);
      return updated;
    });
    return newBadges;
  }, [persist]);

  const toggleSound = useCallback(() => {
    setGamification(prev => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      persist(updated);
      return updated;
    });
  }, [persist]);

  const resetGamification = useCallback(() => {
    persist(defaultState);
  }, [persist]);

  return (
    <GamificationContext.Provider
      value={{
        gamification,
        addXP,
        updateStreak,
        recordQuizAttempt,
        recordTopicStart,
        recordTopicComplete,
        incrementDoubts,
        checkAndAwardBadges,
        toggleSound,
        resetGamification,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be inside GamificationProvider');
  return ctx;
}
