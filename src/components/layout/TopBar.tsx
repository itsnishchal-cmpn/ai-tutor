import { useGamification } from '../../contexts/GamificationContext';
import { getLevelForXP, getXPProgressToNextLevel } from '../../data/levelDefinitions';
import { ArrowLeft, Settings, ChevronRight } from 'lucide-react';
import type { LessonPhase } from '../../types/lesson';

interface LessonProgress {
  phase: LessonPhase;
  totalCards: number;
  currentCard: number;
  totalQuizzes: number;
  currentQuiz: number;
}

interface Props {
  isInLesson: boolean;
  topicTitle: string;
  lessonProgress?: LessonProgress;
  onBackToPath: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

function FlameIcon({ streak }: { streak: number }) {
  const active = streak > 0;
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#F97316' : '#CBD5E1'} className={active ? 'animate-flame' : ''}>
      <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.17 3.38-7.75.42-.53 1.24-.42 1.5.19.5 1.17 1.25 2.25 2.4 3.06.1-.85.4-2.1 1.22-3.5C12.78 4.83 14 3.12 14 3.12s.78 1.71 1.5 3.38c.6 1.4.9 2.65 1 3.5 1.15-.81 1.9-1.89 2.4-3.06.26-.61 1.08-.72 1.5-.19C21.65 8.33 23.78 11.31 23.78 14.5c0 4.42-4.03 8-9 8z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function TopBar({
  isInLesson, topicTitle, lessonProgress, onBackToPath, onOpenSettings,
}: Props) {
  const { gamification } = useGamification();
  const currentLevel = getLevelForXP(gamification.xp);
  const xpProgress = getXPProgressToNextLevel(gamification.xp);

  const getProgressText = () => {
    if (!lessonProgress) return '';
    const { phase, totalCards, currentCard, totalQuizzes: tq, currentQuiz } = lessonProgress;
    if (phase === 'CONCEPT_CARDS') return `${currentCard + 1} / ${totalCards}`;
    if (phase === 'QUIZ_CARDS') return `Quiz ${currentQuiz + 1} / ${tq}`;
    if (phase === 'TOPIC_COMPLETE') return 'Complete!';
    return '';
  };

  return (
    <header
      className="h-14 bg-white flex items-center justify-between px-3 sm:px-5 shrink-0 z-30"
      style={{
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left: Logo or Back button */}
      <div className="flex items-center gap-2 min-w-0">
        {isInLesson ? (
          <>
            <button
              onClick={onBackToPath}
              className="flex items-center gap-1 text-[#64748B] hover:text-indigo-600 transition-colors rounded-lg px-2 py-1.5 -ml-1 hover:bg-indigo-50"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            {topicTitle && (
              <>
                <ChevronRight size={14} className="text-[#CBD5E1] hidden sm:block" />
                <span className="text-sm text-[#475569] font-medium hidden sm:inline truncate max-w-[180px]">{topicTitle}</span>
                {lessonProgress && getProgressText() && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md ml-1">
                    {getProgressText()}
                  </span>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center"
              style={{ boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="font-bold text-[#1E293B] text-base tracking-tight">
              Padh<span className="text-indigo-600">AI</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Stat pills + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Streak pill */}
        <div
          className="flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 cursor-default transition-transform hover:scale-105"
          style={{ background: gamification.currentStreak > 0 ? '#FFF7ED' : '#F8FAFC', border: '1px solid #FED7AA' }}
          title={`${gamification.currentStreak} day streak`}
        >
          <FlameIcon streak={gamification.currentStreak} />
          <span className="text-sm font-bold text-[#1E293B]">{gamification.currentStreak}</span>
        </div>

        {/* XP pill */}
        <div
          className="flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-1 cursor-default transition-transform hover:scale-105"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
          title={`${gamification.xp} XP — ${xpProgress.current}/${xpProgress.needed} to next level`}
        >
          <StarIcon className="text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{gamification.xp}</span>
        </div>


        {/* Level ring + title */}
        <div
          className="hidden sm:flex items-center gap-1.5 rounded-full px-1 pr-2.5 py-0.5 cursor-default transition-transform hover:scale-105"
          style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
          title={`Level ${currentLevel.level}: ${currentLevel.title}`}
        >
          <div className="relative w-7 h-7">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="13" fill="none" stroke="#E0E7FF" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="13" fill="none"
                stroke="#6366F1" strokeWidth="3"
                strokeDasharray={`${xpProgress.percent * 0.82} 82`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-indigo-600">
              {currentLevel.level}
            </span>
          </div>
          <span className="hidden lg:inline text-xs font-semibold text-indigo-600">{currentLevel.title}</span>
        </div>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors text-[#94A3B8] hover:text-[#475569]"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
