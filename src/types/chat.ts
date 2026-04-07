export type RichBlockType = 'text' | 'math' | 'diagram' | 'video' | 'quiz' | 'summary';

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface MathBlock {
  type: 'math';
  content: string;
  display: boolean; // true = block ($$), false = inline ($)
}

export interface DiagramBlock {
  type: 'diagram';
  diagramId: string;
}

export interface VideoBlock {
  type: 'video';
  videoId: string;
  title?: string;
}

export interface QuizBlock {
  type: 'quiz';
  quizType: 'mcq' | 'type-in';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  id: string;
}

export interface SummaryBlock {
  type: 'summary';
  content: string;
  keyPoints: string[];
}

export type RichContentBlock = TextBlock | MathBlock | DiagramBlock | VideoBlock | QuizBlock | SummaryBlock;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // raw text
  blocks?: RichContentBlock[]; // parsed rich content
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  currentTopicId: string | null;
  streamingContent: string;
}

export type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: { content: string } }
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_STREAM'; payload: { chunk: string } }
  | { type: 'FINISH_STREAMING'; payload: { blocks: RichContentBlock[] } }
  | { type: 'SET_TOPIC'; payload: { topicId: string; greeting?: Message } }
  | { type: 'CLEAR_CHAT' }
  | { type: 'LOAD_MESSAGES'; payload: { messages: Message[]; topicId: string } };
