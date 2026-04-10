import { useState, useRef, useCallback } from 'react';
import { Play, SkipForward, MessageCircle } from 'lucide-react';

interface Props {
  topicTitle: string;
  videoId: string;
  onSkip: () => void;
  onFinish: () => void;
  onOpenDoubt: () => void;
  doubtOpen: boolean;
}

export default function VideoIntro({ topicTitle, videoId, onSkip, onFinish, onOpenDoubt, doubtOpen }: Props) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const postYTCommand = useCallback((command: string) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
    } catch { /* Cross-origin — best effort */ }
  }, []);

  const handleAskDoubt = () => {
    postYTCommand('pauseVideo');
    onOpenDoubt();
  };

  const prevDoubtOpenRef = useRef(doubtOpen);
  if (prevDoubtOpenRef.current && !doubtOpen && playing) {
    postYTCommand('playVideo');
  }
  prevDoubtOpenRef.current = doubtOpen;

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <h2 className="text-xl font-bold text-[#1E293B] mb-2 text-center">{topicTitle}</h2>
        <p className="text-[#64748B] text-center mb-6">Watch a quick intro video before we start!</p>

        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden mb-4 shadow-lg">
          {playing ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`}
              title={topicTitle}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex flex-col items-center justify-center relative">
              <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={topicTitle} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg btn-press">
                  <Play size={28} className="text-indigo-500 ml-1" fill="#6366F1" />
                </div>
              </div>
            </button>
          )}
        </div>

        {playing && (
          <button
            onClick={handleAskDoubt}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 bg-reward-50 text-reward-700 border border-reward-200 rounded-xl hover:bg-reward-100 transition-colors text-sm font-semibold btn-press"
          >
            <MessageCircle size={16} />
            Have a doubt? Ask AI
          </button>
        )}

        <div className="flex gap-3">
          <button
            onClick={playing ? onFinish : () => setPlaying(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-500 text-white rounded-xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-md btn-press"
          >
            <Play size={18} />
            {playing ? 'Start Learning \u2192' : 'Watch Video'}
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-[#64748B] rounded-xl font-medium border border-[#E2E8F0] hover:bg-gray-50 transition-all btn-press"
          >
            <SkipForward size={18} /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}
