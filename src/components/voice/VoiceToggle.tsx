import { Volume2, VolumeX } from 'lucide-react';

interface Props { enabled: boolean; isPlaying: boolean; onToggle: () => void; }

export default function VoiceToggle({ enabled, isPlaying, onToggle }: Props) {
  return (
    <button onClick={onToggle} className={`p-2 rounded-lg transition-colors ${enabled ? 'text-brand-600 hover:bg-brand-50' : 'text-gray-400 hover:bg-gray-100'}`} title={enabled ? 'Voice On' : 'Voice Off'}>
      {enabled ? <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} /> : <VolumeX size={20} />}
    </button>
  );
}
