import { Mic } from 'lucide-react';

interface Props { state: 'idle' | 'recording' | 'processing'; onMouseDown: () => void; onMouseUp: () => void; }

export default function VoiceRecordButton({ state, onMouseDown, onMouseUp }: Props) {
  return (
    <button onMouseDown={onMouseDown} onMouseUp={onMouseUp} onTouchStart={onMouseDown} onTouchEnd={onMouseUp}
      className={`p-2 rounded-xl transition-colors ${state === 'recording' ? 'bg-red-500 text-white animate-pulse' : state === 'processing' ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      disabled={state === 'processing'} title={state === 'recording' ? 'Release to send' : 'Hold to record'}>
      <Mic size={18} />
    </button>
  );
}
