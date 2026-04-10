import { BookOpen } from 'lucide-react';

interface Props {
  topicTitle: string;
}

export default function LessonLoading({ topicTitle }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-secondary-100 flex items-center justify-center">
          <BookOpen size={32} className="text-secondary-500" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-secondary-300 border-t-transparent animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-[#1E293B] mb-1">Preparing your lesson...</h2>
      <p className="text-sm text-[#64748B]">{topicTitle}</p>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-secondary-400 rounded-full typing-dot"
            style={{ animationDelay: `${-0.32 + i * 0.16}s` }}
          />
        ))}
      </div>
    </div>
  );
}
