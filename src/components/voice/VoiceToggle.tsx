import { Volume2, VolumeX } from 'lucide-react';

interface Props { enabled: boolean; isPlaying: boolean; onToggle: () => void; }

export default function VoiceToggle({ enabled, isPlaying, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-xl transition-all btn-press ${
        enabled
          ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 shadow-sm'
          : 'text-[#AFAFAF] bg-gray-100 hover:bg-gray-200'
      }`}
      title={enabled ? 'Voice On' : 'Voice Off'}
    >
      {enabled ? (
        <div className="flex items-center gap-1">
          <Volume2 size={18} />
          {isPlaying && (
            <div className="flex items-center gap-0.5 h-4">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="w-0.5 bg-indigo-500 rounded-full"
                  style={{
                    height: `${6 + Math.random() * 8}px`,
                    animation: `waveform 0.5s ${i * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <VolumeX size={18} />
      )}
    </button>
  );
}
