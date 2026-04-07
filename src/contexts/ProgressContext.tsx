import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { TopicProgress, QuizAnswer } from '../types/quiz';
import { getItem, setItem, removeItem } from '../lib/storage';

interface ProgressContextValue {
  progress: Record<string, TopicProgress>;
  markTopicStarted: (topicId: string) => void;
  markTopicCompleted: (topicId: string) => void;
  addQuizResult: (answer: QuizAnswer) => void;
  getTopicProgress: (topicId: string) => TopicProgress | undefined;
  resetProgress: () => void;
  totalQuizzes: number;
  correctQuizzes: number;
  completedTopics: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, TopicProgress>>(() =>
    getItem<Record<string, TopicProgress>>('progress', {})
  );

  const persist = (updated: Record<string, TopicProgress>) => {
    setProgress(updated);
    setItem('progress', updated);
  };

  const markTopicStarted = useCallback((topicId: string) => {
    setProgress(prev => {
      if (prev[topicId]?.started) return prev;
      const updated = {
        ...prev,
        [topicId]: {
          topicId,
          started: true,
          completed: prev[topicId]?.completed ?? false,
          quizResults: prev[topicId]?.quizResults ?? [],
          lastAccessed: Date.now(),
        },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const markTopicCompleted = useCallback((topicId: string) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        [topicId]: {
          ...prev[topicId],
          topicId,
          started: true,
          completed: true,
          quizResults: prev[topicId]?.quizResults ?? [],
          lastAccessed: Date.now(),
        },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const addQuizResult = useCallback((answer: QuizAnswer) => {
    setProgress(prev => {
      const topicProg = prev[answer.topicId] ?? {
        topicId: answer.topicId,
        started: true,
        completed: false,
        quizResults: [],
        lastAccessed: Date.now(),
      };
      const updated = {
        ...prev,
        [answer.topicId]: {
          ...topicProg,
          quizResults: [...topicProg.quizResults, answer],
          lastAccessed: Date.now(),
        },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const getTopicProgress = useCallback(
    (topicId: string) => progress[topicId],
    [progress]
  );

  const resetProgress = useCallback(() => {
    setProgress({});
    removeItem('progress');
  }, []);

  const allQuizzes = Object.values(progress).flatMap(p => p.quizResults);
  const totalQuizzes = allQuizzes.length;
  const correctQuizzes = allQuizzes.filter(q => q.isCorrect).length;
  const completedTopics = Object.values(progress).filter(p => p.completed).length;

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markTopicStarted,
        markTopicCompleted,
        addQuizResult,
        getTopicProgress,
        resetProgress,
        totalQuizzes,
        correctQuizzes,
        completedTopics,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be inside ProgressProvider');
  return ctx;
}
