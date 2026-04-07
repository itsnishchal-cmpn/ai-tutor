import { useEffect, useRef, useMemo } from 'react';
import type { Message } from '../../types/chat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { MessageSquare, BookOpen, Bot } from 'lucide-react';
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

        {/* Streaming content preview — plain text only, no parsing */}
        {isStreaming && streamingContent && (
          <div className="flex items-start gap-3 px-4 py-2 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              <Bot size={16} />
            </div>
            <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white text-gray-800 border border-gray-100 shadow-sm">
              <StreamingText text={streamingContent} />
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

/**
 * Shows clean streaming text — strips out incomplete markers so
 * the UI doesn't flash broken [DIAGRAM:... or [QUIZ: fragments.
 */
function StreamingText({ text }: { text: string }) {
  const cleanText = useMemo(() => {
    let t = text;
    // Remove complete markers (they'll render properly in the final message)
    t = t.replace(/\[DIAGRAM:[a-z-]*\]/g, '📐 ');
    t = t.replace(/\[VIDEO:[a-z-]*\]/g, '🎬 ');
    // Remove incomplete markers at the end of stream
    t = t.replace(/\[[A-Z]*:?[^\]]*$/, '');
    // Remove complete QUIZ blocks (show as placeholder)
    t = t.replace(/\[QUIZ:(?:MCQ|TYPE)\][\s\S]*?\[\/QUIZ\]/g, '\n📝 Quiz loading...\n');
    // Remove incomplete QUIZ blocks
    t = t.replace(/\[QUIZ:(?:MCQ|TYPE)\][\s\S]*$/, '\n📝 Quiz loading...\n');
    // Remove SUMMARY blocks
    t = t.replace(/\[SUMMARY\][\s\S]*?\[\/SUMMARY\]/g, '\n📋 Summary loading...\n');
    t = t.replace(/\[SUMMARY\][\s\S]*$/, '\n📋 Summary loading...\n');
    // Remove $$ math blocks (show inline)
    t = t.replace(/\$\$([^$]*)\$\$/g, ' $1 ');
    return t.trim();
  }, [text]);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap">
      {cleanText}
      <span className="inline-block w-1.5 h-4 bg-brand-400 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
    </div>
  );
}
