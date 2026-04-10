import { Target, Loader2, RefreshCw, Zap } from 'lucide-react';

interface Props {
  onStart: () => void;
  quizzesReady: boolean;
  quizError: string | null;
  onRetry: () => void;
}

export default function QuizTransition({ onStart, quizzesReady, quizError, onRetry }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <div className="relative mb-6 animate-bounce-in">
        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center" style={{ boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)' }}>
          <Target size={48} className="text-indigo-500" />
        </div>
        <Zap size={16} className="absolute -top-1 -right-1 text-amber-500 fill-amber-500 animate-float" />
        <Zap size={12} className="absolute -bottom-0 -left-2 text-amber-400 fill-amber-400 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <h2 className="text-3xl font-extrabold text-[#1E293B] mb-2 animate-fade-in-up">Quiz Time!</h2>
      <p className="text-[#64748B] text-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        Ab dekhte hain kitna yaad raha!
      </p>

      <div className="flex gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {[0, 1, 2].map(i => (
          <svg key={i} width="28" height="28" viewBox="0 0 24 24" fill="#EF4444" className="drop-shadow-sm">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ))}
      </div>

      {quizzesReady ? (
        <button onClick={onStart} className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all btn-press animate-fade-in-up" style={{ animationDelay: '0.3s', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}>
          Start Quiz →
        </button>
      ) : quizError ? (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <p className="text-sm text-red-500 text-center">Questions load nahi ho paye</p>
          <button onClick={onRetry} className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all btn-press">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-[#64748B] animate-fade-in-up">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
          <span className="text-sm">Preparing questions...</span>
        </div>
      )}
    </div>
  );
}
