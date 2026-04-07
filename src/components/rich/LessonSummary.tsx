import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, Trophy } from 'lucide-react';

interface Props {
  content: string;
  keyPoints: string[];
  onTopicComplete?: () => void;
}

export default function LessonSummary({ content, keyPoints, onTopicComplete }: Props) {
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
    </div>
  );
}
