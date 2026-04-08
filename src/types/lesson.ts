export interface ConceptCardTemplate {
  id: string;
  type: 'hook' | 'concept' | 'formula' | 'example';
  subConcept: string;
  diagramConfig?: DiagramConfig;
}

export interface DiagramConfig {
  shape: string;
  highlight?: string;
  showLabels?: boolean;
  showAngles?: boolean;
  showDiagonals?: boolean;
}

export interface QuizTemplate {
  id: string;
  subConcept: string;
  type: 'mcq' | 'type-in';
  maxAttempts: 3;
}

export interface LessonTemplate {
  topicId: string;
  videoId: string;
  cards: ConceptCardTemplate[];
  quizzes: QuizTemplate[];
  summary: { keyPointCount: number };
}

export interface GeneratedCard {
  id: string;
  type: 'hook' | 'concept' | 'formula' | 'example';
  text: string;
  diagramConfig?: DiagramConfig;
}

export interface GeneratedQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  hints: string[];
  explanation: string;
}

export interface GeneratedLesson {
  cards: GeneratedCard[];
  quizzes: GeneratedQuiz[];
  summary: { keyPoints: string[] };
}

export type LessonPhase =
  | 'TOPIC_INTRO'
  | 'VIDEO_PLAYING'
  | 'CONCEPT_CARDS'
  | 'QUIZ_TRANSITION'
  | 'QUIZ_CARDS'
  | 'TOPIC_COMPLETE';

export interface QuizAttemptState {
  quizIndex: number;
  attempts: number;
  disabledOptions: string[];
  showingHint: boolean;
  showingAnswer: boolean;
  earnedXP: number;
}

export interface LessonState {
  topicId: string | null;
  phase: LessonPhase;
  lesson: GeneratedLesson | null;
  template: LessonTemplate | null;
  currentCardIndex: number;
  currentQuizIndex: number;
  quizAttempt: QuizAttemptState;
  isLoading: boolean;
  error: string | null;
}

export type LessonAction =
  | { type: 'START_TOPIC'; payload: { topicId: string; template: LessonTemplate } }
  | { type: 'LESSON_LOADED'; payload: { lesson: GeneratedLesson } }
  | { type: 'LESSON_ERROR'; payload: { error: string } }
  | { type: 'SKIP_VIDEO' }
  | { type: 'FINISH_VIDEO' }
  | { type: 'NEXT_CARD' }
  | { type: 'START_QUIZ' }
  | { type: 'SUBMIT_QUIZ_ANSWER'; payload: { selectedOption: string; isCorrect: boolean } }
  | { type: 'RETRY_QUIZ' }
  | { type: 'NEXT_QUIZ' }
  | { type: 'COMPLETE_TOPIC' }
  | { type: 'RESET_LESSON' };
