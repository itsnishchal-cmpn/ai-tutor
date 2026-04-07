import { BookOpen, CheckCircle2 } from 'lucide-react';

interface Props {
  content: string;
  keyPoints: string[];
}

export default function LessonSummary({ content, keyPoints }: Props) {
  return (
    <div className="my-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={18} className="text-green-600" />
        <h3 className="font-semibold text-green-800 text-sm">{content}</h3>
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
