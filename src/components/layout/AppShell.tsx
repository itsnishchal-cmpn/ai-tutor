import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import SettingsModal from './SettingsModal';
import ProgressPath from '../path/ProgressPath';
import LessonContainer from '../lesson/LessonContainer';
import { useLesson } from '../../hooks/useLesson';
import { useUser } from '../../contexts/UserContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useGamification } from '../../contexts/GamificationContext';
import { getTopicById } from '../../data/curriculum';
import { getTemplate } from '../../data/lessonTemplates';

export type AppView =
  | { screen: 'home' }
  | { screen: 'lesson'; topicId: string };

export default function AppShell() {
  const [view, setView] = useState<AppView>({ screen: 'home' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [transition, setTransition] = useState<'none' | 'slide-in' | 'slide-out'>('none');

  const { state: lessonState, startTopic } = useLesson();
  const { clearUser } = useUser();
  useProgress();
  const { updateStreak } = useGamification();
  const navigate = useNavigate();
  const viewRef = useRef(view);
  viewRef.current = view;
  const prevTopicIdRef = useRef<string | null>(null);

  // Start/maintain streak when the app is opened
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  // React to lessonState.topicId changes:
  // - null → topicId: bookmark restored or topic selected → show lesson
  // - topicId → null: lesson ended → go back to path
  // - topicId → different topicId: "Next Topic" pressed → update view
  useEffect(() => {
    const prevId = prevTopicIdRef.current;
    const currId = lessonState.topicId;
    prevTopicIdRef.current = currId;

    // Topic was set to null — go back to home
    if (viewRef.current.screen === 'lesson' && !currId) {
      handleBackToPath();
      return;
    }

    // Bookmark restored on mount (prevId was null, currId now set, still on home)
    if (!prevId && currId && viewRef.current.screen === 'home') {
      setView({ screen: 'lesson', topicId: currId });
      return;
    }

    // Topic changed to a different topic (Next Topic button pressed)
    if (prevId && currId && prevId !== currId && viewRef.current.screen === 'lesson') {
      setView({ screen: 'lesson', topicId: currId });
    }
  }, [lessonState.topicId]);

  const handleSelectTopic = useCallback((topicId: string) => {
    setTransition('slide-in');
    setTimeout(() => {
      const template = getTemplate(topicId);
      if (template) {
        startTopic(topicId);
      }
      setView({ screen: 'lesson', topicId });
      setTimeout(() => setTransition('none'), 350);
    }, 50);
  }, [startTopic]);

  const handleBackToPath = useCallback(() => {
    setTransition('slide-out');
    setTimeout(() => {
      setView({ screen: 'home' });
      setTimeout(() => setTransition('none'), 350);
    }, 250);
  }, []);

  const handleLogout = useCallback(() => {
    clearUser();
    navigate('/');
  }, [clearUser, navigate]);

  // Get current topic info for the top bar
  const currentTopicTitle = useMemo(() => {
    if (view.screen === 'lesson') {
      const info = getTopicById(view.topicId);
      return info?.topic.title ?? '';
    }
    return '';
  }, [view]);

  const lessonProgress = useMemo(() => {
    if (view.screen !== 'lesson') return undefined;
    const phase = lessonState.phase;
    const totalCards = lessonState.lesson?.cards.length ?? 0;
    const totalQuizzes = lessonState.lesson?.quizzes.length ?? 0;
    const currentCard = lessonState.currentCardIndex;
    const currentQuiz = lessonState.currentQuizIndex;
    return { phase, totalCards, currentCard, totalQuizzes, currentQuiz };
  }, [view, lessonState]);

  const isInLesson = view.screen === 'lesson' && lessonState.topicId !== null;


  return (
    <div className="app-shell flex flex-col bg-[#F7F7F7]">
      {/* Top Bar */}
      <TopBar
        isInLesson={isInLesson}
        topicTitle={currentTopicTitle}
        lessonProgress={lessonProgress}
        onBackToPath={handleBackToPath}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main content area with view transitions */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {view.screen === 'home' && (
          <div className={`h-full ${
            transition === 'slide-out' ? 'animate-slide-in-left' :
            transition === 'slide-in' ? 'animate-slide-out-left' : ''
          }`}>
            <ProgressPath onSelectTopic={handleSelectTopic} />
          </div>
        )}

        {view.screen === 'lesson' && (
          <div className={`h-full ${
            transition === 'slide-in' ? 'animate-slide-in-right' :
            transition === 'slide-out' ? 'animate-slide-out-right' : ''
          }`}>
            <LessonContainer />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}
