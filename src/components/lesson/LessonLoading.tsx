import { Loader2 } from 'lucide-react';

interface Props {
  topicTitle: string;
}

export default function LessonLoading({ topicTitle }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <Loader2 size={40} className="text-brand-600 animate-spin mb-4" />
      <h2 className="text-lg font-medium text-gray-800 mb-1">Preparing your lesson...</h2>
      <p className="text-sm text-gray-500">{topicTitle}</p>
    </div>
  );
}
