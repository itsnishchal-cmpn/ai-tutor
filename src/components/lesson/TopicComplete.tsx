import { useEffect, useState, useRef } from 'react';
import type { GeneratedLesson } from '../../types/lesson';
import { ArrowRight, MessageCircle, Target } from 'lucide-react';

interface Props {
  topicTitle: string;
  lesson: GeneratedLesson;
  totalXP: number;
  quizScore: { correct: number; total: number };
  onNextTopic: () => void;
  nextTopicTitle: string | null;
  onOpenDoubt: () => void;
}

function CountUp({ end, duration = 1000 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration]);
  return <span className="count-up">{value}</span>;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function TopicComplete({
  topicTitle, lesson, totalXP, quizScore, onNextTopic, nextTopicTitle, onOpenDoubt,
}: Props) {
  const [showStats, setShowStats] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStats(true), 600);
    const t2 = setTimeout(() => setShowPoints(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#FAFBFC]"
      style={{ background: 'radial-gradient(ellipse at center, #FFFBEB 0%, #FAFBFC 60%)' }}
    >
      <div className="max-w-md mx-auto w-full py-8 px-6 flex flex-col items-center">
        {/* Trophy */}
        <div className="relative mb-4 animate-bounce-in">
          <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center ring-4 ring-amber-200" style={{ boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)' }}>
            <span className="text-5xl">🏆</span>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-[#1E293B] mb-1 animate-fade-in-up">Topic Complete!</h2>
        <p className="text-[#64748B] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>{topicTitle}</p>

        {showStats && (
          <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
            <div className="bg-white rounded-2xl p-3.5 text-center border border-amber-100 animate-fade-up" style={{ boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)' }}>
              <StarIcon className="text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-amber-600">+<CountUp end={totalXP} /></p>
              <p className="text-[10px] text-[#64748B] font-medium">XP Earned</p>
            </div>
            <div className="bg-white rounded-2xl p-3.5 text-center border border-indigo-100 animate-fade-up" style={{ animationDelay: '0.1s', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)' }}>
              <Target size={20} className="text-indigo-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-indigo-600"><CountUp end={quizScore.correct} />/{quizScore.total}</p>
              <p className="text-[10px] text-[#64748B] font-medium">Quiz Score</p>
            </div>
            <div className="bg-white rounded-2xl p-3.5 text-center border border-emerald-100 animate-fade-up" style={{ animationDelay: '0.2s', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="mx-auto mb-1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <p className="text-xl font-extrabold text-emerald-600"><CountUp end={quizScore.total > 0 ? Math.round((quizScore.correct / quizScore.total) * 100) : 0} />%</p>
              <p className="text-[10px] text-[#64748B] font-medium">Accuracy</p>
            </div>
          </div>
        )}

        {showPoints && (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6" style={{ boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)' }}>
            <h3 className="text-sm font-bold text-emerald-700 mb-3">Key Points</h3>
            <div className="space-y-2.5">
              {lesson.summary.keyPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 animate-fade-up" style={{ animationDelay: `${i * 200}ms` }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" fill="#10B981" opacity="0.15" />
                    <path d="M7 12.5l3 3 7-7" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" style={{ animationDelay: `${i * 200 + 100}ms` }} />
                  </svg>
                  <span className="text-sm text-[#1E293B] leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full space-y-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button onClick={onOpenDoubt} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#64748B] rounded-xl font-medium border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all btn-press">
            <MessageCircle size={18} /> Have doubts? Ask AI
          </button>
          {nextTopicTitle && (
            <button onClick={onNextTopic} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold text-lg transition-all btn-press" style={{ boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)' }}>
              Next: {nextTopicTitle} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
