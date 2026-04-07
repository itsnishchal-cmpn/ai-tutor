export interface QuizData {
  id: string;
  quizType: 'mcq' | 'type-in';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizAnswer {
  quizId: string;
  topicId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface TopicProgress {
  topicId: string;
  started: boolean;
  completed: boolean;
  quizResults: QuizAnswer[];
  lastAccessed: number;
}
