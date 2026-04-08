import { useCallback, useRef } from 'react';
import { useLessonContext } from '../contexts/LessonContext';
import { useUser } from '../contexts/UserContext';
import { useProgress } from '../contexts/ProgressContext';
import { getTemplate } from '../data/lessonTemplates';
import { getTopicById, getNextTopicId } from '../data/curriculum';
import { generateLessonContent } from '../lib/lessonApi';
import { getItem, setItem } from '../lib/storage';
import type { GeneratedLesson } from '../types/lesson';

export function useLesson() {
  const { state, dispatch } = useLessonContext();
  const { name } = useUser();
  const { markTopicStarted, markTopicCompleted } = useProgress();
  const loadingRef = useRef(false);

  const startTopic = useCallback(async (topicId: string) => {
    const template = getTemplate(topicId);
    if (!template) return;

    dispatch({ type: 'START_TOPIC', payload: { topicId, template } });
    markTopicStarted(topicId);

    // Check localStorage cache first
    const cacheKey = `lesson_${topicId}`;
    const cached = getItem<GeneratedLesson | null>(cacheKey, null);
    if (cached) {
      // Merge diagramConfig from template into cached cards
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
      // Cache in localStorage for instant loads next time
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
  }, [dispatch, name, markTopicStarted]);

  const skipVideo = useCallback(() => dispatch({ type: 'SKIP_VIDEO' }), [dispatch]);
  const finishVideo = useCallback(() => dispatch({ type: 'FINISH_VIDEO' }), [dispatch]);
  const nextCard = useCallback(() => dispatch({ type: 'NEXT_CARD' }), [dispatch]);
  const startQuiz = useCallback(() => dispatch({ type: 'START_QUIZ' }), [dispatch]);

  const submitQuizAnswer = useCallback((selectedOption: string) => {
    if (!state.lesson) return;
    const quiz = state.lesson.quizzes[state.currentQuizIndex];
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correctAnswer;
    dispatch({ type: 'SUBMIT_QUIZ_ANSWER', payload: { selectedOption, isCorrect } });
  }, [dispatch, state.lesson, state.currentQuizIndex]);

  const retryQuiz = useCallback(() => dispatch({ type: 'RETRY_QUIZ' }), [dispatch]);
  const nextQuiz = useCallback(() => dispatch({ type: 'NEXT_QUIZ' }), [dispatch]);

  const completeTopic = useCallback(() => {
    if (state.topicId) {
      markTopicCompleted(state.topicId);
    }
    dispatch({ type: 'COMPLETE_TOPIC' });
  }, [dispatch, state.topicId, markTopicCompleted]);

  const resetLesson = useCallback(() => dispatch({ type: 'RESET_LESSON' }), [dispatch]);

  const nextTopicId = state.topicId ? getNextTopicId(state.topicId) : null;
  const nextTopicTitle = nextTopicId ? getTopicById(nextTopicId)?.topic.title ?? null : null;

  return {
    state,
    startTopic,
    skipVideo,
    finishVideo,
    nextCard,
    startQuiz,
    submitQuizAnswer,
    retryQuiz,
    nextQuiz,
    completeTopic,
    resetLesson,
    nextTopicId,
    nextTopicTitle,
  };
}
