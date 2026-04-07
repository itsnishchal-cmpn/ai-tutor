import { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useChatContext } from '../../contexts/ChatContext';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { QuizBlock } from '../../types/chat';

interface Props {
  quiz: QuizBlock;
}

export default function QuizQuestion({ quiz }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typeInput, setTypeInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const { addQuizResult } = useProgress();
  const { state } = useChatContext();

  const checkAnswer = () => {
    const userAnswer = quiz.quizType === 'mcq' ? selected : typeInput.trim();
    if (!userAnswer) return;

    let isCorrect = false;
    if (quiz.quizType === 'mcq') {
      // Match by letter (A, B, C, D) or by full text
      const correctLetter = quiz.correctAnswer.trim().charAt(0).toUpperCase();
      const selectedLetter = userAnswer.charAt(0).toUpperCase();
      isCorrect = selectedLetter === correctLetter;
    } else {
      isCorrect = userAnswer.toLowerCase() === quiz.correctAnswer.toLowerCase();
    }

    setAnswered(true);

    if (state.currentTopicId) {
      addQuizResult({
        quizId: quiz.id,
        topicId: state.currentTopicId,
        selectedAnswer: userAnswer,
        isCorrect,
        timestamp: Date.now(),
      });
    }
  };

  const isCorrect = () => {
    const userAnswer = quiz.quizType === 'mcq' ? selected : typeInput.trim();
    if (!userAnswer) return false;
    if (quiz.quizType === 'mcq') {
      const correctLetter = quiz.correctAnswer.trim().charAt(0).toUpperCase();
      return userAnswer.charAt(0).toUpperCase() === correctLetter;
    }
    return userAnswer.toLowerCase() === quiz.correctAnswer.toLowerCase();
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="my-3 bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-4 border border-brand-100">
      <div className="flex items-start gap-2 mb-3">
        <HelpCircle size={18} className="text-brand-500 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-gray-800">{quiz.question}</p>
      </div>

      {quiz.quizType === 'mcq' && quiz.options ? (
        <div className="space-y-2 mb-3">
          {quiz.options.map((option, i) => {
            const letter = optionLetters[i];
            const isSelected = selected === letter;
            const showResult = answered;
            const thisCorrect = letter === quiz.correctAnswer.trim().charAt(0).toUpperCase();

            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(letter)}
                disabled={answered}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                  showResult && thisCorrect
                    ? 'bg-green-50 border-green-300 text-green-800'
                    : showResult && isSelected && !thisCorrect
                      ? 'bg-red-50 border-red-300 text-red-800'
                      : isSelected
                        ? 'bg-brand-100 border-brand-300 text-brand-800'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-medium shrink-0">
                  {letter}
                </span>
                <span>{option}</span>
                {showResult && thisCorrect && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
                {showResult && isSelected && !thisCorrect && <XCircle size={16} className="ml-auto text-red-500" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-3">
          <input
            type="text"
            value={typeInput}
            onChange={e => setTypeInput(e.target.value)}
            disabled={answered}
            placeholder="Type your answer..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-400 focus:ring-1 focus:ring-brand-200 outline-none disabled:opacity-50"
            onKeyDown={e => e.key === 'Enter' && checkAnswer()}
          />
        </div>
      )}

      {!answered ? (
        <button
          onClick={checkAnswer}
          disabled={quiz.quizType === 'mcq' ? !selected : !typeInput.trim()}
          className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div
          className={`p-3 rounded-lg text-sm ${
            isCorrect()
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium mb-1">
            {isCorrect() ? (
              <>
                <CheckCircle2 size={16} /> Sahi jawab! 🎉
              </>
            ) : (
              <>
                <XCircle size={16} /> Correct answer: {quiz.correctAnswer}
              </>
            )}
          </div>
          {quiz.explanation && <p className="text-xs mt-1 opacity-80">{quiz.explanation}</p>}
        </div>
      )}
    </div>
  );
}
