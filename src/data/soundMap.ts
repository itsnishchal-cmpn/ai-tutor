export const sounds = {
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  tap: '/sounds/tap.mp3',
  topicComplete: '/sounds/topic-complete.mp3',
  levelUp: '/sounds/level-up.mp3',
  badgeEarned: '/sounds/badge-earned.mp3',
  streak: '/sounds/streak.mp3',
} as const;

export type SoundName = keyof typeof sounds;
