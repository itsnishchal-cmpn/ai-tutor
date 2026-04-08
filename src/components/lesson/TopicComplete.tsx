import type { GeneratedLesson } from '../../types/lesson';
import { Trophy, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

interface Props {
  topicTitle: string;
  lesson: GeneratedLesson;
  totalXP: number;
  quizScore: { correct: number; total: number };
  onNextTopic: () => void;
  nextTopicTitle: string | null;
  onOpenDoubt: () => void;
}

export default function TopicComplete({
  topicTitle, lesson, totalXP, quizScore, onNextTopic, nextTopicTitle, onOpenDoubt,
}: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 overflow-y-auto">
      <div className="max-w-md w-full py-8">
        <div className="text-center mb-6">
          <Trophy size={48} className="text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Topic Complete!</h2>
          <p className="text-gray-500 mt-1">{topicTitle}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          {lesson.summary.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">{point}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-600">+{totalXP}</p>
            <p className="text-xs text-gray-500">XP Earned</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{quizScore.correct}/{quizScore.total}</p>
            <p className="text-xs text-gray-500">Quiz Score</p>
          </div>
        </div>
        <button onClick={onOpenDoubt} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors mb-4">
          <MessageCircle size={18} /> Have doubts? Ask AI
        </button>
        {nextTopicTitle && (
          <button onClick={onNextTopic} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
            Next: {nextTopicTitle} <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
