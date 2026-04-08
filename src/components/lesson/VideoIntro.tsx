import { useState, useRef } from 'react';
import { Play, SkipForward, MessageCircle } from 'lucide-react';

interface Props {
  topicTitle: string;
  videoId: string;
  onSkip: () => void;
  onFinish: () => void;
  onOpenDoubt: () => void;
}

export default function VideoIntro({ topicTitle, videoId, onSkip, onFinish, onOpenDoubt }: Props) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleAskDoubt = () => {
    // We can't programmatically pause a YouTube iframe via postMessage reliably,
    // but we can overlay a "paused" state and tell the user
    setPaused(true);
    onOpenDoubt();
  };

  const handleResumeVideo = () => {
    setPaused(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{topicTitle}</h2>
        <p className="text-gray-500 text-center mb-6">Watch a quick intro video before we start!</p>

        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-4">
          {playing ? (
            <>
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`}
                title={topicTitle}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              {/* Paused overlay */}
              {paused && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <button
                    onClick={handleResumeVideo}
                    className="px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <Play size={18} className="inline mr-2" />
                    Resume Video
                  </button>
                </div>
              )}
            </>
          ) : (
            <button onClick={() => setPlaying(true)} className="w-full h-full flex flex-col items-center justify-center relative">
              <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt={topicTitle} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={28} className="text-brand-600 ml-1" />
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Have a doubt button — visible when video is playing */}
        {playing && !paused && (
          <button
            onClick={handleAskDoubt}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium"
          >
            <MessageCircle size={16} />
            Have a doubt? Ask AI
          </button>
        )}

        <div className="flex gap-3">
          <button onClick={playing ? onFinish : () => setPlaying(true)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors">
            <Play size={18} />
            {playing ? 'Start Learning \u2192' : 'Watch Video'}
          </button>
          <button onClick={onSkip} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
            <SkipForward size={18} /> Skip
          </button>
        </div>
      </div>
    </div>
  );
}
