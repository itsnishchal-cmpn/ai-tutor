import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { LessonState, LessonAction, LessonPhase, QuizAttemptState } from '../types/lesson';
import { getItem, setItem } from '../lib/storage';

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
  quizError: null,
};

// Lightweight bookmark saved to localStorage
interface LessonBookmark {
  topicId: string;
  phase: LessonPhase;
  currentCardIndex: number;
  currentQuizIndex: number;
}

const BOOKMARK_KEY = 'lesson_bookmark';

function saveBookmark(state: LessonState) {
  if (!state.topicId || state.phase === 'TOPIC_COMPLETE') {
    // Clear bookmark when no topic or topic is done
    setItem(BOOKMARK_KEY, null);
    return;
  }
  const bookmark: LessonBookmark = {
    topicId: state.topicId,
    phase: state.phase,
    currentCardIndex: state.currentCardIndex,
    currentQuizIndex: state.currentQuizIndex,
  };
  setItem(BOOKMARK_KEY, bookmark);
}

export function getSavedBookmark(): LessonBookmark | null {
  return getItem<LessonBookmark | null>(BOOKMARK_KEY, null);
}

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  let next: LessonState;

  switch (action.type) {
    case 'START_TOPIC':
      next = {
        ...initialState,
        topicId: action.payload.topicId,
        template: action.payload.template,
        phase: 'TOPIC_INTRO',
        isLoading: true,
      };
      break;

    case 'RESTORE_BOOKMARK':
      next = {
        ...initialState,
        topicId: action.payload.topicId,
        template: action.payload.template,
        phase: action.payload.phase,
        currentCardIndex: action.payload.currentCardIndex,
        currentQuizIndex: action.payload.currentQuizIndex,
        quizAttempt: { ...initialQuizAttempt, quizIndex: action.payload.currentQuizIndex },
        isLoading: true,
      };
      break;

    case 'LESSON_LOADED':
      next = {
        ...state,
        lesson: action.payload.lesson,
        isLoading: false,
        error: null,
      };
      break;

    case 'CARDS_LOADED':
      next = {
        ...state,
        lesson: {
          cards: action.payload.cards,
          quizzes: state.lesson?.quizzes ?? [],
          summary: state.lesson?.summary ?? { keyPoints: [] },
        },
        isLoading: false,
        error: null,
      };
      break;

    case 'QUIZZES_LOADED':
      next = {
        ...state,
        lesson: state.lesson ? {
          ...state.lesson,
          quizzes: action.payload.quizzes,
        } : null,
      };
      break;

    case 'SUMMARY_LOADED':
      next = {
        ...state,
        lesson: state.lesson ? {
          ...state.lesson,
          summary: { keyPoints: action.payload.keyPoints },
        } : null,
      };
      break;

    case 'LESSON_ERROR':
      next = {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };
      break;

    case 'QUIZ_ERROR':
      next = {
        ...state,
        quizError: action.payload.error,
      };
      break;

    case 'RETRY_QUIZZES':
      next = {
        ...state,
        quizError: null,
      };
      break;

    case 'SKIP_VIDEO':
    case 'FINISH_VIDEO':
      next = {
        ...state,
        phase: 'CONCEPT_CARDS',
        currentCardIndex: 0,
      };
      break;

    case 'NEXT_CARD': {
      const totalCards = state.lesson?.cards.length ?? 0;
      const nextIndex = state.currentCardIndex + 1;
      if (nextIndex >= totalCards) {
        next = { ...state, phase: 'QUIZ_TRANSITION' };
      } else {
        next = { ...state, currentCardIndex: nextIndex };
      }
      break;
    }

    case 'PREV_CARD':
      if (state.currentCardIndex <= 0) return state;
      next = { ...state, currentCardIndex: state.currentCardIndex - 1 };
      break;

    case 'START_QUIZ':
      next = {
        ...state,
        phase: 'QUIZ_CARDS',
        currentQuizIndex: 0,
        quizAttempt: { ...initialQuizAttempt, quizIndex: 0 },
      };
      break;

    case 'SUBMIT_QUIZ_ANSWER': {
      const newAttempts = state.quizAttempt.attempts + 1;
      if (action.payload.isCorrect) {
        let xp = 0;
        if (newAttempts === 1) xp = 20;
        else if (newAttempts === 2) xp = 10;
        else if (newAttempts === 3) xp = 5;
        next = {
          ...state,
          quizAttempt: {
            ...state.quizAttempt,
            attempts: newAttempts,
            showingAnswer: true,
            earnedXP: xp,
          },
        };
      } else {
        const newDisabled = [...state.quizAttempt.disabledOptions, action.payload.selectedOption];
        if (newAttempts >= 3) {
          next = {
            ...state,
            quizAttempt: {
              ...state.quizAttempt,
              attempts: newAttempts,
              disabledOptions: newDisabled,
              showingAnswer: true,
              earnedXP: 0,
            },
          };
        } else {
          next = {
            ...state,
            quizAttempt: {
              ...state.quizAttempt,
              attempts: newAttempts,
              disabledOptions: newDisabled,
              showingHint: true,
            },
          };
        }
      }
      break;
    }

    case 'RETRY_QUIZ':
      next = {
        ...state,
        quizAttempt: {
          ...state.quizAttempt,
          showingHint: false,
        },
      };
      break;

    case 'NEXT_QUIZ': {
      const totalQuizzes = state.lesson?.quizzes.length ?? 0;
      const nextQuizIndex = state.currentQuizIndex + 1;
      if (nextQuizIndex >= totalQuizzes) {
        next = { ...state, phase: 'TOPIC_COMPLETE' };
      } else {
        next = {
          ...state,
          currentQuizIndex: nextQuizIndex,
          quizAttempt: { ...initialQuizAttempt, quizIndex: nextQuizIndex },
        };
      }
      break;
    }

    case 'COMPLETE_TOPIC':
      next = { ...state, phase: 'TOPIC_COMPLETE' };
      break;

    case 'RESET_LESSON':
      next = initialState;
      break;

    default:
      return state;
  }

  // Auto-save bookmark after every state change
  saveBookmark(next);
  return next;
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
