import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { ChatState, ChatAction, RichContentBlock } from '../types/chat';

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  currentTopicId: null,
  streamingContent: '',
};

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: generateId(),
            role: 'user',
            content: action.payload.content,
            timestamp: Date.now(),
          },
        ],
      };

    case 'START_STREAMING':
      return {
        ...state,
        isStreaming: true,
        streamingContent: '',
      };

    case 'APPEND_STREAM':
      return {
        ...state,
        streamingContent: state.streamingContent + action.payload.chunk,
      };

    case 'FINISH_STREAMING': {
      const assistantMsg = {
        id: generateId(),
        role: 'assistant' as const,
        content: state.streamingContent,
        blocks: action.payload.blocks,
        timestamp: Date.now(),
      };
      return {
        ...state,
        isStreaming: false,
        streamingContent: '',
        messages: [...state.messages, assistantMsg],
      };
    }

    case 'SET_TOPIC': {
      const messages = action.payload.greeting ? [action.payload.greeting] : [];
      return {
        ...state,
        currentTopicId: action.payload.topicId,
        messages,
        isStreaming: false,
        streamingContent: '',
      };
    }

    case 'CLEAR_CHAT':
      return { ...initialState };

    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload.messages,
        currentTopicId: action.payload.topicId,
        isStreaming: false,
        streamingContent: '',
      };

    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  dispatch: Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be inside ChatProvider');
  return ctx;
}

export type { RichContentBlock };
