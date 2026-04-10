import { useState, useEffect } from 'react';
import type { GeneratedQuiz, QuizAttemptState } from '../../types/lesson';
import { Lightbulb, ArrowRight, Target } from 'lucide-react';

interface Props {
  quiz: GeneratedQuiz;
  attemptState: QuizAttemptState;
  quizNumber: number;
  totalQuizzes: number;
  onSelectAnswer: (option: string) => void;
  onRetry: () => void;
  onNext: () => void;
}

const OPTION_COLORS = [
  { accent: 'border-l-rose-500', hover: 'hover:bg-rose-50', letter: 'bg-rose-500' },
  { accent: 'border-l-indigo-500', hover: 'hover:bg-indigo-50', letter: 'bg-indigo-500' },
  { accent: 'border-l-amber-500', hover: 'hover:bg-amber-50', letter: 'bg-amber-500' },
  { accent: 'border-l-emerald-500', hover: 'hover:bg-emerald-50', letter: 'bg-emerald-500' },
];

function HeartIcon({ filled, breaking }: { filled: boolean; breaking?: boolean }) {
  return (
    <svg
      width="24" height="24" viewBox="0 0 24 24"
      fill={filled ? '#EF4444' : '#E2E8F0'}
      className={`transition-all duration-300 ${filled ? 'scale-100' : 'scale-90'} ${breaking ? 'animate-heart-break' : ''}`}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function AnimatedCheckmark() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2">
      <circle cx="12" cy="12" r="10" fill="#10B981" className="animate-bounce-in" />
      <path d="M7 12.5l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
    </svg>
  );
}

export default function QuizCard({
  quiz, attemptState, quizNumber, totalQuizzes, onSelectAnswer, onRetry, onNext,
}: Props) {
  const { attempts, disabledOptions, showingHint, showingAnswer, earnedXP } = attemptState;
  const isCorrect = showingAnswer && earnedXP > 0;
  const isRevealed = showingAnswer && earnedXP === 0 && attempts >= 3;
  const wrongAttempts = disabledOptions.length;
  const hearts = 3 - wrongAttempts;
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const [justBrokeHeart, setJustBrokeHeart] = useState(false);
  const [flashGreen, setFlashGreen] = useState(false);

  useEffect(() => {
    if (disabledOptions.length > 0) {
      const lastDisabled = disabledOptions[disabledOptions.length - 1];
      setShakingOption(lastDisabled);
      setJustBrokeHeart(true);
      const t1 = setTimeout(() => setShakingOption(null), 500);
      const t2 = setTimeout(() => setJustBrokeHeart(false), 500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [disabledOptions.length]);

  useEffect(() => {
    if (isCorrect) {
      setFlashGreen(true);
      const timer = setTimeout(() => setFlashGreen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  return (
    <div className={`h-full flex flex-col max-w-2xl mx-auto w-full px-4 sm:px-6 transition-colors duration-200 ${flashGreen ? 'bg-emerald-50/50' : ''}`}>
      {/* Quiz header */}
      <div className="pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Target size={16} className="text-indigo-600" />
            </div>
            <span className="text-sm font-bold text-[#1E293B]">
              Challenge {quizNumber + 1} of {totalQuizzes}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <HeartIcon key={i} filled={i < hearts} breaking={i === hearts && justBrokeHeart} />
            ))}
          </div>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: totalQuizzes }, (_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i < quizNumber ? 'bg-indigo-500' : i === quizNumber ? 'bg-indigo-400' : 'bg-[#E2E8F0]'
            }`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pb-6">
        {/* Hint state */}
        {showingHint && !showingAnswer && (
          <div className="w-full mb-6 animate-fade-in-up">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-amber-100 rounded-lg">
                  <Lightbulb size={16} className="text-amber-600" />
                </div>
                <span className="font-bold text-[#1E293B]">{attempts === 1 ? 'Yeh nahi hai!' : 'Ek aur try!'}</span>
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">{quiz.hints[Math.min(attempts - 1, quiz.hints.length - 1)]}</p>
            </div>
            <button onClick={onRetry} className="w-full mt-4 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-lg hover:bg-amber-600 transition-all btn-press" style={{ boxShadow: '0 3px 10px rgba(245, 158, 11, 0.3)' }}>
              Try Again →
            </button>
          </div>
        )}

        {/* Correct */}
        {isCorrect && (
          <div className="w-full mb-6 text-center animate-bounce-in">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)' }}>
              <AnimatedCheckmark />
              <h3 className="text-2xl font-extrabold text-emerald-600 mb-1">Sahi Jawab!</h3>
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold mb-3">
                +{earnedXP} XP
              </div>
              <p className="text-sm text-[#64748B]">{quiz.explanation}</p>
            </div>
            <button onClick={onNext} className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press" style={{ boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)' }}>
              Next <ArrowRight size={18} className="inline ml-1" />
            </button>
          </div>
        )}

        {/* Revealed */}
        {isRevealed && (
          <div className="w-full mb-6 text-center animate-fade-in-up">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)' }}>
              <Lightbulb size={36} className="text-indigo-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-[#1E293B] mb-1">Answer: {quiz.options[quiz.correctAnswer.charCodeAt(0) - 65]}</h3>
              <p className="text-sm text-[#64748B] mb-2">{quiz.explanation}</p>
              <p className="text-xs text-[#94A3B8]">Koi baat nahi! Yeh yaad rakhna...</p>
            </div>
            <button onClick={onNext} className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press" style={{ boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)' }}>
              Next <ArrowRight size={18} className="inline ml-1" />
            </button>
          </div>
        )}

        {/* Question + options */}
        {!showingHint && !showingAnswer && (
          <>
            <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
              <h3 className="text-lg font-semibold text-[#1E293B] text-center leading-relaxed">{quiz.question}</h3>
            </div>
            <div className="w-full space-y-3">
              {quiz.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isDisabled = disabledOptions.includes(letter);
                const colors = OPTION_COLORS[i % OPTION_COLORS.length];
                const isShaking = shakingOption === letter;

                return (
                  <button
                    key={letter}
                    onClick={() => !isDisabled && onSelectAnswer(letter)}
                    disabled={isDisabled}
                    className={`w-full text-left p-4 rounded-xl border border-[#E2E8F0] border-l-4 transition-all duration-200 animate-option-enter ${colors.accent} ${
                      isDisabled
                        ? 'bg-[#F8FAFC] opacity-40 cursor-not-allowed line-through'
                        : `bg-white ${colors.hover} hover:shadow-md hover:scale-[1.01] active:scale-[0.99]`
                    } ${isShaking ? 'animate-shake !border-red-500' : ''}`}
                    style={{ animationDelay: `${i * 80}ms`, boxShadow: isDisabled ? 'none' : '0 1px 2px rgba(0,0,0,0.03)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg ${isDisabled ? 'bg-[#CBD5E1]' : colors.letter} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                        {letter}
                      </span>
                      <span className={`font-medium ${isDisabled ? 'text-[#94A3B8]' : 'text-[#1E293B]'}`}>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
