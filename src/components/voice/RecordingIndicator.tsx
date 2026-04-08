export default function RecordingIndicator({ state }: { state: 'recording' | 'processing' }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs">
      {state === 'recording' && (<><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span className="text-red-500">Listening...</span></>)}
      {state === 'processing' && (<><span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" /><span className="text-gray-500">Transcribing...</span></>)}
    </div>
  );
}
