import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { sendMessageWithRetry } from '../../lib/api';
import { buildDoubtChatPrompt } from '../../data/lessonPrompts';
import { useUser } from '../../contexts/UserContext';

interface DoubtMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  topicId: string;
}

// Format markdown-like text: **bold**, *italic*, newlines
function formatText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function FormattedText({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
}

export default function DoubtOverlay({ isOpen, onClose, topicTitle, topicId: _topicId }: Props) {
  const { name } = useUser();
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent('');

    const systemPrompt = buildDoubtChatPrompt(name, topicTitle);
    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

    sendMessageWithRetry({
      messages: apiMessages,
      systemPrompt,
      onChunk: (chunk) => setStreamingContent(prev => prev + chunk),
      onDone: (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      onError: (error) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md h-[70vh] sm:h-[500px] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Ask PadhAI</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-4">Kuch bhi poocho about {topicTitle}!</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-brand-600 text-white">{msg.content}</div>
              ) : (
                <FormattedText content={msg.content} className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-800" />
              )}
            </div>
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <FormattedText content={streamingContent} className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-800" />
            </div>
          )}
        </div>
        <div className="p-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your doubt..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
              disabled={isStreaming}
            />
            <button onClick={handleSend} disabled={!input.trim() || isStreaming}
              className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
