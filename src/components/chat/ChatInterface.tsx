import { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { parseAIResponse } from '../../lib/parseAIResponse';
import MessageContent from './MessageContent';
import { MessageSquare, BookOpen } from 'lucide-react';
import { chapters } from '../../data/curriculum';

interface Props {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSend: (message: string) => void;
  currentTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onTopicComplete?: () => void;
}

export default function ChatInterface({
  messages,
  isStreaming,
  streamingContent,
  onSend,
  currentTopicId,
  onSelectTopic,
  onTopicComplete,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // No topic selected — show empty state
  if (!currentTopicId) {
    const activeChapter = chapters.find(c => !c.locked);
    const firstTopic = activeChapter?.sections[0]?.topics[0];

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-brand-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Select a Topic</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Choose a topic from the curriculum on the left to start learning! 📚
        </p>

        {firstTopic && (
          <button
            onClick={() => onSelectTopic(firstTopic.id)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <BookOpen size={16} />
            Start with: {firstTopic.title}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-4 space-y-1">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onQuizContinue={!isStreaming ? onSend : undefined}
            onTopicComplete={onTopicComplete}
          />
        ))}

        {/* Streaming content preview */}
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
              AI
            </div>
            <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white text-gray-800 border border-gray-100 shadow-sm">
              <MessageContent blocks={parseAIResponse(streamingContent)} />
            </div>
          </div>
        )}

        {/* Typing indicator when streaming but no content yet */}
        {isStreaming && !streamingContent && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isStreaming} />
    </div>
  );
}
