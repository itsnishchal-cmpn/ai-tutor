import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Paperclip } from 'lucide-react';
import { sendMessageWithRetry } from '../../lib/api';
import { buildDoubtChatPrompt, buildVisionPrompt } from '../../data/lessonPrompts';
import { useUser } from '../../contexts/UserContext';

interface DoubtMessage {
  role: 'user' | 'assistant';
  content: string;
  imagePreview?: string; // data URL for displaying image in chat
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  topicId: string;
}

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
    <div className={className} dangerouslySetInnerHTML={{ __html: formatText(content) }} />
  );
}

export default function DoubtOverlay({ isOpen, onClose, topicTitle }: Props) {
  const { name } = useUser();
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingImage, setPendingImage] = useState<{ data: string; mediaType: string; preview: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (!isOpen) return null;

  const handleImageSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mediaType = header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
      setPendingImage({ data, mediaType, preview: result });
    };
    reader.readAsDataURL(file);
  };

  const readSSEStream = async (response: Response, onChunk: (text: string) => void): Promise<string> => {
    const reader = response.body?.getReader();
    if (!reader) return '';
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const d = line.slice(6);
          if (d === '[DONE]') return fullText;
          try {
            const parsed = JSON.parse(d);
            if (parsed.type === 'content') {
              fullText += parsed.text;
              onChunk(fullText);
            }
          } catch { /* skip */ }
        }
      }
    }
    return fullText;
  };

  const handleSend = async () => {
    const hasText = input.trim().length > 0;
    const hasImage = pendingImage !== null;
    if ((!hasText && !hasImage) || isStreaming) return;

    const userMsg = hasText ? input.trim() : (hasImage ? 'Yeh image samjha do' : '');
    const imagePreview = pendingImage?.preview;
    setInput('');
    const capturedImage = pendingImage;
    setPendingImage(null);

    const newMessages: DoubtMessage[] = [...messages, { role: 'user', content: userMsg, imagePreview }];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      if (capturedImage) {
        // Vision request — use chat-vision endpoint
        const systemPrompt = buildVisionPrompt(name, topicTitle);
        const apiMessages = newMessages.map((m, i) => ({
          role: m.role,
          content: m.content,
          hasImage: i === newMessages.length - 1,
        }));

        const response = await fetch('/.netlify/functions/chat-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt,
            image: { data: capturedImage.data, mediaType: capturedImage.mediaType },
          }),
        });

        if (!response.ok) throw new Error('Vision request failed');

        const fullText = await readSSEStream(response, (text) => setStreamingContent(text));
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      } else {
        // Regular text doubt — use chat endpoint
        const systemPrompt = buildDoubtChatPrompt(name, topicTitle);
        const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

        await new Promise<void>((resolve) => {
          sendMessageWithRetry({
            messages: apiMessages,
            systemPrompt,
            onChunk: (chunk) => setStreamingContent(prev => prev + chunk),
            onDone: (fullText) => {
              setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
              resolve();
            },
            onError: (error) => {
              setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
              resolve();
            },
          });
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Something went wrong'}` }]);
    } finally {
      setStreamingContent('');
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md h-[70vh] sm:h-[500px] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Ask PadhAI</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !pendingImage && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400 mb-2">Kuch bhi poocho about {topicTitle}!</p>
              <p className="text-xs text-gray-300">Type a question or upload a photo of your textbook/problem</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[80%]">
                  {msg.imagePreview && (
                    <img src={msg.imagePreview} alt="Uploaded" className="rounded-xl mb-1 max-h-48 object-cover" />
                  )}
                  <div className="px-3 py-2 rounded-xl text-sm bg-brand-600 text-white">{msg.content}</div>
                </div>
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

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-3 pt-2">
            <div className="relative inline-block">
              <img src={pendingImage.preview} alt="To upload" className="h-20 rounded-lg border border-gray-200" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex gap-2 items-end">
            {/* Photo upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSelect(file);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              title="Upload photo of textbook/problem"
            >
              <Paperclip size={18} />
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={pendingImage ? 'Add a message (optional)...' : 'Type your doubt...'}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
              disabled={isStreaming}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !pendingImage) || isStreaming}
              className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
