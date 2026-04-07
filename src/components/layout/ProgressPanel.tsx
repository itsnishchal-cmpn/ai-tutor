import { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { getAllTopicIds } from '../../data/curriculum';
import { Trophy, Target, CheckCircle2, Flame, RotateCcw } from 'lucide-react';

export default function ProgressPanel() {
  const { name } = useUser();
  const { totalQuizzes, correctQuizzes, completedTopics, resetProgress } = useProgress();
  const totalTopics = getAllTopicIds().length;
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : null;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    resetProgress();
    setShowResetConfirm(false);
    // Also clear all saved chats
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('padhai_chat_')) {
        localStorage.removeItem(k);
      }
    });
    window.location.reload();
  };

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
          subtext={totalQuizzes > 0 ? `${correctQuizzes} correct` : 'No quizzes yet'}
          color="blue"
          progress={totalQuizzes > 0 ? (correctQuizzes / totalQuizzes) * 100 : 0}
        />

        {/* Accuracy */}
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" />}
          label="Accuracy"
          value={accuracy !== null ? `${accuracy}%` : '—'}
          progress={accuracy ?? 0}
          color="yellow"
        />

        {/* Encouragement */}
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

        {/* Reset button */}
        <div className="pt-2 border-t border-gray-100">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full rounded-lg hover:bg-red-50"
            >
              <RotateCcw size={14} />
              Reset All Progress
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-xs text-red-700 mb-2">This will clear all your progress, quiz results, and chat history. Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 bg-white text-gray-600 rounded text-xs border border-gray-200 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
