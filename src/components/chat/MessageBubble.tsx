import type { Message } from '../../types/chat';
import MessageContent from './MessageContent';
import { parseAIResponse } from '../../lib/parseAIResponse';
import { Bot, User } from 'lucide-react';

interface Props {
  message: Message;
  onQuizContinue?: (message: string) => void;
  onTopicComplete?: () => void;
}

export default function MessageBubble({ message, onQuizContinue, onTopicComplete }: Props) {
  const isUser = message.role === 'user';
  const blocks = message.blocks ?? parseAIResponse(message.content);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-2 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isUser
            ? 'bg-gray-200 text-gray-600'
            : 'bg-brand-100 text-brand-600'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-brand-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <MessageContent
            blocks={blocks}
            onQuizContinue={onQuizContinue}
            onTopicComplete={onTopicComplete}
          />
        )}
      </div>
    </div>
  );
}
