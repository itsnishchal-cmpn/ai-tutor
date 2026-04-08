import { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { useGamification } from '../../contexts/GamificationContext';
import { getAllTopicIds } from '../../data/curriculum';
import { getLevelForXP, getXPProgressToNextLevel } from '../../data/levelDefinitions';
import { badges as badgeDefs } from '../../data/badgeDefinitions';
import { Trophy, Target, CheckCircle2, Flame, RotateCcw, Star, Award, Volume2, VolumeX, X, Eye, Mic } from 'lucide-react';
import StreakCounter from '../gamification/StreakCounter';
import { getItem, setItem } from '../../lib/storage';

const VOICE_OPTIONS = [
  { id: 'nova', label: 'Nova', desc: 'Warm & friendly' },
  { id: 'shimmer', label: 'Shimmer', desc: 'Soft & clear' },
  { id: 'alloy', label: 'Alloy', desc: 'Neutral & balanced' },
  { id: 'echo', label: 'Echo', desc: 'Calm & deep' },
  { id: 'fable', label: 'Fable', desc: 'Expressive & British' },
  { id: 'onyx', label: 'Onyx', desc: 'Deep & authoritative' },
];

export default function ProgressPanel() {
  const { name } = useUser();
  const { completedTopics, resetProgress } = useProgress();
  const { gamification, toggleSound, resetGamification } = useGamification();
  const totalTopics = getAllTopicIds().length;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const currentLevel = getLevelForXP(gamification.xp);
  const xpProgress = getXPProgressToNextLevel(gamification.xp);
  const earnedBadges = badgeDefs.filter(b => gamification.badges.includes(b.id));

  // Quiz stats from gamification context (not progress context)
  const quizPerf = gamification.quizPerformance;
  const totalQuizzes = Object.values(quizPerf).reduce((sum, p) => sum + p.total, 0);
  const correctQuizzes = Object.values(quizPerf).reduce((sum, p) => sum + p.firstAttemptCorrect, 0);
  const accuracy = totalQuizzes > 0 ? Math.round((correctQuizzes / totalQuizzes) * 100) : null;

  // Voice selection
  const [selectedVoice, setSelectedVoice] = useState(() => getItem<string>('tts_voice', 'nova'));
  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    setItem('tts_voice', voice);
  };

  const handleReset = () => {
    resetProgress();
    resetGamification();
    setShowResetConfirm(false);
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('padhai_')) {
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

        {/* Quiz Score */}
        <StatCard
          icon={<Target size={20} className="text-brand-500" />}
          label="Quiz Score"
          value={totalQuizzes > 0 ? `${correctQuizzes}/${totalQuizzes}` : '\u2014'}
          subtext={totalQuizzes > 0 ? `${correctQuizzes} correct on first try` : 'No quizzes yet'}
          color="blue"
          progress={totalQuizzes > 0 ? (correctQuizzes / totalQuizzes) * 100 : 0}
        />

        {/* Accuracy */}
        <StatCard
          icon={<Trophy size={20} className="text-yellow-500" />}
          label="Accuracy"
          value={accuracy !== null ? `${accuracy}%` : '\u2014'}
          progress={accuracy ?? 0}
          color="yellow"
        />

        {/* XP & Level */}
        <StatCard
          icon={<Star size={20} className="text-brand-500" />}
          label={`Level ${currentLevel.level} \u2014 ${currentLevel.title}`}
          value={`${gamification.xp} XP`}
          progress={xpProgress.percent}
          color="blue"
          subtext={`${xpProgress.current}/${xpProgress.needed} to next level`}
        />

        {/* Streak */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <StreakCounter streak={gamification.currentStreak} />
            <span className="text-xs text-gray-400">Best: {gamification.longestStreak}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-purple-500" />
              <span className="text-sm text-gray-500">Badges ({earnedBadges.length}/{badgeDefs.length})</span>
            </div>
            <button
              onClick={() => setShowBadgeModal(true)}
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <Eye size={12} /> View All
            </button>
          </div>
          {earnedBadges.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <span key={b.id} className="text-2xl cursor-default" title={`${b.name}: ${b.description}`}>{b.icon}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Complete lessons to earn badges!</p>
          )}
        </div>

        {/* Voice selector */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">AI Voice</span>
          </div>
          <select
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-brand-400"
          >
            {VOICE_OPTIONS.map(v => (
              <option key={v.id} value={v.id}>{v.label} — {v.desc}</option>
            ))}
          </select>
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full rounded-lg hover:bg-gray-50"
        >
          {gamification.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          Sound Effects: {gamification.soundEnabled ? 'On' : 'Off'}
        </button>

        {/* Encouragement */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} className="text-orange-500" />
            <span className="font-medium text-gray-700 text-sm">Keep Going!</span>
          </div>
          <p className="text-xs text-gray-500">
            {completedTopics === 0
              ? 'Select your first topic and start learning!'
              : completedTopics < 5
                ? 'Great progress! Try more topics!'
                : 'Amazing progress!'}
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
                <button onClick={handleReset} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">Yes, Reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1 bg-white text-gray-600 rounded text-xs border border-gray-200 hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBadgeModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">All Badges</h3>
              <button onClick={() => setShowBadgeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {badgeDefs.map(b => {
                const earned = gamification.badges.includes(b.id);
                return (
                  <div key={b.id} className={`flex items-center gap-3 p-3 rounded-xl ${earned ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-100'}`}>
                    <span className={`text-3xl ${earned ? '' : 'grayscale opacity-40'}`}>{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${earned ? 'text-gray-800' : 'text-gray-400'}`}>{b.name}</p>
                      <p className={`text-xs ${earned ? 'text-gray-500' : 'text-gray-300'}`}>{b.description}</p>
                    </div>
                    {earned && <CheckCircle2 size={18} className="text-purple-500 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, subtext, progress, color,
}: {
  icon: React.ReactNode; label: string; value: string; subtext?: string; progress?: number; color: string;
}) {
  const colorMap: Record<string, string> = { green: 'bg-green-500', blue: 'bg-brand-500', yellow: 'bg-yellow-500' };
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
          <div className={`h-full rounded-full transition-all duration-500 ${colorMap[color] ?? 'bg-gray-400'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
