const audioCache = new Map<string, ArrayBuffer>();
let currentAudio: HTMLAudioElement | null = null;

export async function fetchAndPlayTTS(text: string): Promise<void> {
  const cacheKey = text.trim();
  let buffer = audioCache.get(cacheKey);
  if (!buffer) {
    const response = await fetch('/.netlify/functions/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('TTS failed');
    buffer = await response.arrayBuffer();
    audioCache.set(cacheKey, buffer);
  }
  stopAudio();
  const blob = new Blob([buffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  currentAudio = new Audio(url);
  return new Promise((resolve, reject) => {
    if (!currentAudio) return resolve();
    currentAudio.onended = () => { URL.revokeObjectURL(url); resolve(); };
    currentAudio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Audio playback failed')); };
    currentAudio.play().catch(reject);
  });
}

export function stopAudio(): void {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
}

export function clearAudioCache(): void { audioCache.clear(); }
