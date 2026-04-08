import { sounds, type SoundName } from '../data/soundMap';

const audioCache = new Map<string, HTMLAudioElement>();

export function playSound(name: SoundName): void {
  const src = sounds[name];
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
