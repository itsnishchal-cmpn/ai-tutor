import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { getAllTopicIds } from '../../data/curriculum';
import { Trophy, Target, CheckCircle2, Flame } from 'lucide-react';

export default function ProgressPanel() {
  const { name } = useUser();
  const { totalQuizzes, correctQuizzes, completedTopics } = useProgress();
  const totalTopics = getAllTopicIds().length;
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : 0;

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Progress</h2>
        <p className="text-xs text-gray-400 mt-0.5">{name}'s dashboard</p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Topics completed */}
        <StatCard
          icon={<CheckCircle2 size={20} className="text-green-500" />}
          label="Topics Completed"
          value={`${completedTopics}/${totalTopics}`}
          progress={totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}
          color="green"
        />

        {/* Quizzes answered */}
        <StatCard
          icon={<Target size={20} className="text-brand-500" />}
          label="Quizzes Answered"
          value={`${totalQuizzes}`}
          subtext={`${correctQuizzes} correct`}
          color="blue"
        />

        {/* Accuracy */}
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" />}
          label="Accuracy"
          value={`${accuracy}%`}
          progress={accuracy}
          color="yellow"
        />

        {/* Streak encouragement */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} className="text-orange-500" />
            <span className="font-medium text-gray-700 text-sm">Keep Going!</span>
          </div>
          <p className="text-xs text-gray-500">
            {completedTopics === 0
              ? 'Select your first topic and start learning! 📚'
              : completedTopics < 5
                ? 'Great progress! Try more topics! 💪'
                : 'Amazing progress! You\'re on fire! 🌟'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  progress,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  progress?: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-brand-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorMap[color] ?? 'bg-gray-400'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
