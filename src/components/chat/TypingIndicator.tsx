export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in-up">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
        AI
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
          <div className="w-2 h-2 bg-brand-400 rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
}
