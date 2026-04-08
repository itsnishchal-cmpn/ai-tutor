import type { LevelDefinition } from '../types/gamification';

export const levels: LevelDefinition[] = [
  { level: 1, xpRequired: 0, title: 'Math Beginner' },
  { level: 2, xpRequired: 100, title: 'Number Explorer' },
  { level: 3, xpRequired: 250, title: 'Shape Learner' },
  { level: 4, xpRequired: 500, title: 'Geometry Explorer' },
  { level: 5, xpRequired: 800, title: 'Angle Master' },
  { level: 6, xpRequired: 1200, title: 'Quadrilateral Warrior' },
  { level: 7, xpRequired: 1800, title: 'Math Champion' },
  { level: 8, xpRequired: 2500, title: 'PadhAI Pro' },
];

export function getLevelForXP(xp: number): LevelDefinition {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) return levels[i];
  }
  return levels[0];
}

export function getNextLevel(xp: number): LevelDefinition | null {
  const current = getLevelForXP(xp);
  const next = levels.find(l => l.level === current.level + 1);
  return next ?? null;
}

export function getXPProgressToNextLevel(xp: number): { current: number; needed: number; percent: number } {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = getNextLevel(xp);
  if (!nextLevel) return { current: xp, needed: xp, percent: 100 };
  const currentLevelXP = xp - currentLevel.xpRequired;
  const levelRange = nextLevel.xpRequired - currentLevel.xpRequired;
  return {
    current: currentLevelXP,
    needed: levelRange,
    percent: Math.round((currentLevelXP / levelRange) * 100),
  };
}
