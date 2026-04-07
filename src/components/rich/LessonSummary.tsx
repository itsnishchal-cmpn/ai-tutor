import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';

interface Props {
  content: string;
  keyPoints: string[];
  onTopicComplete?: () => void;
  onNextTopic?: () => void;
  nextTopicTitle?: string | null;
}

export default function LessonSummary({ content, keyPoints, onTopicComplete, onNextTopic, nextTopicTitle }: Props) {
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (onTopicComplete && !celebrated) {
      setCelebrated(true);
      onTopicComplete();
    }
  }, [onTopicComplete, celebrated]);

  return (
    <div className="my-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
      {/* Achievement header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
        <Trophy size={20} className="text-yellow-500" />
        <h3 className="font-bold text-green-800 text-sm">Topic Complete!</h3>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={18} className="text-green-600" />
        <h4 className="font-semibold text-green-800 text-sm">{content}</h4>
      </div>

      {keyPoints.length > 0 && (
        <ul className="space-y-2">
          {keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Next Topic button */}
      <div className="mt-3 pt-3 border-t border-green-200">
        {nextTopicTitle ? (
          <button
            onClick={onNextTopic}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors w-full justify-center"
          >
            Next Topic: {nextTopicTitle}
            <ArrowRight size={16} />
          </button>
        ) : (
          <p className="text-sm text-green-700 font-medium text-center">
            All topics completed! 🎉
          </p>
        )}
      </div>
    </div>
  );
}
