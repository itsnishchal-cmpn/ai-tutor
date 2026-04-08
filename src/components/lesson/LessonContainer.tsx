import { useState, useMemo } from 'react';
import { useLesson } from '../../hooks/useLesson';
import { getTopicById } from '../../data/curriculum';
import { MessageCircle } from 'lucide-react';
import VideoIntro from './VideoIntro';
import CardFlow from './CardFlow';
import QuizTransition from './QuizTransition';
import QuizCard from './QuizCard';
import TopicComplete from './TopicComplete';
import LessonLoading from './LessonLoading';
import DoubtOverlay from './DoubtOverlay';

export default function LessonContainer() {
  const {
    state, skipVideo, finishVideo, nextCard, startQuiz,
    submitQuizAnswer, retryQuiz, nextQuiz, startTopic,
    nextTopicId, nextTopicTitle,
  } = useLesson();

  const [doubtOpen, setDoubtOpen] = useState(false);

  const topicTitle = useMemo(
    () => state.topicId ? getTopicById(state.topicId)?.topic.title ?? '' : '',
    [state.topicId]
  );

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

  // Show Video Intro immediately — it doesn't need lesson content (just the template videoId)
  // Only show loading spinner if student tries to proceed before content is ready
  if (state.phase === 'TOPIC_INTRO' && state.template) {
    return (
      <div className="h-full relative">
        <VideoIntro topicTitle={topicTitle} videoId={state.template.videoId} onSkip={skipVideo} onFinish={finishVideo} onOpenDoubt={() => setDoubtOpen(true)} />
        <DoubtOverlay isOpen={doubtOpen} onClose={() => setDoubtOpen(false)} topicTitle={topicTitle} topicId={state.topicId} />
      </div>
    );
  }

  // For all other phases, we need lesson content — show loading if not ready
  if (state.isLoading || !state.lesson) {
    return <LessonLoading topicTitle={topicTitle} />;
  }

  return (
    <div className="h-full relative">

      {state.phase === 'CONCEPT_CARDS' && state.lesson && (
        <CardFlow cards={state.lesson.cards} currentIndex={state.currentCardIndex} onNext={nextCard} />
      )}

      {state.phase === 'QUIZ_TRANSITION' && (
        <QuizTransition onStart={startQuiz} />
      )}

      {state.phase === 'QUIZ_CARDS' && state.lesson && (
        <QuizCard
          quiz={state.lesson.quizzes[state.currentQuizIndex]}
          attemptState={state.quizAttempt}
          quizNumber={state.currentQuizIndex}
          totalQuizzes={state.lesson.quizzes.length}
          onSelectAnswer={submitQuizAnswer}
          onRetry={retryQuiz}
          onNext={nextQuiz}
        />
      )}

      {state.phase === 'TOPIC_COMPLETE' && state.lesson && (
        <TopicComplete
          topicTitle={topicTitle}
          lesson={state.lesson}
          totalXP={0}
          quizScore={{ correct: 0, total: state.lesson.quizzes.length }}
          onNextTopic={() => nextTopicId && startTopic(nextTopicId)}
          nextTopicTitle={nextTopicTitle}
          onOpenDoubt={() => setDoubtOpen(true)}
        />
      )}

      {['CONCEPT_CARDS', 'QUIZ_CARDS', 'VIDEO_PLAYING'].includes(state.phase) && (
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
