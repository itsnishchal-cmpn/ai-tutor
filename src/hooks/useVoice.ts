import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchAndPlayTTS, stopAudio, clearAudioCache } from '../lib/audioPlayer';
import { getItem, setItem } from '../lib/storage';

export function useVoice() {
  const [voiceEnabled, setVoiceEnabled] = useState(() => getItem<boolean>('voice_enabled', true));
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => { const next = !prev; setItem('voice_enabled', next); if (!next) stopAudio(); return next; });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled || !text.trim()) return;
    cancelRef.current = false;
    setIsPlaying(true);
    try { await fetchAndPlayTTS(text); } catch {} finally { if (!cancelRef.current) setIsPlaying(false); }
  }, [voiceEnabled]);

  const stop = useCallback(() => { cancelRef.current = true; stopAudio(); setIsPlaying(false); }, []);

  useEffect(() => { return () => { stopAudio(); clearAudioCache(); }; }, []);

  return { voiceEnabled, toggleVoice, speak, stop, isPlaying };
}
