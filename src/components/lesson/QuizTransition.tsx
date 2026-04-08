import { Target } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export default function QuizTransition({ onStart }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <Target size={48} className="text-brand-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Time!</h2>
      <p className="text-gray-500 text-center mb-8">Ab dekhte hain kitna yaad raha!</p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
      >
        Start Quiz →
      </button>
    </div>
  );
}
