import { useState, useCallback, useRef } from 'react';

type VoiceInputState = 'idle' | 'recording' | 'processing';

export function useVoiceInput() {
  const [inputState, setInputState] = useState<VoiceInputState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setInputState('recording');
    } catch { alert('Mic access needed. Please allow in browser settings.'); }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state !== 'recording') { resolve(''); return; }
      recorder.onstop = async () => {
        setInputState('processing');
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        recorder.stream.getTracks().forEach(t => t.stop());
        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');
          const response = await fetch('/.netlify/functions/stt', { method: 'POST', body: formData });
          if (!response.ok) throw new Error('STT failed');
          const { text } = await response.json();
          setInputState('idle');
          resolve(text ?? '');
        } catch { setInputState('idle'); resolve(''); }
      };
      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') { recorder.stream.getTracks().forEach(t => t.stop()); recorder.stop(); }
    setInputState('idle');
  }, []);

  return { inputState, startRecording, stopRecording, cancelRecording };
}
