import { useCallback } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';
import { useProgress } from '../contexts/ProgressContext';
import { sendMessageWithRetry, formatMessagesForAPI } from '../lib/api';
import { parseAIResponse } from '../lib/parseAIResponse';
import { buildSystemPrompt } from '../data/systemPrompt';
import { getTopicById } from '../data/curriculum';
import { getItem, setItem } from '../lib/storage';
import type { Message } from '../types/chat';

export function useChat() {
  const { state, dispatch } = useChatContext();
  const { name } = useUser();
  const { markTopicStarted } = useProgress();

  const selectTopic = useCallback(
    (topicId: string) => {
      // Don't re-select same topic
      if (topicId === state.currentTopicId) return;

      // Save current chat if exists
      if (state.currentTopicId && state.messages.length > 0) {
        setItem(`chat_${state.currentTopicId}`, state.messages);
      }

      // Load saved chat or start fresh
      const saved = getItem<Message[]>(`chat_${topicId}`, []);
      if (saved.length > 0) {
        // Re-parse blocks for saved messages (blocks aren't serialized)
        const restored = saved.map(m => ({
          ...m,
          blocks: m.role === 'assistant' ? parseAIResponse(m.content) : undefined,
        }));
        dispatch({ type: 'LOAD_MESSAGES', payload: { messages: restored, topicId } });
        return;
      }

      // Start new conversation — AI will greet
      dispatch({ type: 'SET_TOPIC', payload: { topicId } });
      markTopicStarted(topicId);

      // Trigger initial greeting with topic-specific message
      const topicInfo = getTopicById(topicId);
      if (!topicInfo) return;

      const systemPrompt = buildSystemPrompt(name, topicId);

      dispatch({ type: 'START_STREAMING' });
      sendMessageWithRetry({
        messages: [{ role: 'user', content: `I want to learn about "${topicInfo.topic.title}" (${topicInfo.topic.description}). Please teach me this topic.` }],
        systemPrompt,
        onChunk: (chunk) => dispatch({ type: 'APPEND_STREAM', payload: { chunk } }),
        onDone: (fullText) => {
          const blocks = parseAIResponse(fullText);
          dispatch({ type: 'FINISH_STREAMING', payload: { blocks } });
        },
        onError: (error) => {
          const blocks = parseAIResponse(`Sorry, a technical error occurred. Please try again.\n\nError: ${error}`);
          dispatch({ type: 'FINISH_STREAMING', payload: { blocks } });
        },
      });
    },
    [state.currentTopicId, state.messages, dispatch, name, markTopicStarted]
  );

  const sendUserMessage = useCallback(
    (content: string) => {
      if (!content.trim() || state.isStreaming || !state.currentTopicId) return;

      dispatch({ type: 'ADD_USER_MESSAGE', payload: { content } });

      const systemPrompt = buildSystemPrompt(name, state.currentTopicId);

      // Include all messages plus the new one
      const allMessages = [
        ...formatMessagesForAPI(state.messages),
        { role: 'user' as const, content },
      ];

      dispatch({ type: 'START_STREAMING' });
      sendMessageWithRetry({
        messages: allMessages,
        systemPrompt,
        onChunk: (chunk) => dispatch({ type: 'APPEND_STREAM', payload: { chunk } }),
        onDone: (fullText) => {
          const blocks = parseAIResponse(fullText);
          dispatch({ type: 'FINISH_STREAMING', payload: { blocks } });
          // Save after each exchange
          if (state.currentTopicId) {
            const updatedMessages = [
              ...state.messages,
              { id: `u-${Date.now()}`, role: 'user' as const, content, timestamp: Date.now() },
              { id: `a-${Date.now()}`, role: 'assistant' as const, content: fullText, blocks, timestamp: Date.now() },
            ];
            setItem(`chat_${state.currentTopicId}`, updatedMessages);
          }
        },
        onError: () => {
          const blocks = parseAIResponse(`Oops! Something went wrong. Please try again.`);
          dispatch({ type: 'FINISH_STREAMING', payload: { blocks } });
        },
      });
    },
    [state.messages, state.isStreaming, state.currentTopicId, dispatch, name]
  );

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    streamingContent: state.streamingContent,
    currentTopicId: state.currentTopicId,
    selectTopic,
    sendUserMessage,
  };
}
