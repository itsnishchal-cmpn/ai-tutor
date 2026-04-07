import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer or question..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
