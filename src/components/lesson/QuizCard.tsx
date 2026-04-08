import type { GeneratedQuiz, QuizAttemptState } from '../../types/lesson';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  quiz: GeneratedQuiz;
  attemptState: QuizAttemptState;
  quizNumber: number;
  totalQuizzes: number;
  onSelectAnswer: (option: string) => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function QuizCard({
  quiz, attemptState, quizNumber, totalQuizzes, onSelectAnswer, onRetry, onNext,
}: Props) {
  const { attempts, disabledOptions, showingHint, showingAnswer, earnedXP } = attemptState;
  const isCorrect = showingAnswer && earnedXP > 0;
  const isRevealed = showingAnswer && earnedXP === 0 && attempts >= 3;
  const wrongAttempts = disabledOptions.length;
  const hearts = 3 - wrongAttempts;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3">
        <span className="text-sm text-gray-500 font-medium">Quiz {quizNumber + 1}/{totalQuizzes}</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-lg ${i < hearts ? 'text-red-500' : 'text-gray-200'}`}>❤</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        {showingHint && !showingAnswer && (
          <div className="w-full mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-400" />
                <span className="font-medium text-gray-700">{attempts === 1 ? 'Yeh nahi hai!' : 'Ek aur try!'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">{quiz.hints[Math.min(attempts - 1, quiz.hints.length - 1)]}</p>
              </div>
            </div>
            <button onClick={onRetry} className="w-full mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
              Try Again →
            </button>
          </div>
        )}

        {isCorrect && (
          <div className="w-full mb-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-700 mb-1">Sahi Jawab!</h3>
              <p className="text-green-600 font-medium mb-2">+{earnedXP} XP</p>
              <p className="text-sm text-gray-600">{quiz.explanation}</p>
            </div>
            <button onClick={onNext} className="mt-4 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
              Next <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        )}

        {isRevealed && (
          <div className="w-full mb-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <Lightbulb size={32} className="text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Answer: {quiz.options[quiz.correctAnswer.charCodeAt(0) - 65]}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{quiz.explanation}</p>
              <p className="text-xs text-gray-400">No XP for this question</p>
            </div>
            <button onClick={onNext} className="mt-4 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
              Next <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        )}

        {!showingHint && !showingAnswer && (
          <>
            <h3 className="text-lg font-medium text-gray-800 text-center mb-6">{quiz.question}</h3>
            <div className="w-full space-y-3">
              {quiz.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isDisabled = disabledOptions.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => !isDisabled && onSelectAnswer(letter)}
                    disabled={isDisabled}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-700'
                    }`}
                  >
                    <span className={`font-medium mr-2 ${isDisabled ? 'text-gray-300' : 'text-brand-600'}`}>{letter})</span>
                    {option}
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
