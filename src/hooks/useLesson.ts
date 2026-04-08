import { useCallback, useRef } from 'react';
import { useLessonContext } from '../contexts/LessonContext';
import { useUser } from '../contexts/UserContext';
import { useProgress } from '../contexts/ProgressContext';
import { useGamification } from '../contexts/GamificationContext';
import { getTemplate } from '../data/lessonTemplates';
import { getTopicById, getNextTopicId } from '../data/curriculum';
import { generateLessonContent } from '../lib/lessonApi';
import { getItem, setItem } from '../lib/storage';
import { playSound } from '../lib/soundEffects';
import type { GeneratedLesson } from '../types/lesson';

// Tracks which cards/quizzes already earned XP to prevent double-counting on refresh
interface TopicXPTracker {
  cardsSeen: number[];    // card indices that already earned XP
  quizzesDone: number[];  // quiz indices that already earned XP
  topicBonusAwarded: boolean;
}

function getXPTracker(topicId: string): TopicXPTracker {
  return getItem<TopicXPTracker>(`xp_tracker_${topicId}`, {
    cardsSeen: [],
    quizzesDone: [],
    topicBonusAwarded: false,
  });
}

function saveXPTracker(topicId: string, tracker: TopicXPTracker) {
  setItem(`xp_tracker_${topicId}`, tracker);
}

export function useLesson() {
  const { state, dispatch } = useLessonContext();
  const { name } = useUser();
  const { markTopicStarted, markTopicCompleted, progress } = useProgress();
  const {
    gamification,
    addXP,
    updateStreak,
    recordQuizAttempt,
    recordTopicStart,
    recordTopicComplete,
    checkAndAwardBadges,
  } = useGamification();
  const loadingRef = useRef(false);

  // Track XP earned during this lesson session (for display on TopicComplete)
  const sessionXPRef = useRef(0);
  const quizCorrectRef = useRef(0);
  const quizTotalRef = useRef(0);

  const startTopic = useCallback(async (topicId: string) => {
    const template = getTemplate(topicId);
    if (!template) return;

    // Reset session display counters
    sessionXPRef.current = 0;
    quizCorrectRef.current = 0;
    quizTotalRef.current = 0;

    dispatch({ type: 'START_TOPIC', payload: { topicId, template } });
    markTopicStarted(topicId);
    recordTopicStart(topicId);
    updateStreak();

    // Check localStorage cache first
    const cacheKey = `lesson_${topicId}`;
    const cached = getItem<GeneratedLesson | null>(cacheKey, null);
    if (cached) {
      cached.cards = cached.cards.map((card, i) => ({
        ...card,
        diagramConfig: template.cards[i]?.diagramConfig ?? card.diagramConfig,
      }));
      dispatch({ type: 'LESSON_LOADED', payload: { lesson: cached } });
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const topicInfo = getTopicById(topicId);
      const topicTitle = topicInfo?.topic.title ?? topicId;
      const lesson = await generateLessonContent(name, topicTitle, template);
      setItem(cacheKey, lesson);
      dispatch({ type: 'LESSON_LOADED', payload: { lesson } });
    } catch (error) {
      dispatch({
        type: 'LESSON_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Failed to generate lesson' },
      });
    } finally {
      loadingRef.current = false;
    }
  }, [dispatch, name, markTopicStarted, recordTopicStart, updateStreak]);

  const skipVideo = useCallback(() => dispatch({ type: 'SKIP_VIDEO' }), [dispatch]);
  const finishVideo = useCallback(() => dispatch({ type: 'FINISH_VIDEO' }), [dispatch]);
  const prevCard = useCallback(() => dispatch({ type: 'PREV_CARD' }), [dispatch]);

  const nextCard = useCallback(() => {
    if (state.topicId) {
      const cardIndex = state.currentCardIndex;
      const tracker = getXPTracker(state.topicId);

      // Only award XP if this card hasn't earned XP yet
      if (!tracker.cardsSeen.includes(cardIndex)) {
        addXP(5);
        sessionXPRef.current += 5;
        tracker.cardsSeen.push(cardIndex);
        saveXPTracker(state.topicId, tracker);
      }
    }
    if (gamification.soundEnabled) playSound('tap');
    dispatch({ type: 'NEXT_CARD' });
  }, [dispatch, addXP, gamification.soundEnabled, state.topicId, state.currentCardIndex]);

  const startQuiz = useCallback(() => dispatch({ type: 'START_QUIZ' }), [dispatch]);

  const submitQuizAnswer = useCallback((selectedOption: string) => {
    if (!state.lesson || !state.topicId) return;
    const quiz = state.lesson.quizzes[state.currentQuizIndex];
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correctAnswer;
    dispatch({ type: 'SUBMIT_QUIZ_ANSWER', payload: { selectedOption, isCorrect } });

    const tracker = getXPTracker(state.topicId);
    const quizAlreadyDone = tracker.quizzesDone.includes(state.currentQuizIndex);

    if (isCorrect) {
      if (!quizAlreadyDone) {
        const attempts = state.quizAttempt.attempts + 1;
        let xp = 0;
        if (attempts === 1) xp = 20;
        else if (attempts === 2) xp = 10;
        else if (attempts === 3) xp = 5;

        if (xp > 0) addXP(xp);
        sessionXPRef.current += xp;
        recordQuizAttempt(state.topicId, attempts === 1);
        tracker.quizzesDone.push(state.currentQuizIndex);
        saveXPTracker(state.topicId, tracker);
      }
      quizCorrectRef.current += 1;
      quizTotalRef.current += 1;

      if (gamification.soundEnabled) playSound('correct');
    } else {
      if (gamification.soundEnabled) playSound('wrong');

      // If 3rd wrong attempt, record quiz as done with 0 XP
      if (state.quizAttempt.attempts + 1 >= 3 && !quizAlreadyDone) {
        quizTotalRef.current += 1;
        recordQuizAttempt(state.topicId, false);
        tracker.quizzesDone.push(state.currentQuizIndex);
        saveXPTracker(state.topicId, tracker);
      }
    }
  }, [dispatch, state.lesson, state.currentQuizIndex, state.quizAttempt.attempts, state.topicId, addXP, recordQuizAttempt, gamification.soundEnabled]);

  const retryQuiz = useCallback(() => dispatch({ type: 'RETRY_QUIZ' }), [dispatch]);
  const nextQuiz = useCallback(() => dispatch({ type: 'NEXT_QUIZ' }), [dispatch]);

  const completeTopic = useCallback(() => {
    if (state.topicId) {
      const tracker = getXPTracker(state.topicId);

      markTopicCompleted(state.topicId);
      recordTopicComplete(state.topicId);

      // +50 XP topic completion bonus (only once)
      if (!tracker.topicBonusAwarded) {
        addXP(50);
        sessionXPRef.current += 50;
        tracker.topicBonusAwarded = true;
        saveXPTracker(state.topicId, tracker);
      }

      // Check for new badges
      const completedTopicIds = Object.keys(progress).filter(id => progress[id]?.completed);
      if (!completedTopicIds.includes(state.topicId)) {
        completedTopicIds.push(state.topicId);
      }
      checkAndAwardBadges(completedTopicIds);

      if (gamification.soundEnabled) playSound('topicComplete');
    }
    dispatch({ type: 'COMPLETE_TOPIC' });
  }, [dispatch, state.topicId, markTopicCompleted, recordTopicComplete, addXP, progress, checkAndAwardBadges, gamification.soundEnabled]);

  const resetLesson = useCallback(() => dispatch({ type: 'RESET_LESSON' }), [dispatch]);

  const nextTopicId = state.topicId ? getNextTopicId(state.topicId) : null;
  const nextTopicTitle = nextTopicId ? getTopicById(nextTopicId)?.topic.title ?? null : null;

  return {
    state,
    startTopic,
    skipVideo,
    finishVideo,
    prevCard,
    nextCard,
    startQuiz,
    submitQuizAnswer,
    retryQuiz,
    nextQuiz,
    completeTopic,
    resetLesson,
    nextTopicId,
    nextTopicTitle,
    sessionXPRef,
    quizCorrectRef,
    quizTotalRef,
  };
}
