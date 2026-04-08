import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { LessonState, LessonAction, QuizAttemptState } from '../types/lesson';

const initialQuizAttempt: QuizAttemptState = {
  quizIndex: 0,
  attempts: 0,
  disabledOptions: [],
  showingHint: false,
  showingAnswer: false,
  earnedXP: 0,
};

const initialState: LessonState = {
  topicId: null,
  phase: 'TOPIC_INTRO',
  lesson: null,
  template: null,
  currentCardIndex: 0,
  currentQuizIndex: 0,
  quizAttempt: initialQuizAttempt,
  isLoading: false,
  error: null,
};

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'START_TOPIC':
      return {
        ...initialState,
        topicId: action.payload.topicId,
        template: action.payload.template,
        phase: 'TOPIC_INTRO',
        isLoading: true,
      };

    case 'LESSON_LOADED':
      return {
        ...state,
        lesson: action.payload.lesson,
        isLoading: false,
        error: null,
      };

    case 'LESSON_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case 'SKIP_VIDEO':
    case 'FINISH_VIDEO':
      return {
        ...state,
        phase: 'CONCEPT_CARDS',
        currentCardIndex: 0,
      };

    case 'NEXT_CARD': {
      const totalCards = state.lesson?.cards.length ?? 0;
      const nextIndex = state.currentCardIndex + 1;
      if (nextIndex >= totalCards) {
        return { ...state, phase: 'QUIZ_TRANSITION' };
      }
      return { ...state, currentCardIndex: nextIndex };
    }

    case 'START_QUIZ':
      return {
        ...state,
        phase: 'QUIZ_CARDS',
        currentQuizIndex: 0,
        quizAttempt: { ...initialQuizAttempt, quizIndex: 0 },
      };

    case 'SUBMIT_QUIZ_ANSWER': {
      const newAttempts = state.quizAttempt.attempts + 1;
      if (action.payload.isCorrect) {
        let xp = 0;
        if (newAttempts === 1) xp = 20;
        else if (newAttempts === 2) xp = 10;
        else if (newAttempts === 3) xp = 5;
        return {
          ...state,
          quizAttempt: {
            ...state.quizAttempt,
            attempts: newAttempts,
            showingAnswer: true,
            earnedXP: xp,
          },
        };
      }
      const newDisabled = [...state.quizAttempt.disabledOptions, action.payload.selectedOption];
      if (newAttempts >= 3) {
        return {
          ...state,
          quizAttempt: {
            ...state.quizAttempt,
            attempts: newAttempts,
            disabledOptions: newDisabled,
            showingAnswer: true,
            earnedXP: 0,
          },
        };
      }
      return {
        ...state,
        quizAttempt: {
          ...state.quizAttempt,
          attempts: newAttempts,
          disabledOptions: newDisabled,
          showingHint: true,
        },
      };
    }

    case 'RETRY_QUIZ':
      return {
        ...state,
        quizAttempt: {
          ...state.quizAttempt,
          showingHint: false,
        },
      };

    case 'NEXT_QUIZ': {
      const totalQuizzes = state.lesson?.quizzes.length ?? 0;
      const nextQuizIndex = state.currentQuizIndex + 1;
      if (nextQuizIndex >= totalQuizzes) {
        return { ...state, phase: 'TOPIC_COMPLETE' };
      }
      return {
        ...state,
        currentQuizIndex: nextQuizIndex,
        quizAttempt: { ...initialQuizAttempt, quizIndex: nextQuizIndex },
      };
    }

    case 'COMPLETE_TOPIC':
      return { ...state, phase: 'TOPIC_COMPLETE' };

    case 'RESET_LESSON':
      return initialState;

    default:
      return state;
  }
}

interface LessonContextValue {
  state: LessonState;
  dispatch: Dispatch<LessonAction>;
}

const LessonContext = createContext<LessonContextValue | null>(null);

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState);
  return (
    <LessonContext.Provider value={{ state, dispatch }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessonContext() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLessonContext must be inside LessonProvider');
  return ctx;
}
