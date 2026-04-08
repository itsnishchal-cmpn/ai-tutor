import { useState, useMemo, useCallback } from 'react';
import { useLesson } from '../../hooks/useLesson';
import { useVoice } from '../../hooks/useVoice';
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

export default function LessonContainer() {
  const {
    state, skipVideo, finishVideo, nextCard, startQuiz,
    submitQuizAnswer, retryQuiz, nextQuiz, startTopic,
    completeTopic,
    nextTopicId, nextTopicTitle,
    sessionXPRef, quizCorrectRef, quizTotalRef,
  } = useLesson();

  const { voiceEnabled, toggleVoice, speak, stop, isPlaying } = useVoice();
  const [doubtOpen, setDoubtOpen] = useState(false);

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

  // Stop TTS when advancing cards or changing phases
  const handleNextCard = useCallback(() => {
    stop();
    nextCard();
  }, [stop, nextCard]);

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
          onSpeak={voiceEnabled ? speak : undefined}
        />
      )}

      {state.phase === 'QUIZ_TRANSITION' && (
        <QuizTransition onStart={startQuiz} />
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
        <button onClick={() => setDoubtOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-700 transition-colors z-40"
          title="Ask a doubt">
          <MessageCircle size={22} />
        </button>
      )}

      <DoubtOverlay isOpen={doubtOpen} onClose={() => setDoubtOpen(false)} topicTitle={topicTitle} topicId={state.topicId} />
    </div>
  );
}
