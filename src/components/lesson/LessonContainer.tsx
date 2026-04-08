import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLesson } from '../../hooks/useLesson';
import { useVoice } from '../../hooks/useVoice';
import { useGamification } from '../../contexts/GamificationContext';
import { getLevelForXP } from '../../data/levelDefinitions';
import { badges as badgeDefs } from '../../data/badgeDefinitions';
import { getTopicById } from '../../data/curriculum';
import { MessageCircle } from 'lucide-react';
import VideoIntro from './VideoIntro';
import CardFlow from './CardFlow';
import QuizTransition from './QuizTransition';
import QuizCard from './QuizCard';
import TopicComplete from './TopicComplete';
import LessonLoading from './LessonLoading';
import DoubtOverlay from './DoubtOverlay';
import VoiceToggle from '../voice/VoiceToggle';
import ConfettiEffect from '../gamification/ConfettiEffect';
import XPPopup from '../gamification/XPPopup';
import LevelUpModal from '../gamification/LevelUpModal';
import BadgeUnlock from '../gamification/BadgeUnlock';

export default function LessonContainer() {
  const {
    state, skipVideo, finishVideo, prevCard, nextCard, startQuiz,
    submitQuizAnswer, retryQuiz, nextQuiz, startTopic,
    completeTopic,
    nextTopicId, nextTopicTitle,
    sessionXPRef, quizCorrectRef, quizTotalRef,
    quizzesReady,
  } = useLesson();

  const { voiceEnabled, toggleVoice, speak, stop, isPlaying } = useVoice();
  const { gamification } = useGamification();
  const [doubtOpen, setDoubtOpen] = useState(false);

  // Gamification popup state
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpPopup, setXpPopup] = useState<number | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);
  const [badgeInfo, setBadgeInfo] = useState<{ name: string; icon: string } | null>(null);

  // Track XP changes to show popups
  const prevXPRef = useMemo(() => ({ current: gamification.xp }), []);
  const prevBadgesRef = useMemo(() => ({ current: [...gamification.badges] }), []);

  useEffect(() => {
    const xpDiff = gamification.xp - prevXPRef.current;
    if (xpDiff > 0) {
      setXpPopup(xpDiff);

      // Check for level up
      const oldLevel = getLevelForXP(prevXPRef.current);
      const newLevel = getLevelForXP(gamification.xp);
      if (newLevel.level > oldLevel.level) {
        setTimeout(() => setLevelUpInfo({ level: newLevel.level, title: newLevel.title }), 1800);
      }
    }
    prevXPRef.current = gamification.xp;
  }, [gamification.xp]);

  // Check for new badges
  useEffect(() => {
    const newBadge = gamification.badges.find(id => !prevBadgesRef.current.includes(id));
    if (newBadge) {
      const badge = badgeDefs.find(b => b.id === newBadge);
      if (badge) {
        setTimeout(() => setBadgeInfo({ name: badge.name, icon: badge.icon }), 2000);
      }
    }
    prevBadgesRef.current = [...gamification.badges];
  }, [gamification.badges]);

  // Show confetti when topic completes
  useEffect(() => {
    if (state.phase === 'TOPIC_COMPLETE') {
      setShowConfetti(true);
    }
  }, [state.phase]);

  const topicTitle = useMemo(
    () => state.topicId ? getTopicById(state.topicId)?.topic.title ?? '' : '',
    [state.topicId]
  );

  // When last quiz is done, auto-complete the topic
  const handleNextQuiz = useCallback(() => {
    const totalQuizzes = state.lesson?.quizzes.length ?? 0;
    const isLastQuiz = state.currentQuizIndex + 1 >= totalQuizzes;
    if (isLastQuiz) {
      completeTopic();
    } else {
      nextQuiz();
    }
  }, [state.lesson, state.currentQuizIndex, completeTopic, nextQuiz]);

  // Stop TTS when advancing cards
  const handleNextCard = useCallback(() => {
    stop();
    nextCard();
  }, [stop, nextCard]);

  const handlePrevCard = useCallback(() => {
    stop();
    prevCard();
  }, [stop, prevCard]);

  if (!state.topicId) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-500">Select a topic from the sidebar to start learning.</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <p className="text-red-500 mb-4">{state.error}</p>
        <button onClick={() => state.topicId && startTopic(state.topicId)}
          className="px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700">
          Retry
        </button>
      </div>
    );
  }

  // Show Video Intro immediately — it doesn't need lesson content
  if (state.phase === 'TOPIC_INTRO' && state.template) {
    return (
      <div className="h-full relative">
        <VideoIntro topicTitle={topicTitle} videoId={state.template.videoId} onSkip={skipVideo} onFinish={finishVideo} onOpenDoubt={() => setDoubtOpen(true)} doubtOpen={doubtOpen} />
        <DoubtOverlay isOpen={doubtOpen} onClose={() => setDoubtOpen(false)} topicTitle={topicTitle} topicId={state.topicId} />
      </div>
    );
  }

  // For all other phases, we need lesson content
  if (state.isLoading || !state.lesson) {
    return <LessonLoading topicTitle={topicTitle} />;
  }

  return (
    <div className="h-full relative">

      {/* Voice toggle — visible during cards */}
      {state.phase === 'CONCEPT_CARDS' && (
        <div className="absolute top-2 right-2 z-10">
          <VoiceToggle enabled={voiceEnabled} isPlaying={isPlaying} onToggle={toggleVoice} />
        </div>
      )}

      {state.phase === 'CONCEPT_CARDS' && (
        <CardFlow
          cards={state.lesson.cards}
          currentIndex={state.currentCardIndex}
          onNext={handleNextCard}
          onBack={handlePrevCard}
          onSpeak={voiceEnabled ? speak : undefined}
        />
      )}

      {state.phase === 'QUIZ_TRANSITION' && (
        <QuizTransition onStart={startQuiz} quizzesReady={quizzesReady} />
      )}

      {state.phase === 'QUIZ_CARDS' && (
        <QuizCard
          quiz={state.lesson.quizzes[state.currentQuizIndex]}
          attemptState={state.quizAttempt}
          quizNumber={state.currentQuizIndex}
          totalQuizzes={state.lesson.quizzes.length}
          onSelectAnswer={submitQuizAnswer}
          onRetry={retryQuiz}
          onNext={handleNextQuiz}
        />
      )}

      {state.phase === 'TOPIC_COMPLETE' && (
        <TopicComplete
          topicTitle={topicTitle}
          lesson={state.lesson}
          totalXP={sessionXPRef.current}
          quizScore={{ correct: quizCorrectRef.current, total: quizTotalRef.current }}
          onNextTopic={() => nextTopicId && startTopic(nextTopicId)}
          nextTopicTitle={nextTopicTitle}
          onOpenDoubt={() => setDoubtOpen(true)}
        />
      )}

      {['CONCEPT_CARDS', 'QUIZ_CARDS'].includes(state.phase) && (
        <button
          onClick={() => setDoubtOpen(true)}
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-2 py-3 bg-amber-50 border-t border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Have a doubt? Ask AI</span>
        </button>
      )}

      <DoubtOverlay isOpen={doubtOpen} onClose={() => setDoubtOpen(false)} topicTitle={topicTitle} topicId={state.topicId} />

      {/* Gamification popups */}
      {showConfetti && <ConfettiEffect onDone={() => setShowConfetti(false)} />}
      {xpPopup !== null && <XPPopup amount={xpPopup} onDone={() => setXpPopup(null)} />}
      {levelUpInfo && <LevelUpModal level={levelUpInfo.level} title={levelUpInfo.title} onDone={() => setLevelUpInfo(null)} />}
      {badgeInfo && <BadgeUnlock badgeName={badgeInfo.name} badgeIcon={badgeInfo.icon} onDone={() => setBadgeInfo(null)} />}
    </div>
  );
}
