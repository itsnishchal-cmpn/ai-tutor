# PadhAI v2 Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform PadhAI from a free-form chat tutor into a Duolingo-style structured lesson flow with concept cards, quiz cards, gamification, voice I/O, photo upload, and a programmatic diagram engine.

**Architecture:** The app keeps its React 19 + Vite + Tailwind CSS + Netlify Functions stack. A new `LessonContext` state machine drives the lesson flow (TOPIC_INTRO → VIDEO → CARDS → QUIZ → COMPLETE), rendering a `LessonContainer` component in place of `ChatInterface` when a topic is active. Gamification (XP, levels, streaks, badges) lives in a separate `GamificationContext`. Voice and vision are added via new Netlify Functions proxying OpenAI TTS/Whisper and Claude Vision APIs.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite, Netlify Functions, Claude API (Anthropic), OpenAI TTS + Whisper, KaTeX, lucide-react

**Spec:** `docs/PADHAI-V2-REBUILD.md`

---

## File Structure

### New Files

```
src/types/lesson.ts                         — Lesson template types, lesson state, card/quiz types
src/types/gamification.ts                   — XP, Level, Badge, Streak types
src/data/lessonTemplates.ts                 — Templates for all 11 topics
src/data/badgeDefinitions.ts                — Badge conditions and metadata
src/data/levelDefinitions.ts                — Level XP thresholds and titles
src/data/soundMap.ts                        — Sound effect file references
src/data/lessonPrompts.ts                   — System prompts for lesson generation + doubt chat + vision
src/contexts/LessonContext.tsx              — Lesson state machine + provider
src/contexts/GamificationContext.tsx         — XP, streaks, levels, badges + provider
src/hooks/useLesson.ts                      — Lesson flow operations (advance card, submit quiz, etc.)
src/hooks/useVoice.ts                       — TTS playback (fetch audio, play, queue, toggle)
src/hooks/useVoiceInput.ts                  — STT recording (MediaRecorder, send to Whisper)
src/hooks/useGamification.ts                — XP/streak/badge operations
src/lib/lessonApi.ts                        — API call for lesson content generation (non-streaming JSON)
src/lib/audioPlayer.ts                      — Audio playback utility (play, stop, cache)
src/lib/soundEffects.ts                     — Play correct/wrong/levelup/badge sounds
src/components/lesson/VideoIntro.tsx         — Video intro screen with YouTube player
src/components/lesson/ConceptCard.tsx        — Single concept card (visual + text + Next)
src/components/lesson/CardFlow.tsx           — Card sequence manager (progress dots, transitions)
src/components/lesson/QuizCard.tsx           — Full-screen quiz with 3-attempt hints
src/components/lesson/QuizTransition.tsx     — "Quiz time!" transition screen
src/components/lesson/TopicComplete.tsx      — Achievement screen (summary, XP, badges)
src/components/lesson/LessonContainer.tsx    — Orchestrates full lesson flow via state machine
src/components/lesson/LessonLoading.tsx      — Loading screen while AI generates lesson content
src/components/lesson/DoubtOverlay.tsx       — Floating doubt chat (overlay modal)
src/components/gamification/XPPopup.tsx      — Animated "+20 XP" popup
src/components/gamification/LevelUpModal.tsx — Level up celebration modal
src/components/gamification/BadgeUnlock.tsx  — Badge earned popup
src/components/gamification/StreakCounter.tsx — Fire streak display
src/components/gamification/ConfettiEffect.tsx — Confetti animation
src/components/voice/VoiceToggle.tsx         — Speaker on/off toggle button
src/components/voice/VoiceRecordButton.tsx   — Hold-to-record mic button
src/components/voice/RecordingIndicator.tsx  — Pulsing red dot while recording
src/components/upload/PhotoUpload.tsx        — Camera/gallery upload UI
src/components/diagrams/GeometryDiagram.tsx  — Programmatic SVG engine (replaces 11 files)
netlify/functions/chat-vision.mts           — Claude Vision API proxy
netlify/functions/tts.mts                   — OpenAI TTS API proxy
netlify/functions/stt.mts                   — OpenAI Whisper API proxy
public/sounds/correct.mp3                   — Correct answer chime
public/sounds/wrong.mp3                     — Wrong answer sound
public/sounds/topic-complete.mp3            — Celebration fanfare
public/sounds/level-up.mp3                  — Level up sound
public/sounds/badge-earned.mp3              — Badge unlock sound
public/sounds/streak.mp3                    — Streak fire sound
public/sounds/tap.mp3                       — Card advance tap
```

### Modified Files

```
src/lib/api.ts                              — Add sendMessageWithRetry wrapper
src/lib/parseAIResponse.ts                  — Fix quiz parser to support A-F options
src/components/layout/AppLayout.tsx          — Render LessonContainer instead of ChatInterface
src/components/layout/ProgressPanel.tsx      — Add gamification stats (XP, level, streak, badges)
src/components/chat/ChatInput.tsx            — Add mic and photo upload buttons for doubt chat
src/components/rich/DiagramRenderer.tsx      — Switch to GeometryDiagram engine
src/data/systemPrompt.ts                    — Keep for backward compat, add doubt chat prompt
src/contexts/ProgressContext.tsx             — Integrate with gamification
src/App.tsx                                 — Add LessonProvider, GamificationProvider
package.json                                — Add openai dependency
```

### Files to Remove (after Phase 5 diagram engine migration)

```
src/components/diagrams/Parallelogram.tsx
src/components/diagrams/Rhombus.tsx
src/components/diagrams/Rectangle.tsx
src/components/diagrams/Square.tsx
src/components/diagrams/Kite.tsx
src/components/diagrams/Trapezium.tsx
src/components/diagrams/GenericQuadrilateral.tsx
src/components/diagrams/DiagonalDemo.tsx
src/components/diagrams/PolygonIntro.tsx
src/components/diagrams/AngleSum.tsx
src/components/diagrams/QuadrilateralFamily.tsx
```

---

# Phase 1: Foundation

## Task 1: API Retry with Exponential Backoff

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: Add `sendMessageWithRetry` to `src/lib/api.ts`**

Add this function after the existing `sendMessage` function:

```typescript
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendMessageWithRetry(
  params: SendMessageParams,
  maxRetries = 3
): Promise<void> {
  const { onError, ...rest } = params;
  let lastError = '';

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    let succeeded = false;
    let attemptError = '';

    await sendMessage({
      ...rest,
      onError: (error) => {
        attemptError = error;
      },
      onDone: (fullText) => {
        succeeded = true;
        params.onDone(fullText);
      },
      onChunk: params.onChunk,
    });

    if (succeeded) return;

    lastError = attemptError;
    if (attempt < maxRetries - 1) {
      await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s
    }
  }

  onError(`${lastError} (after ${maxRetries} retries)`);
}
```

- [ ] **Step 2: Update `useChat.ts` to use `sendMessageWithRetry`**

In `src/hooks/useChat.ts`, change the import:

```typescript
import { sendMessageWithRetry, formatMessagesForAPI } from '../lib/api';
```

Replace both calls to `sendMessage(` with `sendMessageWithRetry(` (in `selectTopic` and `sendUserMessage`). No other changes needed since the function signature is compatible.

- [ ] **Step 3: Verify the app still loads and chat works**

Run: `npm run dev`
Open browser, enter name, select a topic, confirm AI responds. Also test by temporarily breaking the API URL to see retry behavior in network tab.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api.ts src/hooks/useChat.ts
git commit -m "feat: add API retry with exponential backoff (3 retries: 1s, 2s, 4s)"
```

---

## Task 2: Fix Quiz Parser to Support A-F Options

**Files:**
- Modify: `src/lib/parseAIResponse.ts`

- [ ] **Step 1: Update the option regex in `parseQuizBlock`**

In `src/lib/parseAIResponse.ts`, in the `parseQuizBlock` function, change line 18:

```typescript
// Old:
const optionMatches = raw.match(/^[A-D]\)\s*.+$/gm);

// New:
const optionMatches = raw.match(/^[A-F]\)\s*.+$/gm);
```

- [ ] **Step 2: Add validation for quiz block parsing**

In the same function, after `options` assignment, add validation before the return:

```typescript
  if (quizType === 'mcq') {
    const optionMatches = raw.match(/^[A-F]\)\s*.+$/gm);
    if (!optionMatches || optionMatches.length < 2) {
      // Not enough options for a valid MCQ — skip
      return null;
    }
    options = optionMatches.map(o => o.replace(/^[A-F]\)\s*/, '').trim());

    // Validate that the answer letter corresponds to an existing option
    const answerIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, ...
    if (answerIndex < 0 || answerIndex >= options.length) {
      console.warn(`Quiz answer "${correctAnswer}" doesn't match options (${options.length} options)`);
      return null;
    }
  }
```

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: No TypeScript or build errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/parseAIResponse.ts
git commit -m "fix: quiz parser supports A-F options with validation"
```

---

## Task 3: Lesson Types

**Files:**
- Create: `src/types/lesson.ts`

- [ ] **Step 1: Create `src/types/lesson.ts`**

```typescript
// Lesson template types — define the structure AI fills with content

export interface ConceptCardTemplate {
  id: string;
  type: 'hook' | 'concept' | 'formula' | 'example';
  subConcept: string;
  diagramConfig?: DiagramConfig;
}

export interface DiagramConfig {
  shape: string;
  highlight?: string;
  showLabels?: boolean;
  showAngles?: boolean;
  showDiagonals?: boolean;
}

export interface QuizTemplate {
  id: string;
  subConcept: string;
  type: 'mcq' | 'type-in';
  maxAttempts: 3;
}

export interface LessonTemplate {
  topicId: string;
  videoId: string;
  cards: ConceptCardTemplate[];
  quizzes: QuizTemplate[];
  summary: { keyPointCount: number };
}

// AI-generated content that fills the template

export interface GeneratedCard {
  id: string;
  type: 'hook' | 'concept' | 'formula' | 'example';
  text: string;
  diagramConfig?: DiagramConfig;
}

export interface GeneratedQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string; // "A", "B", "C", or "D"
  hints: string[];
  explanation: string;
}

export interface GeneratedLesson {
  cards: GeneratedCard[];
  quizzes: GeneratedQuiz[];
  summary: { keyPoints: string[] };
}

// Lesson state machine

export type LessonPhase =
  | 'TOPIC_INTRO'
  | 'VIDEO_PLAYING'
  | 'CONCEPT_CARDS'
  | 'QUIZ_TRANSITION'
  | 'QUIZ_CARDS'
  | 'TOPIC_COMPLETE';

export interface QuizAttemptState {
  quizIndex: number;
  attempts: number;
  disabledOptions: string[]; // option letters already tried wrong
  showingHint: boolean;
  showingAnswer: boolean;
  earnedXP: number;
}

export interface LessonState {
  topicId: string | null;
  phase: LessonPhase;
  lesson: GeneratedLesson | null;
  template: LessonTemplate | null;
  currentCardIndex: number;
  currentQuizIndex: number;
  quizAttempt: QuizAttemptState;
  isLoading: boolean;
  error: string | null;
}

export type LessonAction =
  | { type: 'START_TOPIC'; payload: { topicId: string; template: LessonTemplate } }
  | { type: 'LESSON_LOADED'; payload: { lesson: GeneratedLesson } }
  | { type: 'LESSON_ERROR'; payload: { error: string } }
  | { type: 'SKIP_VIDEO' }
  | { type: 'FINISH_VIDEO' }
  | { type: 'NEXT_CARD' }
  | { type: 'START_QUIZ' }
  | { type: 'SUBMIT_QUIZ_ANSWER'; payload: { selectedOption: string; isCorrect: boolean } }
  | { type: 'RETRY_QUIZ' }
  | { type: 'NEXT_QUIZ' }
  | { type: 'COMPLETE_TOPIC' }
  | { type: 'RESET_LESSON' };
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: No errors (file is only types, imported by nothing yet).

- [ ] **Step 3: Commit**

```bash
git add src/types/lesson.ts
git commit -m "feat: add lesson types (templates, generated content, state machine)"
```

---

## Task 4: Gamification Types

**Files:**
- Create: `src/types/gamification.ts`

- [ ] **Step 1: Create `src/types/gamification.ts`**

```typescript
export interface LevelDefinition {
  level: number;
  xpRequired: number;
  title: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: BadgeCheckStats) => boolean;
}

export interface BadgeCheckStats {
  completedTopics: string[];
  totalDoubtsAsked: number;
  currentStreak: number;
  longestStreak: number;
  // per-topic quiz performance: topicId -> { total, firstAttemptCorrect }
  quizPerformance: Record<string, { total: number; firstAttemptCorrect: number }>;
  topicCompletionTimes: Record<string, number>; // topicId -> seconds
}

export interface GamificationState {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // "YYYY-MM-DD"
  badges: string[]; // badge IDs
  badgeTimestamps: Record<string, number>;
  totalDoubtsAsked: number;
  quizPerformance: Record<string, { total: number; firstAttemptCorrect: number }>;
  topicStartTimes: Record<string, number>;
  topicCompletionTimes: Record<string, number>;
  soundEnabled: boolean;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/types/gamification.ts
git commit -m "feat: add gamification types (XP, levels, badges, streaks)"
```

---

## Task 5: Level and Badge Definitions

**Files:**
- Create: `src/data/levelDefinitions.ts`
- Create: `src/data/badgeDefinitions.ts`

- [ ] **Step 1: Create `src/data/levelDefinitions.ts`**

```typescript
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
```

- [ ] **Step 2: Create `src/data/badgeDefinitions.ts`**

```typescript
import type { BadgeDefinition } from '../types/gamification';

// The 7 quadrilateral type topic IDs
const quadTypeTopics = [
  'quadrilateral-basics', 'parallelogram', 'rhombus',
  'rectangle', 'square', 'kite', 'trapezium',
];

// All 11 topic IDs in the chapter
const allTopics = [
  'polygons-basics', 'angle-sum-property',
  ...quadTypeTopics,
  'diagonal-properties', 'quadrilateral-family',
];

export const badges: BadgeDefinition[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Complete your first topic',
    icon: '🎯',
    condition: (stats) => stats.completedTopics.length >= 1,
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get all quizzes right in a topic on first attempt',
    icon: '⭐',
    condition: (stats) => {
      return Object.values(stats.quizPerformance).some(
        p => p.total >= 2 && p.firstAttemptCorrect === p.total
      );
    },
  },
  {
    id: 'streak-3',
    name: '3-Day Streak',
    description: 'Maintain a 3-day learning streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3 || stats.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥🔥',
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7,
  },
  {
    id: 'shape-master',
    name: 'Shape Master',
    description: 'Complete all 7 quadrilateral type topics',
    icon: '📐',
    condition: (stats) => quadTypeTopics.every(t => stats.completedTopics.includes(t)),
  },
  {
    id: 'chapter-champion',
    name: 'Chapter Champion',
    description: 'Complete all 11 topics in Chapter 3',
    icon: '🏆',
    condition: (stats) => allTopics.every(t => stats.completedTopics.includes(t)),
  },
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete a topic in under 5 minutes',
    icon: '⚡',
    condition: (stats) => {
      return Object.values(stats.topicCompletionTimes).some(t => t < 300);
    },
  },
  {
    id: 'curious-mind',
    name: 'Curious Mind',
    description: 'Ask 10 doubts via chat',
    icon: '💬',
    condition: (stats) => stats.totalDoubtsAsked >= 10,
  },
];
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/data/levelDefinitions.ts src/data/badgeDefinitions.ts
git commit -m "feat: add level thresholds and badge definitions"
```

---

## Task 6: Lesson Templates for All 11 Topics

**Files:**
- Create: `src/data/lessonTemplates.ts`

- [ ] **Step 1: Create `src/data/lessonTemplates.ts`**

```typescript
import type { LessonTemplate } from '../types/lesson';

export const lessonTemplates: Record<string, LessonTemplate> = {
  'polygons-basics': {
    topicId: 'polygons-basics',
    videoId: 'JPrc70c7OqM',
    cards: [
      { id: 'poly-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'poly-definition', type: 'concept', subConcept: 'polygon-definition', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
      { id: 'poly-convex-concave', type: 'concept', subConcept: 'convex-vs-concave' },
      { id: 'poly-regular', type: 'concept', subConcept: 'regular-vs-irregular' },
      { id: 'poly-classification', type: 'concept', subConcept: 'classification-by-sides', diagramConfig: { shape: 'polygon-intro', showLabels: true } },
    ],
    quizzes: [
      { id: 'poly-quiz-1', subConcept: 'polygon-definition', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-2', subConcept: 'convex-vs-concave', type: 'mcq', maxAttempts: 3 },
      { id: 'poly-quiz-3', subConcept: 'classification-by-sides', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'angle-sum-property': {
    topicId: 'angle-sum-property',
    videoId: '0QhGHIV61XA',
    cards: [
      { id: 'angle-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'angle-triangle', type: 'concept', subConcept: 'triangle-angle-sum' },
      { id: 'angle-formula', type: 'formula', subConcept: 'n-minus-2-formula', diagramConfig: { shape: 'angle-sum', showLabels: true, showAngles: true } },
      { id: 'angle-exterior', type: 'concept', subConcept: 'exterior-angles-sum-360' },
      { id: 'angle-regular', type: 'concept', subConcept: 'regular-polygon-each-angle' },
    ],
    quizzes: [
      { id: 'angle-quiz-1', subConcept: 'n-minus-2-formula', type: 'mcq', maxAttempts: 3 },
      { id: 'angle-quiz-2', subConcept: 'exterior-angles-sum-360', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'quadrilateral-basics': {
    topicId: 'quadrilateral-basics',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'quad-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'quad-angle-sum', type: 'concept', subConcept: 'angle-sum-360', diagramConfig: { shape: 'generic-quadrilateral', showLabels: true, showAngles: true } },
      { id: 'quad-exterior', type: 'concept', subConcept: 'exterior-angles' },
      { id: 'quad-diagonals', type: 'concept', subConcept: 'diagonals-intro', diagramConfig: { shape: 'generic-quadrilateral', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'quad-quiz-1', subConcept: 'angle-sum-360', type: 'mcq', maxAttempts: 3 },
      { id: 'quad-quiz-2', subConcept: 'diagonals-intro', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },

  'parallelogram': {
    topicId: 'parallelogram',
    videoId: 'DzXiWgT_hpE',
    cards: [
      { id: 'para-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'para-sides', type: 'concept', subConcept: 'opposite-sides-equal-parallel', diagramConfig: { shape: 'parallelogram', highlight: 'opposite-sides', showLabels: true } },
      { id: 'para-angles', type: 'concept', subConcept: 'opposite-angles-equal', diagramConfig: { shape: 'parallelogram', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'para-consecutive', type: 'concept', subConcept: 'consecutive-angles-supplementary', diagramConfig: { shape: 'parallelogram', highlight: 'consecutive-angles', showAngles: true } },
      { id: 'para-diagonals', type: 'concept', subConcept: 'diagonals-bisect', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'para-quiz-1', subConcept: 'opposite-sides-equal-parallel', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-2', subConcept: 'opposite-angles-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'para-quiz-3', subConcept: 'diagonals-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'rhombus': {
    topicId: 'rhombus',
    videoId: 'UYbpWzasIHg',
    cards: [
      { id: 'rhom-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'rhom-sides', type: 'concept', subConcept: 'all-sides-equal', diagramConfig: { shape: 'rhombus', highlight: 'all-sides', showLabels: true } },
      { id: 'rhom-parallelogram', type: 'concept', subConcept: 'is-a-parallelogram', diagramConfig: { shape: 'rhombus', highlight: 'opposite-sides', showLabels: true } },
      { id: 'rhom-diagonals', type: 'concept', subConcept: 'diagonals-bisect-at-90', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'rhom-quiz-1', subConcept: 'all-sides-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'rhom-quiz-2', subConcept: 'diagonals-bisect-at-90', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'rectangle': {
    topicId: 'rectangle',
    videoId: 'I_z7fDIh-SU',
    cards: [
      { id: 'rect-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'rect-angles', type: 'concept', subConcept: 'all-angles-90', diagramConfig: { shape: 'rectangle', highlight: 'right-angles', showLabels: true, showAngles: true } },
      { id: 'rect-parallelogram', type: 'concept', subConcept: 'is-a-parallelogram', diagramConfig: { shape: 'rectangle', highlight: 'opposite-sides', showLabels: true } },
      { id: 'rect-diagonals', type: 'concept', subConcept: 'diagonals-equal-bisect', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
    ],
    quizzes: [
      { id: 'rect-quiz-1', subConcept: 'all-angles-90', type: 'mcq', maxAttempts: 3 },
      { id: 'rect-quiz-2', subConcept: 'diagonals-equal-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },

  'square': {
    topicId: 'square',
    videoId: '3hlk2ds74fM',
    cards: [
      { id: 'sq-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'sq-definition', type: 'concept', subConcept: 'all-sides-equal-all-angles-90', diagramConfig: { shape: 'square', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'sq-both', type: 'concept', subConcept: 'rectangle-plus-rhombus', diagramConfig: { shape: 'square', showLabels: true } },
      { id: 'sq-diagonals', type: 'concept', subConcept: 'diagonals-equal-perpendicular-bisect', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'sq-quiz-1', subConcept: 'all-sides-equal-all-angles-90', type: 'mcq', maxAttempts: 3 },
      { id: 'sq-quiz-2', subConcept: 'rectangle-plus-rhombus', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'kite': {
    topicId: 'kite',
    videoId: '5qSeSwNA0QM',
    cards: [
      { id: 'kite-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'kite-sides', type: 'concept', subConcept: 'two-pairs-consecutive-equal', diagramConfig: { shape: 'kite', highlight: 'all-sides', showLabels: true } },
      { id: 'kite-angles', type: 'concept', subConcept: 'one-pair-opposite-angles-equal', diagramConfig: { shape: 'kite', highlight: 'angles', showLabels: true, showAngles: true } },
      { id: 'kite-diagonals', type: 'concept', subConcept: 'diagonal-perpendicular-bisect', diagramConfig: { shape: 'kite', highlight: 'diagonals', showDiagonals: true } },
    ],
    quizzes: [
      { id: 'kite-quiz-1', subConcept: 'two-pairs-consecutive-equal', type: 'mcq', maxAttempts: 3 },
      { id: 'kite-quiz-2', subConcept: 'diagonal-perpendicular-bisect', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },

  'trapezium': {
    topicId: 'trapezium',
    videoId: 'JYWIg5jtP-4',
    cards: [
      { id: 'trap-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'trap-definition', type: 'concept', subConcept: 'one-pair-parallel-sides', diagramConfig: { shape: 'trapezium', highlight: 'parallel-marks', showLabels: true } },
      { id: 'trap-isosceles', type: 'concept', subConcept: 'isosceles-trapezium', diagramConfig: { shape: 'trapezium', highlight: 'all-sides', showLabels: true, showAngles: true } },
      { id: 'trap-not-parallelogram', type: 'concept', subConcept: 'not-a-parallelogram' },
    ],
    quizzes: [
      { id: 'trap-quiz-1', subConcept: 'one-pair-parallel-sides', type: 'mcq', maxAttempts: 3 },
      { id: 'trap-quiz-2', subConcept: 'isosceles-trapezium', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },

  'diagonal-properties': {
    topicId: 'diagonal-properties',
    videoId: 'CNO3vHQGkBA',
    cards: [
      { id: 'diag-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'diag-parallelogram', type: 'concept', subConcept: 'parallelogram-diagonals-bisect', diagramConfig: { shape: 'parallelogram', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-rhombus', type: 'concept', subConcept: 'rhombus-diagonals-perpendicular', diagramConfig: { shape: 'rhombus', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
      { id: 'diag-rectangle', type: 'concept', subConcept: 'rectangle-diagonals-equal', diagramConfig: { shape: 'rectangle', highlight: 'diagonals', showDiagonals: true, showLabels: true } },
      { id: 'diag-square', type: 'concept', subConcept: 'square-diagonals-all-properties', diagramConfig: { shape: 'square', highlight: 'diagonals', showDiagonals: true, showAngles: true } },
    ],
    quizzes: [
      { id: 'diag-quiz-1', subConcept: 'parallelogram-diagonals-bisect', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-2', subConcept: 'rhombus-diagonals-perpendicular', type: 'mcq', maxAttempts: 3 },
      { id: 'diag-quiz-3', subConcept: 'rectangle-diagonals-equal', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 4 },
  },

  'quadrilateral-family': {
    topicId: 'quadrilateral-family',
    videoId: 'NLzElLjzvBg',
    cards: [
      { id: 'fam-hook', type: 'hook', subConcept: 'introduction' },
      { id: 'fam-hierarchy', type: 'concept', subConcept: 'family-tree-overview', diagramConfig: { shape: 'quadrilateral-family', showLabels: true } },
      { id: 'fam-square-special', type: 'concept', subConcept: 'square-is-everything' },
      { id: 'fam-relationships', type: 'concept', subConcept: 'every-square-is-rectangle-rhombus' },
    ],
    quizzes: [
      { id: 'fam-quiz-1', subConcept: 'family-tree-overview', type: 'mcq', maxAttempts: 3 },
      { id: 'fam-quiz-2', subConcept: 'every-square-is-rectangle-rhombus', type: 'mcq', maxAttempts: 3 },
    ],
    summary: { keyPointCount: 3 },
  },
};

export function getTemplate(topicId: string): LessonTemplate | null {
  return lessonTemplates[topicId] ?? null;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/data/lessonTemplates.ts
git commit -m "feat: add lesson templates for all 11 topics"
```

---

## Task 7: LessonContext with State Machine

**Files:**
- Create: `src/contexts/LessonContext.tsx`

- [ ] **Step 1: Create `src/contexts/LessonContext.tsx`**

```typescript
import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { LessonState, LessonAction, QuizAttemptState } from '../types/lesson';

const initialQuizAttempt: QuizAttemptState = {
  quizIndex: 0,
  attempts: 0,
  disabledOptions: [],
  showingHint: false,
  showingAnswer: false,
  earnedXP: 0,
};

const initialState: LessonState = {
  topicId: null,
  phase: 'TOPIC_INTRO',
  lesson: null,
  template: null,
  currentCardIndex: 0,
  currentQuizIndex: 0,
  quizAttempt: initialQuizAttempt,
  isLoading: false,
  error: null,
};

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'START_TOPIC':
      return {
        ...initialState,
        topicId: action.payload.topicId,
        template: action.payload.template,
        phase: 'TOPIC_INTRO',
        isLoading: true,
      };

    case 'LESSON_LOADED':
      return {
        ...state,
        lesson: action.payload.lesson,
        isLoading: false,
        error: null,
      };

    case 'LESSON_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case 'SKIP_VIDEO':
    case 'FINISH_VIDEO':
      return {
        ...state,
        phase: 'CONCEPT_CARDS',
        currentCardIndex: 0,
      };

    case 'NEXT_CARD': {
      const totalCards = state.lesson?.cards.length ?? 0;
      const nextIndex = state.currentCardIndex + 1;
      if (nextIndex >= totalCards) {
        return { ...state, phase: 'QUIZ_TRANSITION' };
      }
      return { ...state, currentCardIndex: nextIndex };
    }

    case 'START_QUIZ':
      return {
        ...state,
        phase: 'QUIZ_CARDS',
        currentQuizIndex: 0,
        quizAttempt: { ...initialQuizAttempt, quizIndex: 0 },
      };

    case 'SUBMIT_QUIZ_ANSWER': {
      const newAttempts = state.quizAttempt.attempts + 1;
      if (action.payload.isCorrect) {
        let xp = 0;
        if (newAttempts === 1) xp = 20;
        else if (newAttempts === 2) xp = 10;
        else if (newAttempts === 3) xp = 5;
        return {
          ...state,
          quizAttempt: {
            ...state.quizAttempt,
            attempts: newAttempts,
            showingAnswer: true,
            earnedXP: xp,
          },
        };
      }
      // Wrong answer
      const newDisabled = [...state.quizAttempt.disabledOptions, action.payload.selectedOption];
      if (newAttempts >= 3) {
        // Reveal answer after 3 wrong
        return {
          ...state,
          quizAttempt: {
            ...state.quizAttempt,
            attempts: newAttempts,
            disabledOptions: newDisabled,
            showingAnswer: true,
            earnedXP: 0,
          },
        };
      }
      return {
        ...state,
        quizAttempt: {
          ...state.quizAttempt,
          attempts: newAttempts,
          disabledOptions: newDisabled,
          showingHint: true,
        },
      };
    }

    case 'RETRY_QUIZ':
      return {
        ...state,
        quizAttempt: {
          ...state.quizAttempt,
          showingHint: false,
        },
      };

    case 'NEXT_QUIZ': {
      const totalQuizzes = state.lesson?.quizzes.length ?? 0;
      const nextQuizIndex = state.currentQuizIndex + 1;
      if (nextQuizIndex >= totalQuizzes) {
        return { ...state, phase: 'TOPIC_COMPLETE' };
      }
      return {
        ...state,
        currentQuizIndex: nextQuizIndex,
        quizAttempt: { ...initialQuizAttempt, quizIndex: nextQuizIndex },
      };
    }

    case 'COMPLETE_TOPIC':
      return { ...state, phase: 'TOPIC_COMPLETE' };

    case 'RESET_LESSON':
      return initialState;

    default:
      return state;
  }
}

interface LessonContextValue {
  state: LessonState;
  dispatch: Dispatch<LessonAction>;
}

const LessonContext = createContext<LessonContextValue | null>(null);

export function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonReducer, initialState);
  return (
    <LessonContext.Provider value={{ state, dispatch }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessonContext() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error('useLessonContext must be inside LessonProvider');
  return ctx;
}
```

- [ ] **Step 2: Wire `LessonProvider` into `App.tsx`**

In `src/App.tsx`, add the import and wrap the `ProgressProvider`:

```typescript
import { LessonProvider } from './contexts/LessonContext';
```

Update the `/learn` route element:

```tsx
<ProtectedRoute>
  <ChatProvider>
    <ProgressProvider>
      <LessonProvider>
        <AppLayout />
      </LessonProvider>
    </ProgressProvider>
  </ChatProvider>
</ProtectedRoute>
```

- [ ] **Step 3: Verify build and app loads**

Run: `npm run build && npm run dev`
Confirm app loads without errors.

- [ ] **Step 4: Commit**

```bash
git add src/contexts/LessonContext.tsx src/App.tsx
git commit -m "feat: add LessonContext with full state machine (INTRO→VIDEO→CARDS→QUIZ→COMPLETE)"
```

---

## Task 8: Lesson Prompts for AI Content Generation

**Files:**
- Create: `src/data/lessonPrompts.ts`

- [ ] **Step 1: Create `src/data/lessonPrompts.ts`**

```typescript
import type { LessonTemplate } from '../types/lesson';

export function buildLessonGenerationPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  const cardDescriptions = template.cards.map((c, i) => {
    return `- Card ${i + 1} (${c.type}): ${c.subConcept}`;
  }).join('\n');

  const quizDescriptions = template.quizzes.map((q, i) => {
    return `- Quiz ${i + 1}: Test "${q.subConcept}" (MCQ, 4 options, 2 hints)`;
  }).join('\n');

  const system = `You are PadhAI's lesson content generator. Generate personalized lesson content based on the template provided.

RULES:
- All text MUST be in Hinglish (natural mix of Hindi and English, the way Indian students talk)
- Each card text must be 1-2 sentences maximum
- Be warm, use real-life examples Indian students relate to (cricket, rangoli, doors, kites, Makar Sankranti)
- Address the student as "${studentName}"
- For hook cards: use a relatable real-life analogy to introduce the concept
- For concept cards: explain one sub-concept clearly and concisely
- For formula cards: present the formula with a simple explanation
- For quizzes: create questions that test understanding, not memorization
- Each quiz must have exactly 4 options (A, B, C, D)
- Each quiz must have exactly 2 hints that progressively guide toward the answer (Socratic style)
- Hints should NOT give the answer directly — they should make the student think
- The explanation should be a clear, concise explanation of why the answer is correct

Return ONLY valid JSON. No markdown code fences. No extra text.`;

  const user = `Generate lesson content for student "${studentName}" on topic "${topicTitle}".

Template:
${cardDescriptions}
${quizDescriptions}
- Summary: ${template.summary.keyPointCount} key points

Return this exact JSON structure:
{
  "cards": [
    { "id": "card-id", "type": "hook|concept|formula|example", "text": "Hinglish text here" }
  ],
  "quizzes": [
    {
      "id": "quiz-id",
      "question": "Question in Hinglish?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "B",
      "hints": ["First hint", "Second hint"],
      "explanation": "Explanation in Hinglish"
    }
  ],
  "summary": {
    "keyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}

Use the card IDs from the template: ${template.cards.map(c => c.id).join(', ')}
Use the quiz IDs from the template: ${template.quizzes.map(q => q.id).join(', ')}`;

  return { system, user };
}

export function buildDoubtChatPrompt(studentName: string, topicTitle: string): string {
  return `You are PadhAI, a warm and patient AI math tutor for Indian students. The student "${studentName}" is asking a doubt about "${topicTitle}".

RULES:
- Respond in Hinglish (natural Hindi-English mix)
- Keep answers SHORT — 2-3 sentences max
- For math problems: GUIDE, never give direct answers. Ask the student to think step by step.
- Be warm and encouraging
- Use emojis sparingly: ✨ 🎯 💡 ✅
- If the student shares an image of a math problem, help them solve it step-by-step without giving the answer

NCERT Class 8, Chapter 3: Understanding Quadrilaterals content is your domain.`;
}

export function buildVisionPrompt(studentName: string, topicTitle: string): string {
  return `You are PadhAI, a warm AI math tutor. Student "${studentName}" is studying "${topicTitle}" and has uploaded an image.

RULES:
- Respond in Hinglish (natural Hindi-English mix)

When analyzing the image:
- If it's a TEXTBOOK PAGE or DIAGRAM: explain what's shown in simple Hinglish, break into digestible points, relate to current topic
- If it's a MATH PROBLEM (printed or handwritten): DO NOT solve it directly. Guide step-by-step:
  1. Ask them to identify what's given
  2. Ask which formula/concept applies
  3. Guide them through each step
  4. Let them arrive at the answer
  Only reveal the answer if they're stuck after 3+ attempts
- If the IMAGE IS UNCLEAR: politely ask for a clearer photo`;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/data/lessonPrompts.ts
git commit -m "feat: add AI prompt templates for lesson generation, doubt chat, and vision"
```

---

## Task 9: Lesson API (Non-Streaming JSON Call)

**Files:**
- Create: `src/lib/lessonApi.ts`

- [ ] **Step 1: Create `src/lib/lessonApi.ts`**

```typescript
import type { LessonTemplate, GeneratedLesson } from '../types/lesson';
import { buildLessonGenerationPrompt } from '../data/lessonPrompts';

export async function generateLessonContent(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): Promise<GeneratedLesson> {
  const { system, user } = buildLessonGenerationPrompt(studentName, topicTitle, template);

  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: user }],
      systemPrompt: system,
      jsonMode: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Lesson generation failed: ${response.status}`);
  }

  // Read the full SSE stream to get the complete response
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content') {
            fullText += parsed.text;
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message);
          }
        } catch (e) {
          if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e;
        }
      }
    }
  }

  // Strip markdown code fences if AI wraps the JSON
  let jsonText = fullText.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const lesson: GeneratedLesson = JSON.parse(jsonText);

  // Merge diagramConfig from template into generated cards
  lesson.cards = lesson.cards.map((card, i) => ({
    ...card,
    diagramConfig: template.cards[i]?.diagramConfig ?? card.diagramConfig,
  }));

  return lesson;
}
```

- [ ] **Step 2: Update `netlify/functions/chat.mts` to support higher max_tokens**

In `netlify/functions/chat.mts`, change the `max_tokens` to support lesson generation. Update the `stream` call:

```typescript
    const maxTokens = messages.length === 1 && systemPrompt.includes('lesson content generator') ? 2048 : 1024;

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/lib/lessonApi.ts netlify/functions/chat.mts
git commit -m "feat: add lesson API for generating structured lesson content via Claude"
```

---

# Phase 2: Core Lesson UI

## Task 10: ConceptCard Component

**Files:**
- Create: `src/components/lesson/ConceptCard.tsx`

- [ ] **Step 1: Create `src/components/lesson/ConceptCard.tsx`**

```tsx
import type { GeneratedCard } from '../../types/lesson';
import DiagramRenderer from '../rich/DiagramRenderer';
import { ArrowRight } from 'lucide-react';

interface Props {
  card: GeneratedCard;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
}

export default function ConceptCard({ card, onNext, cardNumber, totalCards }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 py-3">
        {Array.from({ length: totalCards }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < cardNumber ? 'bg-brand-600' : i === cardNumber ? 'bg-brand-400' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Card content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 max-w-lg mx-auto w-full">
        {/* Diagram */}
        {card.diagramConfig && (
          <div className="w-full mb-6">
            <DiagramRenderer diagramId={card.diagramConfig.shape} />
          </div>
        )}

        {/* Text */}
        <p className="text-lg text-gray-800 text-center leading-relaxed mb-8">
          {card.text}
        </p>
      </div>

      {/* Next button */}
      <div className="p-4 flex justify-center">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          Next
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/ConceptCard.tsx
git commit -m "feat: add ConceptCard component (visual + text + Next button + progress dots)"
```

---

## Task 11: CardFlow Component

**Files:**
- Create: `src/components/lesson/CardFlow.tsx`

- [ ] **Step 1: Create `src/components/lesson/CardFlow.tsx`**

```tsx
import { useState, useEffect } from 'react';
import type { GeneratedCard } from '../../types/lesson';
import ConceptCard from './ConceptCard';

interface Props {
  cards: GeneratedCard[];
  currentIndex: number;
  onNext: () => void;
}

export default function CardFlow({ cards, currentIndex, onNext }: Props) {
  const [animating, setAnimating] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex !== displayIndex) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayIndex(currentIndex);
        setAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, displayIndex]);

  const card = cards[displayIndex];
  if (!card) return null;

  return (
    <div className={`h-full transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      <ConceptCard
        card={card}
        onNext={onNext}
        cardNumber={displayIndex}
        totalCards={cards.length}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/CardFlow.tsx
git commit -m "feat: add CardFlow component (card sequence with fade transitions)"
```

---

## Task 12: QuizTransition Screen

**Files:**
- Create: `src/components/lesson/QuizTransition.tsx`

- [ ] **Step 1: Create `src/components/lesson/QuizTransition.tsx`**

```tsx
import { Target } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export default function QuizTransition({ onStart }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <Target size={48} className="text-brand-600 mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Time!</h2>
      <p className="text-gray-500 text-center mb-8">
        Ab dekhte hain kitna yaad raha!
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
      >
        Start Quiz →
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lesson/QuizTransition.tsx
git commit -m "feat: add QuizTransition screen"
```

---

## Task 13: QuizCard Component with Progressive Hints

**Files:**
- Create: `src/components/lesson/QuizCard.tsx`

- [ ] **Step 1: Create `src/components/lesson/QuizCard.tsx`**

```tsx
import type { GeneratedQuiz, QuizAttemptState } from '../../types/lesson';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  quiz: GeneratedQuiz;
  attemptState: QuizAttemptState;
  quizNumber: number;
  totalQuizzes: number;
  onSelectAnswer: (option: string) => void;
  onRetry: () => void;
  onNext: () => void;
}

export default function QuizCard({
  quiz,
  attemptState,
  quizNumber,
  totalQuizzes,
  onSelectAnswer,
  onRetry,
  onNext,
}: Props) {
  const { attempts, disabledOptions, showingHint, showingAnswer, earnedXP } = attemptState;
  const isCorrect = showingAnswer && earnedXP > 0;
  const isRevealed = showingAnswer && earnedXP === 0 && attempts >= 3;

  // Hearts display (3 - wrong attempts)
  const wrongAttempts = disabledOptions.length;
  const hearts = 3 - wrongAttempts;

  return (
    <div className="h-full flex flex-col">
      {/* Header: quiz count + hearts */}
      <div className="flex items-center justify-between px-6 py-3">
        <span className="text-sm text-gray-500 font-medium">
          Quiz {quizNumber + 1}/{totalQuizzes}
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span key={i} className={`text-lg ${i < hearts ? 'text-red-500' : 'text-gray-200'}`}>
              ❤
            </span>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full">
        {/* Showing hint */}
        {showingHint && !showingAnswer && (
          <div className="w-full mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={20} className="text-red-400" />
                <span className="font-medium text-gray-700">
                  {attempts === 1 ? 'Yeh nahi hai!' : 'Ek aur try!'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb size={18} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">
                  {quiz.hints[Math.min(attempts - 1, quiz.hints.length - 1)]}
                </p>
              </div>
            </div>
            <button
              onClick={onRetry}
              className="w-full mt-4 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              Try Again →
            </button>
          </div>
        )}

        {/* Correct answer celebration */}
        {isCorrect && (
          <div className="w-full mb-6 text-center">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-700 mb-1">Sahi Jawab!</h3>
              <p className="text-green-600 font-medium mb-2">+{earnedXP} XP ✨</p>
              <p className="text-sm text-gray-600">{quiz.explanation}</p>
            </div>
            <button
              onClick={onNext}
              className="mt-4 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              Next <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        )}

        {/* Revealed answer (after 3 wrong) */}
        {isRevealed && (
          <div className="w-full mb-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <Lightbulb size={32} className="text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Answer: {quiz.options[quiz.correctAnswer.charCodeAt(0) - 65]}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{quiz.explanation}</p>
              <p className="text-xs text-gray-400">No XP for this question</p>
            </div>
            <button
              onClick={onNext}
              className="mt-4 px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              Next <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        )}

        {/* Question + options (when not showing hint/answer) */}
        {!showingHint && !showingAnswer && (
          <>
            <h3 className="text-lg font-medium text-gray-800 text-center mb-6">
              {quiz.question}
            </h3>
            <div className="w-full space-y-3">
              {quiz.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isDisabled = disabledOptions.includes(letter);
                return (
                  <button
                    key={letter}
                    onClick={() => !isDisabled && onSelectAnswer(letter)}
                    disabled={isDisabled}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-700'
                    }`}
                  >
                    <span className={`font-medium mr-2 ${isDisabled ? 'text-gray-300' : 'text-brand-600'}`}>
                      {letter})
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/QuizCard.tsx
git commit -m "feat: add QuizCard with 3-attempt progressive hints and dimmed wrong answers"
```

---

## Task 14: TopicComplete Screen

**Files:**
- Create: `src/components/lesson/TopicComplete.tsx`

- [ ] **Step 1: Create `src/components/lesson/TopicComplete.tsx`**

```tsx
import type { GeneratedLesson } from '../../types/lesson';
import { Trophy, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

interface Props {
  topicTitle: string;
  lesson: GeneratedLesson;
  totalXP: number;
  quizScore: { correct: number; total: number };
  onNextTopic: () => void;
  nextTopicTitle: string | null;
  onOpenDoubt: () => void;
}

export default function TopicComplete({
  topicTitle,
  lesson,
  totalXP,
  quizScore,
  onNextTopic,
  nextTopicTitle,
  onOpenDoubt,
}: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 overflow-y-auto">
      <div className="max-w-md w-full py-8">
        {/* Trophy */}
        <div className="text-center mb-6">
          <Trophy size={48} className="text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Topic Complete!</h2>
          <p className="text-gray-500 mt-1">{topicTitle}</p>
        </div>

        {/* Key points summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          {lesson.summary.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">{point}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-600">+{totalXP}</p>
            <p className="text-xs text-gray-500">XP Earned</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{quizScore.correct}/{quizScore.total}</p>
            <p className="text-xs text-gray-500">Quiz Score</p>
          </div>
        </div>

        {/* Doubt button */}
        <button
          onClick={onOpenDoubt}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors mb-4"
        >
          <MessageCircle size={18} />
          Have doubts? Ask AI
        </button>

        {/* Next topic */}
        {nextTopicTitle && (
          <button
            onClick={onNextTopic}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Next: {nextTopicTitle}
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/TopicComplete.tsx
git commit -m "feat: add TopicComplete achievement screen (summary, XP, quiz score, next topic)"
```

---

## Task 15: LessonLoading Component

**Files:**
- Create: `src/components/lesson/LessonLoading.tsx`

- [ ] **Step 1: Create `src/components/lesson/LessonLoading.tsx`**

```tsx
import { Loader2 } from 'lucide-react';

interface Props {
  topicTitle: string;
}

export default function LessonLoading({ topicTitle }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <Loader2 size={40} className="text-brand-600 animate-spin mb-4" />
      <h2 className="text-lg font-medium text-gray-800 mb-1">Preparing your lesson...</h2>
      <p className="text-sm text-gray-500">{topicTitle}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lesson/LessonLoading.tsx
git commit -m "feat: add LessonLoading component"
```

---

# Phase 3: Video + Lesson Flow Integration

## Task 16: VideoIntro Component

**Files:**
- Create: `src/components/lesson/VideoIntro.tsx`

- [ ] **Step 1: Create `src/components/lesson/VideoIntro.tsx`**

```tsx
import { useState } from 'react';
import { Play, SkipForward } from 'lucide-react';

interface Props {
  topicTitle: string;
  videoId: string;
  onSkip: () => void;
  onFinish: () => void;
}

export default function VideoIntro({ topicTitle, videoId, onSkip, onFinish }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="h-full flex flex-col items-center justify-center px-6">
      <div className="max-w-lg w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{topicTitle}</h2>
        <p className="text-gray-500 text-center mb-6">Watch a quick intro video before we start!</p>

        {/* Video area */}
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-6">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={topicTitle}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                alt={topicTitle}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                  <Play size={28} className="text-brand-600 ml-1" />
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={playing ? onFinish : () => setPlaying(true)}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            <Play size={18} />
            {playing ? 'Start Learning →' : 'Watch Video'}
          </button>
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <SkipForward size={18} />
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/VideoIntro.tsx
git commit -m "feat: add VideoIntro screen with YouTube player and skip button"
```

---

## Task 17: DoubtOverlay Component

**Files:**
- Create: `src/components/lesson/DoubtOverlay.tsx`

- [ ] **Step 1: Create `src/components/lesson/DoubtOverlay.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { sendMessageWithRetry } from '../../lib/api';
import { buildDoubtChatPrompt } from '../../data/lessonPrompts';
import { useUser } from '../../contexts/UserContext';

interface DoubtMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  topicId: string;
}

export default function DoubtOverlay({ isOpen, onClose, topicTitle, topicId }: Props) {
  const { name } = useUser();
  const [messages, setMessages] = useState<DoubtMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);
    setStreamingContent('');

    const systemPrompt = buildDoubtChatPrompt(name, topicTitle);
    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

    sendMessageWithRetry({
      messages: apiMessages,
      systemPrompt,
      onChunk: (chunk) => setStreamingContent(prev => prev + chunk),
      onDone: (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      onError: (error) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full sm:max-w-md h-[70vh] sm:h-[500px] bg-white rounded-t-2xl sm:rounded-2xl flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Ask PadhAI</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-4">
              Kuch bhi poocho about {topicTitle}!
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-3 py-2 rounded-xl text-sm bg-gray-100 text-gray-800">
                {streamingContent}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type your doubt..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400"
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isStreaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add src/components/lesson/DoubtOverlay.tsx
git commit -m "feat: add DoubtOverlay component for topic-aware doubt chat"
```

---

## Task 18: LessonContainer — Orchestrates Full Lesson Flow

**Files:**
- Create: `src/components/lesson/LessonContainer.tsx`
- Create: `src/hooks/useLesson.ts`

- [ ] **Step 1: Create `src/hooks/useLesson.ts`**

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { useLessonContext } from '../contexts/LessonContext';
import { useUser } from '../contexts/UserContext';
import { useProgress } from '../contexts/ProgressContext';
import { getTemplate } from '../data/lessonTemplates';
import { getTopicById, getNextTopicId } from '../data/curriculum';
import { generateLessonContent } from '../lib/lessonApi';
import type { LessonTemplate } from '../types/lesson';

export function useLesson() {
  const { state, dispatch } = useLessonContext();
  const { name } = useUser();
  const { markTopicStarted, markTopicCompleted } = useProgress();
  const loadingRef = useRef(false);

  const startTopic = useCallback(async (topicId: string) => {
    const template = getTemplate(topicId);
    if (!template) return;

    dispatch({ type: 'START_TOPIC', payload: { topicId, template } });
    markTopicStarted(topicId);

    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const topicInfo = getTopicById(topicId);
      const topicTitle = topicInfo?.topic.title ?? topicId;
      const lesson = await generateLessonContent(name, topicTitle, template);
      dispatch({ type: 'LESSON_LOADED', payload: { lesson } });
    } catch (error) {
      dispatch({
        type: 'LESSON_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Failed to generate lesson' },
      });
    } finally {
      loadingRef.current = false;
    }
  }, [dispatch, name, markTopicStarted]);

  const skipVideo = useCallback(() => dispatch({ type: 'SKIP_VIDEO' }), [dispatch]);
  const finishVideo = useCallback(() => dispatch({ type: 'FINISH_VIDEO' }), [dispatch]);
  const nextCard = useCallback(() => dispatch({ type: 'NEXT_CARD' }), [dispatch]);
  const startQuiz = useCallback(() => dispatch({ type: 'START_QUIZ' }), [dispatch]);

  const submitQuizAnswer = useCallback((selectedOption: string) => {
    if (!state.lesson) return;
    const quiz = state.lesson.quizzes[state.currentQuizIndex];
    if (!quiz) return;
    const isCorrect = selectedOption === quiz.correctAnswer;
    dispatch({ type: 'SUBMIT_QUIZ_ANSWER', payload: { selectedOption, isCorrect } });
  }, [dispatch, state.lesson, state.currentQuizIndex]);

  const retryQuiz = useCallback(() => dispatch({ type: 'RETRY_QUIZ' }), [dispatch]);
  const nextQuiz = useCallback(() => dispatch({ type: 'NEXT_QUIZ' }), [dispatch]);

  const completeTopic = useCallback(() => {
    if (state.topicId) {
      markTopicCompleted(state.topicId);
    }
    dispatch({ type: 'COMPLETE_TOPIC' });
  }, [dispatch, state.topicId, markTopicCompleted]);

  const resetLesson = useCallback(() => dispatch({ type: 'RESET_LESSON' }), [dispatch]);

  const nextTopicId = state.topicId ? getNextTopicId(state.topicId) : null;
  const nextTopicTitle = nextTopicId ? getTopicById(nextTopicId)?.topic.title ?? null : null;

  return {
    state,
    startTopic,
    skipVideo,
    finishVideo,
    nextCard,
    startQuiz,
    submitQuizAnswer,
    retryQuiz,
    nextQuiz,
    completeTopic,
    resetLesson,
    nextTopicId,
    nextTopicTitle,
  };
}
```

- [ ] **Step 2: Create `src/components/lesson/LessonContainer.tsx`**

```tsx
import { useState, useMemo } from 'react';
import { useLesson } from '../../hooks/useLesson';
import { getTopicById } from '../../data/curriculum';
import { MessageCircle } from 'lucide-react';
import VideoIntro from './VideoIntro';
import CardFlow from './CardFlow';
import QuizTransition from './QuizTransition';
import QuizCard from './QuizCard';
import TopicComplete from './TopicComplete';
import LessonLoading from './LessonLoading';
import DoubtOverlay from './DoubtOverlay';

export default function LessonContainer() {
  const {
    state,
    skipVideo,
    finishVideo,
    nextCard,
    startQuiz,
    submitQuizAnswer,
    retryQuiz,
    nextQuiz,
    startTopic,
    nextTopicId,
    nextTopicTitle,
  } = useLesson();

  const [doubtOpen, setDoubtOpen] = useState(false);

  const topicTitle = useMemo(
    () => state.topicId ? getTopicById(state.topicId)?.topic.title ?? '' : '',
    [state.topicId]
  );

  // Calculate quiz XP earned so far
  const quizXPEarned = useMemo(() => {
    if (!state.lesson) return { totalXP: 0, correct: 0, total: 0 };
    // Sum up XP from all answered quizzes
    // We track this in the component since the reducer handles per-quiz state
    return { totalXP: 0, correct: 0, total: state.lesson.quizzes.length };
  }, [state.lesson]);

  if (!state.topicId) {
    return (
      <div className="h-full flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
          <p className="text-gray-500">Select a topic from the sidebar to start learning.</p>
        </div>
      </div>
    );
  }

  if (state.isLoading || !state.lesson) {
    return <LessonLoading topicTitle={topicTitle} />;
  }

  if (state.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <p className="text-red-500 mb-4">{state.error}</p>
        <button
          onClick={() => state.topicId && startTopic(state.topicId)}
          className="px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Phase-based rendering */}
      {state.phase === 'TOPIC_INTRO' && state.template && (
        <VideoIntro
          topicTitle={topicTitle}
          videoId={state.template.videoId}
          onSkip={skipVideo}
          onFinish={finishVideo}
        />
      )}

      {state.phase === 'CONCEPT_CARDS' && state.lesson && (
        <CardFlow
          cards={state.lesson.cards}
          currentIndex={state.currentCardIndex}
          onNext={nextCard}
        />
      )}

      {state.phase === 'QUIZ_TRANSITION' && (
        <QuizTransition onStart={startQuiz} />
      )}

      {state.phase === 'QUIZ_CARDS' && state.lesson && (
        <QuizCard
          quiz={state.lesson.quizzes[state.currentQuizIndex]}
          attemptState={state.quizAttempt}
          quizNumber={state.currentQuizIndex}
          totalQuizzes={state.lesson.quizzes.length}
          onSelectAnswer={submitQuizAnswer}
          onRetry={retryQuiz}
          onNext={nextQuiz}
        />
      )}

      {state.phase === 'TOPIC_COMPLETE' && state.lesson && (
        <TopicComplete
          topicTitle={topicTitle}
          lesson={state.lesson}
          totalXP={quizXPEarned.totalXP}
          quizScore={quizXPEarned}
          onNextTopic={() => nextTopicId && startTopic(nextTopicId)}
          nextTopicTitle={nextTopicTitle}
          onOpenDoubt={() => setDoubtOpen(true)}
        />
      )}

      {/* Floating doubt button (visible during cards and quiz phases) */}
      {['CONCEPT_CARDS', 'QUIZ_CARDS', 'VIDEO_PLAYING'].includes(state.phase) && (
        <button
          onClick={() => setDoubtOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-brand-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-700 transition-colors z-40"
          title="Ask a doubt"
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Doubt overlay */}
      <DoubtOverlay
        isOpen={doubtOpen}
        onClose={() => setDoubtOpen(false)}
        topicTitle={topicTitle}
        topicId={state.topicId}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLesson.ts src/components/lesson/LessonContainer.tsx
git commit -m "feat: add LessonContainer and useLesson hook (orchestrates full lesson flow)"
```

---

## Task 19: Wire LessonContainer into AppLayout

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`

- [ ] **Step 1: Update AppLayout to render LessonContainer**

In `src/components/layout/AppLayout.tsx`:

1. Add imports at the top:
```typescript
import LessonContainer from '../lesson/LessonContainer';
import { useLesson } from '../../hooks/useLesson';
import { getTemplate } from '../../data/lessonTemplates';
```

2. Inside the `AppLayout` component, add after the existing hook calls:
```typescript
const { state: lessonState, startTopic: startLessonTopic } = useLesson();
const isLessonMode = lessonState.topicId !== null;
```

3. Update `selectTopic` handler — when user picks a topic from sidebar, start lesson mode if a template exists:
```typescript
const handleSelectTopic = useCallback((topicId: string) => {
  const template = getTemplate(topicId);
  if (template) {
    startLessonTopic(topicId);
  } else {
    selectTopic(topicId);
  }
}, [selectTopic, startLessonTopic]);
```

4. Replace all `onSelectTopic={selectTopic}` with `onSelectTopic={handleSelectTopic}` (in both CurriculumSidebar instances).

5. Replace the `<main>` content — swap ChatInterface for LessonContainer when in lesson mode:

```tsx
<main className="flex-1 min-w-0 overflow-hidden">
  {isLessonMode ? (
    <LessonContainer />
  ) : (
    <ChatInterface
      messages={messages}
      isStreaming={isStreaming}
      streamingContent={streamingContent}
      onSend={sendUserMessage}
      currentTopicId={currentTopicId}
      onSelectTopic={handleSelectTopic}
      onTopicComplete={handleTopicComplete}
      onNextTopic={handleNextTopic}
      nextTopicTitle={nextTopicTitle}
      isTopicCompleted={isCurrentTopicCompleted}
    />
  )}
</main>
```

- [ ] **Step 2: Verify app loads and lesson flow starts when a topic is selected**

Run: `npm run dev`
Open browser, enter name, click a topic → should see "Preparing your lesson..." loading, then concept cards appear.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AppLayout.tsx
git commit -m "feat: wire LessonContainer into AppLayout (lesson mode replaces chat)"
```

---

# Phase 4: Gamification + Sound

## Task 20: Sound Effects Files

**Files:**
- Create: `public/sounds/` directory with MP3 files
- Create: `src/data/soundMap.ts`

- [ ] **Step 1: Generate simple sound effect files**

Use Web Audio API to generate simple tones as MP3 placeholders. Run these commands to create small placeholder audio files (we'll replace with proper sounds later):

```bash
mkdir -p public/sounds
# Create minimal valid MP3 files using ffmpeg (generate tones)
ffmpeg -f lavfi -i "sine=frequency=880:duration=0.3" -ac 1 -ar 22050 -b:a 32k public/sounds/correct.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=330:duration=0.3" -ac 1 -ar 22050 -b:a 32k public/sounds/wrong.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=660:duration=0.5" -ac 1 -ar 22050 -b:a 32k public/sounds/tap.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=1200:duration=0.8" -ac 1 -ar 22050 -b:a 32k public/sounds/topic-complete.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=1000:duration=0.6" -ac 1 -ar 22050 -b:a 32k public/sounds/level-up.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=900:duration=0.5" -ac 1 -ar 22050 -b:a 32k public/sounds/badge-earned.mp3 -y 2>/dev/null
ffmpeg -f lavfi -i "sine=frequency=500:duration=0.4" -ac 1 -ar 22050 -b:a 32k public/sounds/streak.mp3 -y 2>/dev/null
```

If `ffmpeg` is not available, create silence MP3s or skip this step and create them manually later.

- [ ] **Step 2: Create `src/data/soundMap.ts`**

```typescript
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
```

- [ ] **Step 3: Create `src/lib/soundEffects.ts`**

```typescript
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
  audio.play().catch(() => {
    // Browser may block autoplay — ignore
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add public/sounds/ src/data/soundMap.ts src/lib/soundEffects.ts
git commit -m "feat: add sound effects system with placeholder audio files"
```

---

## Task 21: GamificationContext

**Files:**
- Create: `src/contexts/GamificationContext.tsx`

- [ ] **Step 1: Create `src/contexts/GamificationContext.tsx`**

```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GamificationState, BadgeCheckStats } from '../types/gamification';
import { getItem, setItem } from '../lib/storage';
import { getLevelForXP } from '../data/levelDefinitions';
import { badges } from '../data/badgeDefinitions';
import { useProgress } from './ProgressContext';

const STORAGE_KEY = 'gamification';

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

const defaultState: GamificationState = {
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  badges: [],
  badgeTimestamps: {},
  totalDoubtsAsked: 0,
  quizPerformance: {},
  topicStartTimes: {},
  topicCompletionTimes: {},
  soundEnabled: true,
};

interface GamificationContextValue {
  gamification: GamificationState;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  updateStreak: () => boolean; // returns true if streak maintained/started
  recordQuizAttempt: (topicId: string, firstAttemptCorrect: boolean) => void;
  recordTopicStart: (topicId: string) => void;
  recordTopicComplete: (topicId: string) => void;
  incrementDoubts: () => void;
  checkAndAwardBadges: (completedTopics: string[]) => string[]; // returns newly awarded badge IDs
  toggleSound: () => void;
  resetGamification: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [gamification, setGamification] = useState<GamificationState>(() =>
    getItem<GamificationState>(STORAGE_KEY, defaultState)
  );

  const persist = (updated: GamificationState) => {
    setGamification(updated);
    setItem(STORAGE_KEY, updated);
  };

  const addXP = useCallback((amount: number) => {
    let leveledUp = false;
    let newLevel = 0;
    setGamification(prev => {
      const oldLevel = getLevelForXP(prev.xp).level;
      const updated = { ...prev, xp: prev.xp + amount };
      newLevel = getLevelForXP(updated.xp).level;
      leveledUp = newLevel > oldLevel;
      persist(updated);
      return updated;
    });
    return { leveledUp, newLevel };
  }, []);

  const updateStreak = useCallback(() => {
    let streakMaintained = false;
    setGamification(prev => {
      const today = todayString();
      if (prev.lastActiveDate === today) return prev; // already counted today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let newStreak = 1;
      if (prev.lastActiveDate === yesterdayStr) {
        newStreak = prev.currentStreak + 1;
        streakMaintained = true;
      }

      const updated = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastActiveDate: today,
      };
      persist(updated);
      return updated;
    });
    return streakMaintained;
  }, []);

  const recordQuizAttempt = useCallback((topicId: string, firstAttemptCorrect: boolean) => {
    setGamification(prev => {
      const existing = prev.quizPerformance[topicId] ?? { total: 0, firstAttemptCorrect: 0 };
      const updated = {
        ...prev,
        quizPerformance: {
          ...prev.quizPerformance,
          [topicId]: {
            total: existing.total + 1,
            firstAttemptCorrect: existing.firstAttemptCorrect + (firstAttemptCorrect ? 1 : 0),
          },
        },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const recordTopicStart = useCallback((topicId: string) => {
    setGamification(prev => {
      const updated = {
        ...prev,
        topicStartTimes: { ...prev.topicStartTimes, [topicId]: Date.now() },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const recordTopicComplete = useCallback((topicId: string) => {
    setGamification(prev => {
      const startTime = prev.topicStartTimes[topicId] ?? Date.now();
      const seconds = Math.round((Date.now() - startTime) / 1000);
      const updated = {
        ...prev,
        topicCompletionTimes: { ...prev.topicCompletionTimes, [topicId]: seconds },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const incrementDoubts = useCallback(() => {
    setGamification(prev => {
      const updated = { ...prev, totalDoubtsAsked: prev.totalDoubtsAsked + 1 };
      persist(updated);
      return updated;
    });
  }, []);

  const checkAndAwardBadges = useCallback((completedTopics: string[]) => {
    const newBadges: string[] = [];
    setGamification(prev => {
      const stats: BadgeCheckStats = {
        completedTopics,
        totalDoubtsAsked: prev.totalDoubtsAsked,
        currentStreak: prev.currentStreak,
        longestStreak: prev.longestStreak,
        quizPerformance: prev.quizPerformance,
        topicCompletionTimes: prev.topicCompletionTimes,
      };

      const awardedIds = [...prev.badges];
      const timestamps = { ...prev.badgeTimestamps };

      for (const badge of badges) {
        if (!awardedIds.includes(badge.id) && badge.condition(stats)) {
          awardedIds.push(badge.id);
          timestamps[badge.id] = Date.now();
          newBadges.push(badge.id);
        }
      }

      if (newBadges.length === 0) return prev;

      const updated = { ...prev, badges: awardedIds, badgeTimestamps: timestamps };
      persist(updated);
      return updated;
    });
    return newBadges;
  }, []);

  const toggleSound = useCallback(() => {
    setGamification(prev => {
      const updated = { ...prev, soundEnabled: !prev.soundEnabled };
      persist(updated);
      return updated;
    });
  }, []);

  const resetGamification = useCallback(() => {
    persist(defaultState);
  }, []);

  return (
    <GamificationContext.Provider
      value={{
        gamification,
        addXP,
        updateStreak,
        recordQuizAttempt,
        recordTopicStart,
        recordTopicComplete,
        incrementDoubts,
        checkAndAwardBadges,
        toggleSound,
        resetGamification,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be inside GamificationProvider');
  return ctx;
}
```

- [ ] **Step 2: Wire GamificationProvider into App.tsx**

In `src/App.tsx`, add import and wrap:

```typescript
import { GamificationProvider } from './contexts/GamificationContext';
```

Update the `/learn` route:

```tsx
<ProtectedRoute>
  <ChatProvider>
    <ProgressProvider>
      <GamificationProvider>
        <LessonProvider>
          <AppLayout />
        </LessonProvider>
      </GamificationProvider>
    </ProgressProvider>
  </ChatProvider>
</ProtectedRoute>
```

- [ ] **Step 3: Verify build and app loads**

Run: `npm run build && npm run dev`

- [ ] **Step 4: Commit**

```bash
git add src/contexts/GamificationContext.tsx src/App.tsx
git commit -m "feat: add GamificationContext (XP, streaks, levels, badges, sound toggle)"
```

---

## Task 22: Gamification UI Components

**Files:**
- Create: `src/components/gamification/XPPopup.tsx`
- Create: `src/components/gamification/ConfettiEffect.tsx`
- Create: `src/components/gamification/LevelUpModal.tsx`
- Create: `src/components/gamification/BadgeUnlock.tsx`
- Create: `src/components/gamification/StreakCounter.tsx`

- [ ] **Step 1: Create `src/components/gamification/XPPopup.tsx`**

```tsx
import { useEffect, useState } from 'react';

interface Props {
  amount: number;
  onDone: () => void;
}

export default function XPPopup({ amount, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed top-1/3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-150 -translate-y-8'
      }`}
    >
      <div className="bg-brand-600 text-white px-6 py-3 rounded-2xl shadow-lg text-xl font-bold">
        +{amount} XP ✨
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/gamification/ConfettiEffect.tsx`**

```tsx
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

export default function ConfettiEffect({ onDone }: { onDone?: () => void }) {
  const [particles] = useState<Particle[]>(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1.5,
    }));
  });

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm animate-confetti"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
```

Add the CSS animation to your global styles or Tailwind config. In `src/index.css` (or wherever global CSS is), add:

```css
@keyframes confetti {
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
.animate-confetti {
  animation: confetti linear forwards;
}
```

- [ ] **Step 3: Create `src/components/gamification/LevelUpModal.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { getLevelForXP } from '../../data/levelDefinitions';

interface Props {
  level: number;
  onDone: () => void;
}

export default function LevelUpModal({ level, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const levelDef = getLevelForXP(level * 100); // approximate

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
        <p className="text-4xl mb-3">🎉</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Level Up!</h2>
        <p className="text-3xl font-bold text-brand-600 mb-1">Level {level}</p>
        <p className="text-gray-500">{levelDef.title}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/gamification/BadgeUnlock.tsx`**

```tsx
import { useEffect, useState } from 'react';

interface Props {
  badgeName: string;
  badgeIcon: string;
  onDone: () => void;
}

export default function BadgeUnlock({ badgeName, badgeIcon, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={() => { setVisible(false); setTimeout(onDone, 300); }} />
      <div className="relative bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm mx-4">
        <p className="text-5xl mb-3">{badgeIcon}</p>
        <h2 className="text-xl font-bold text-gray-800 mb-1">New Badge!</h2>
        <p className="text-lg text-brand-600 font-medium">{badgeName}</p>
        <button
          onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
          className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/gamification/StreakCounter.tsx`**

```tsx
interface Props {
  streak: number;
}

export default function StreakCounter({ streak }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg ${streak > 0 ? 'animate-pulse' : ''}`}>
        🔥
      </span>
      <span className="font-bold text-gray-800">{streak}</span>
      <span className="text-xs text-gray-500">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`

- [ ] **Step 7: Commit**

```bash
git add src/components/gamification/ src/index.css
git commit -m "feat: add gamification UI components (XPPopup, Confetti, LevelUp, BadgeUnlock, StreakCounter)"
```

---

## Task 23: Update ProgressPanel with Gamification Stats

**Files:**
- Modify: `src/components/layout/ProgressPanel.tsx`

- [ ] **Step 1: Update ProgressPanel to show gamification stats**

Rewrite the top section of `ProgressPanel` to include XP, level, streak, and badges. Add these imports:

```typescript
import { useGamification } from '../../contexts/GamificationContext';
import { getLevelForXP, getXPProgressToNextLevel } from '../../data/levelDefinitions';
import { badges as badgeDefs } from '../../data/badgeDefinitions';
import { Star, Flame, Award, Volume2, VolumeX } from 'lucide-react';
import StreakCounter from '../gamification/StreakCounter';
```

Add the gamification hook call inside the component:

```typescript
const { gamification, toggleSound } = useGamification();
const currentLevel = getLevelForXP(gamification.xp);
const xpProgress = getXPProgressToNextLevel(gamification.xp);
const earnedBadges = badgeDefs.filter(b => gamification.badges.includes(b.id));
```

Add new stat cards after the existing ones (before the "Keep Going!" section):

```tsx
{/* XP & Level */}
<StatCard
  icon={<Star size={20} className="text-brand-500" />}
  label={`Level ${currentLevel.level} — ${currentLevel.title}`}
  value={`${gamification.xp} XP`}
  progress={xpProgress.percent}
  color="blue"
  subtext={`${xpProgress.current}/${xpProgress.needed} to next level`}
/>

{/* Streak */}
<div className="bg-gray-50 rounded-xl p-4">
  <div className="flex items-center justify-between">
    <StreakCounter streak={gamification.currentStreak} />
    <span className="text-xs text-gray-400">Best: {gamification.longestStreak}</span>
  </div>
</div>

{/* Badges */}
{earnedBadges.length > 0 && (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Award size={20} className="text-purple-500" />
      <span className="text-sm text-gray-500">Badges ({earnedBadges.length})</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {earnedBadges.map(b => (
        <span key={b.id} className="text-2xl" title={b.name}>{b.icon}</span>
      ))}
    </div>
  </div>
)}

{/* Sound toggle */}
<button
  onClick={toggleSound}
  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full rounded-lg hover:bg-gray-50"
>
  {gamification.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
  Sound: {gamification.soundEnabled ? 'On' : 'Off'}
</button>
```

- [ ] **Step 2: Verify build and visually check**

Run: `npm run dev`
Check Progress panel shows XP, level, streak, badges, and sound toggle.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/ProgressPanel.tsx
git commit -m "feat: update ProgressPanel with XP, level, streak, badges, and sound toggle"
```

---

## Task 24: Wire Gamification into Lesson Flow

**Files:**
- Modify: `src/hooks/useLesson.ts`
- Modify: `src/components/lesson/LessonContainer.tsx`

- [ ] **Step 1: Add gamification calls to `useLesson.ts`**

Add import:
```typescript
import { useGamification } from '../contexts/GamificationContext';
```

Inside `useLesson`, add:
```typescript
const {
  addXP,
  updateStreak,
  recordQuizAttempt,
  recordTopicStart,
  recordTopicComplete,
  checkAndAwardBadges,
  gamification,
} = useGamification();
```

Update `startTopic`:
```typescript
// After dispatch({ type: 'START_TOPIC', ... }):
recordTopicStart(topicId);
updateStreak();
```

Add `addXP(5)` call when `nextCard` is called (card XP). Update `nextCard`:
```typescript
const nextCard = useCallback(() => {
  addXP(5); // +5 XP per concept card
  dispatch({ type: 'NEXT_CARD' });
}, [dispatch, addXP]);
```

Update `completeTopic` to record topic completion and check badges:
```typescript
const completeTopic = useCallback((completedTopicsList: string[]) => {
  if (state.topicId) {
    markTopicCompleted(state.topicId);
    recordTopicComplete(state.topicId);
    addXP(50); // +50 XP topic completion bonus
    checkAndAwardBadges(completedTopicsList);
  }
  dispatch({ type: 'COMPLETE_TOPIC' });
}, [dispatch, state.topicId, markTopicCompleted, recordTopicComplete, addXP, checkAndAwardBadges]);
```

Return `gamification` from the hook for components to access.

- [ ] **Step 2: Update LessonContainer to add XP on quiz answers and play sounds**

In `src/components/lesson/LessonContainer.tsx`, import sound effects:

```typescript
import { playSound } from '../../lib/soundEffects';
import { useGamification } from '../../contexts/GamificationContext';
```

Add inside the component:
```typescript
const { gamification } = useGamification();
```

Add a wrapper for `submitQuizAnswer` that plays sounds:
```typescript
const handleSubmitQuizAnswer = (option: string) => {
  submitQuizAnswer(option);
  // Sound is played based on outcome — we check after state updates
};
```

After quiz answer feedback shows, play appropriate sound. Use an effect:
```typescript
useEffect(() => {
  if (!gamification.soundEnabled) return;
  if (state.quizAttempt.showingAnswer && state.quizAttempt.earnedXP > 0) {
    playSound('correct');
  } else if (state.quizAttempt.showingHint) {
    playSound('wrong');
  }
}, [state.quizAttempt.showingAnswer, state.quizAttempt.showingHint, gamification.soundEnabled]);
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLesson.ts src/components/lesson/LessonContainer.tsx
git commit -m "feat: wire gamification into lesson flow (XP, streaks, sounds, badges)"
```

---

# Phase 5: Voice, Vision & Polish

## Task 25: TTS Netlify Function

**Files:**
- Create: `netlify/functions/tts.mts`
- Modify: `package.json` (add `openai` dependency)

- [ ] **Step 1: Install OpenAI SDK**

```bash
npm install openai
```

- [ ] **Step 2: Create `netlify/functions/tts.mts`**

```typescript
import OpenAI from 'openai';
import type { Context } from '@netlify/functions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { text, voice } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response('Bad request: text required', { status: 400 });
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice ?? 'shimmer',
      input: text,
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'TTS error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add netlify/functions/tts.mts package.json package-lock.json
git commit -m "feat: add TTS Netlify function (OpenAI TTS API proxy)"
```

---

## Task 26: useVoice Hook + VoiceToggle

**Files:**
- Create: `src/hooks/useVoice.ts`
- Create: `src/components/voice/VoiceToggle.tsx`
- Create: `src/lib/audioPlayer.ts`

- [ ] **Step 1: Create `src/lib/audioPlayer.ts`**

```typescript
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

  // Stop any currently playing audio
  stopAudio();

  const blob = new Blob([buffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  currentAudio = new Audio(url);

  return new Promise((resolve, reject) => {
    if (!currentAudio) return resolve();
    currentAudio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    currentAudio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Audio playback failed'));
    };
    currentAudio.play().catch(reject);
  });
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function clearAudioCache(): void {
  audioCache.clear();
}
```

- [ ] **Step 2: Create `src/hooks/useVoice.ts`**

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchAndPlayTTS, stopAudio, clearAudioCache } from '../lib/audioPlayer';
import { getItem, setItem } from '../lib/storage';

export function useVoice() {
  const [voiceEnabled, setVoiceEnabled] = useState(() => getItem<boolean>('voice_enabled', true));
  const [isPlaying, setIsPlaying] = useState(false);
  const cancelRef = useRef(false);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      const next = !prev;
      setItem('voice_enabled', next);
      if (!next) stopAudio();
      return next;
    });
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled || !text.trim()) return;
    cancelRef.current = false;
    setIsPlaying(true);
    try {
      await fetchAndPlayTTS(text);
    } catch {
      // TTS failed silently — don't break the lesson flow
    } finally {
      if (!cancelRef.current) setIsPlaying(false);
    }
  }, [voiceEnabled]);

  const stop = useCallback(() => {
    cancelRef.current = true;
    stopAudio();
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      stopAudio();
      clearAudioCache();
    };
  }, []);

  return { voiceEnabled, toggleVoice, speak, stop, isPlaying };
}
```

- [ ] **Step 3: Create `src/components/voice/VoiceToggle.tsx`**

```tsx
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
  enabled: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}

export default function VoiceToggle({ enabled, isPlaying, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-colors ${
        enabled ? 'text-brand-600 hover:bg-brand-50' : 'text-gray-400 hover:bg-gray-100'
      }`}
      title={enabled ? 'Voice On' : 'Voice Off'}
    >
      {enabled ? (
        <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} />
      ) : (
        <VolumeX size={20} />
      )}
    </button>
  );
}
```

- [ ] **Step 4: Wire voice into ConceptCard — auto-speak card text**

In `src/components/lesson/ConceptCard.tsx`, add voice prop and auto-play:

```typescript
import { useEffect } from 'react';
```

Add prop:
```typescript
interface Props {
  card: GeneratedCard;
  onNext: () => void;
  cardNumber: number;
  totalCards: number;
  onSpeak?: (text: string) => void;
}
```

Add effect in component body:
```typescript
useEffect(() => {
  if (onSpeak) onSpeak(card.text);
}, [card.text, onSpeak]);
```

Update `CardFlow` and `LessonContainer` to pass `speak` through.

- [ ] **Step 5: Verify build**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/lib/audioPlayer.ts src/hooks/useVoice.ts src/components/voice/VoiceToggle.tsx src/components/lesson/ConceptCard.tsx
git commit -m "feat: add TTS voice system (useVoice hook, VoiceToggle, auto-speak on concept cards)"
```

---

## Task 27: STT Netlify Function + useVoiceInput

**Files:**
- Create: `netlify/functions/stt.mts`
- Create: `src/hooks/useVoiceInput.ts`
- Create: `src/components/voice/VoiceRecordButton.tsx`
- Create: `src/components/voice/RecordingIndicator.tsx`

- [ ] **Step 1: Create `netlify/functions/stt.mts`**

```typescript
import OpenAI from 'openai';
import type { Context } from '@netlify/functions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return new Response('Bad request: audio file required', { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language: 'hi',
      response_format: 'json',
    });

    return new Response(JSON.stringify({ text: transcription.text }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'STT error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 2: Create `src/hooks/useVoiceInput.ts`**

```typescript
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

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setInputState('recording');
    } catch {
      alert('Mic access needed. Please allow in browser settings.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state !== 'recording') {
        resolve('');
        return;
      }

      recorder.onstop = async () => {
        setInputState('processing');
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        recorder.stream.getTracks().forEach(t => t.stop());

        try {
          const formData = new FormData();
          formData.append('audio', blob, 'recording.webm');

          const response = await fetch('/.netlify/functions/stt', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('STT failed');
          const { text } = await response.json();
          setInputState('idle');
          resolve(text ?? '');
        } catch {
          setInputState('idle');
          resolve('');
        }
      };

      recorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === 'recording') {
      recorder.stream.getTracks().forEach(t => t.stop());
      recorder.stop();
    }
    setInputState('idle');
  }, []);

  return { inputState, startRecording, stopRecording, cancelRecording };
}
```

- [ ] **Step 3: Create `src/components/voice/VoiceRecordButton.tsx`**

```tsx
import { Mic } from 'lucide-react';

interface Props {
  state: 'idle' | 'recording' | 'processing';
  onMouseDown: () => void;
  onMouseUp: () => void;
}

export default function VoiceRecordButton({ state, onMouseDown, onMouseUp }: Props) {
  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      className={`p-2 rounded-xl transition-colors ${
        state === 'recording'
          ? 'bg-red-500 text-white animate-pulse'
          : state === 'processing'
          ? 'bg-gray-200 text-gray-400'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      disabled={state === 'processing'}
      title={state === 'recording' ? 'Release to send' : 'Hold to record'}
    >
      <Mic size={18} />
    </button>
  );
}
```

- [ ] **Step 4: Create `src/components/voice/RecordingIndicator.tsx`**

```tsx
export default function RecordingIndicator({ state }: { state: 'recording' | 'processing' }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs">
      {state === 'recording' && (
        <>
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-500">Listening...</span>
        </>
      )}
      {state === 'processing' && (
        <>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <span className="text-gray-500">Transcribing...</span>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Wire voice input into DoubtOverlay**

In `src/components/lesson/DoubtOverlay.tsx`, add imports:

```typescript
import { useVoiceInput } from '../../hooks/useVoiceInput';
import VoiceRecordButton from '../voice/VoiceRecordButton';
import RecordingIndicator from '../voice/RecordingIndicator';
```

Add inside the component:
```typescript
const { inputState, startRecording, stopRecording } = useVoiceInput();

const handleVoiceStop = async () => {
  const text = await stopRecording();
  if (text) {
    setInput(text);
    // Auto-send
    // (or let user review — for now, auto-fill input)
  }
};
```

Add next to the send button in the input bar:
```tsx
<VoiceRecordButton
  state={inputState}
  onMouseDown={startRecording}
  onMouseUp={handleVoiceStop}
/>
```

And above the input bar when recording/processing:
```tsx
{inputState !== 'idle' && <RecordingIndicator state={inputState} />}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`

- [ ] **Step 7: Commit**

```bash
git add netlify/functions/stt.mts src/hooks/useVoiceInput.ts src/components/voice/ src/components/lesson/DoubtOverlay.tsx
git commit -m "feat: add STT voice input (Whisper API, hold-to-record, auto-transcribe)"
```

---

## Task 28: Photo Upload + Claude Vision

**Files:**
- Create: `netlify/functions/chat-vision.mts`
- Create: `src/components/upload/PhotoUpload.tsx`

- [ ] **Step 1: Create `netlify/functions/chat-vision.mts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { Context } from '@netlify/functions';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, systemPrompt, image } = await req.json();

    if (!messages || !systemPrompt || !image) {
      return new Response('Bad request: messages, systemPrompt, and image required', { status: 400 });
    }

    // Build messages with image content
    const apiMessages = messages.map((m: { role: string; content: string; hasImage?: boolean }, i: number) => {
      if (m.hasImage && i === messages.length - 1) {
        return {
          role: m.role as 'user' | 'assistant',
          content: [
            {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: image.mediaType,
                data: image.data,
              },
            },
            { type: 'text' as const, text: m.content },
          ],
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    });

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          stream.on('text', (text) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`));
          });
          stream.on('error', (error) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
            controller.close();
          });
          await stream.finalMessage();
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

- [ ] **Step 2: Create `src/components/upload/PhotoUpload.tsx`**

```tsx
import { useRef } from 'react';
import { Paperclip, Camera, Image as ImageIcon } from 'lucide-react';

interface Props {
  onImageSelected: (base64: string, mediaType: string) => void;
}

export default function PhotoUpload({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:image/jpeg;base64,/9j/4AAQ..."
      const [header, data] = result.split(',');
      const mediaType = header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
      onImageSelected(data, mediaType);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
        title="Upload photo"
      >
        <Paperclip size={18} />
      </button>
    </>
  );
}
```

- [ ] **Step 3: Wire photo upload into DoubtOverlay**

In `src/components/lesson/DoubtOverlay.tsx`, add import:

```typescript
import PhotoUpload from '../upload/PhotoUpload';
import { buildVisionPrompt } from '../../data/lessonPrompts';
```

Add state for image:
```typescript
const [pendingImage, setPendingImage] = useState<{ data: string; mediaType: string } | null>(null);
```

Add image selected handler:
```typescript
const handleImageSelected = (data: string, mediaType: string) => {
  setPendingImage({ data, mediaType });
};
```

Update `handleSend` to use vision endpoint when image is present:
```typescript
const handleSend = () => {
  if ((!input.trim() && !pendingImage) || isStreaming) return;
  const userMsg = input.trim() || 'Yeh image samjha do';
  setInput('');

  const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
  setMessages(newMessages);
  setIsStreaming(true);
  setStreamingContent('');

  if (pendingImage) {
    // Use vision endpoint
    const systemPrompt = buildVisionPrompt(name, topicTitle);
    fetch('/.netlify/functions/chat-vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMessages.map((m, i) => ({
          role: m.role,
          content: m.content,
          hasImage: i === newMessages.length - 1,
        })),
        systemPrompt,
        image: pendingImage,
      }),
    }).then(async (response) => {
      // Read SSE stream (same as regular chat)
      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content') {
                fullText += parsed.text;
                setStreamingContent(fullText);
              }
            } catch {}
          }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      setStreamingContent('');
      setIsStreaming(false);
    }).catch(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing image.' }]);
      setStreamingContent('');
      setIsStreaming(false);
    });
    setPendingImage(null);
  } else {
    // Regular text chat (existing logic)
    const systemPrompt = buildDoubtChatPrompt(name, topicTitle);
    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
    sendMessageWithRetry({
      messages: apiMessages,
      systemPrompt,
      onChunk: (chunk) => setStreamingContent(prev => prev + chunk),
      onDone: (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
      onError: (error) => {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    });
  }
};
```

Add `PhotoUpload` button and image preview in the input bar area.

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add netlify/functions/chat-vision.mts src/components/upload/PhotoUpload.tsx src/components/lesson/DoubtOverlay.tsx
git commit -m "feat: add photo upload with Claude Vision (NCERT page analysis, guided problem solving)"
```

---

## Task 29: Programmatic GeometryDiagram SVG Engine

**Files:**
- Create: `src/components/diagrams/GeometryDiagram.tsx`
- Modify: `src/components/rich/DiagramRenderer.tsx`

- [ ] **Step 1: Create `src/components/diagrams/GeometryDiagram.tsx`**

```tsx
interface ShapeData {
  vertices: [number, number][];
  parallelSides?: [number, number][];
  equalSides?: [number, number][];
  rightAngles?: number[];
}

const shapes: Record<string, ShapeData> = {
  parallelogram: {
    vertices: [[80, 40], [250, 40], [220, 160], [50, 160]],
    parallelSides: [[0, 1], [3, 2]],
    equalSides: [[0, 3], [1, 2]],
  },
  rhombus: {
    vertices: [[150, 20], [270, 110], [150, 200], [30, 110]],
    parallelSides: [[0, 1], [2, 3]],
    equalSides: [[0, 1], [1, 2], [2, 3], [3, 0]],
  },
  rectangle: {
    vertices: [[50, 40], [250, 40], [250, 160], [50, 160]],
    parallelSides: [[0, 1], [3, 2]],
    equalSides: [[0, 3], [1, 2]],
    rightAngles: [0, 1, 2, 3],
  },
  square: {
    vertices: [[75, 25], [225, 25], [225, 175], [75, 175]],
    parallelSides: [[0, 1], [3, 2]],
    equalSides: [[0, 1], [1, 2], [2, 3], [3, 0]],
    rightAngles: [0, 1, 2, 3],
  },
  kite: {
    vertices: [[150, 20], [250, 100], [150, 200], [50, 100]],
    equalSides: [[0, 1], [0, 3]],
  },
  trapezium: {
    vertices: [[100, 40], [220, 40], [260, 160], [40, 160]],
    parallelSides: [[0, 1], [3, 2]],
  },
  'generic-quadrilateral': {
    vertices: [[80, 30], [240, 50], [230, 170], [60, 150]],
  },
};

const labels = ['A', 'B', 'C', 'D', 'E', 'F'];

interface Props {
  shape: string;
  highlight?: string;
  showLabels?: boolean;
  showDiagonals?: boolean;
  showAngles?: boolean;
  width?: number;
  height?: number;
}

export default function GeometryDiagram({
  shape: shapeName,
  highlight,
  showLabels = true,
  showDiagonals = false,
  showAngles = false,
  width = 300,
  height = 220,
}: Props) {
  const shape = shapes[shapeName];
  if (!shape) return null;

  const { vertices } = shape;
  const points = vertices.map(v => v.join(',')).join(' ');

  // Label offsets
  const labelOffset = (v: [number, number], center: [number, number]): [number, number] => {
    const dx = v[0] - center[0];
    const dy = v[1] - center[1];
    const dist = 18;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [v[0] + (dx / len) * dist, v[1] + (dy / len) * dist];
  };

  const center: [number, number] = [
    vertices.reduce((s, v) => s + v[0], 0) / vertices.length,
    vertices.reduce((s, v) => s + v[1], 0) / vertices.length,
  ];

  const highlightColor = '#3b82f6';
  const fillColor = '#dbeafe';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[300px]" xmlns="http://www.w3.org/2000/svg">
      {/* Shape fill */}
      <polygon points={points} fill={fillColor} stroke="#2563eb" strokeWidth="2.5" />

      {/* Highlighted sides */}
      {highlight === 'opposite-sides' && shape.parallelSides?.map(([a, b], i) => (
        <line
          key={`hl-${i}`}
          x1={vertices[a][0]} y1={vertices[a][1]}
          x2={vertices[b][0]} y2={vertices[b][1]}
          stroke={highlightColor} strokeWidth="4" opacity="0.6"
        />
      ))}

      {highlight === 'all-sides' && vertices.map((v, i) => {
        const next = vertices[(i + 1) % vertices.length];
        return (
          <line
            key={`as-${i}`}
            x1={v[0]} y1={v[1]} x2={next[0]} y2={next[1]}
            stroke={highlightColor} strokeWidth="4" opacity="0.6"
          />
        );
      })}

      {/* Parallel marks */}
      {(highlight === 'parallel-marks' || highlight === 'opposite-sides') && shape.parallelSides?.map(([a, b], pairIdx) => {
        const mid = [(vertices[a][0] + vertices[b][0]) / 2, (vertices[a][1] + vertices[b][1]) / 2];
        return (
          <g key={`pm-${pairIdx}`}>
            {Array.from({ length: pairIdx + 1 }, (_, k) => (
              <line
                key={k}
                x1={mid[0] - 4 + k * 4} y1={mid[1] - 4}
                x2={mid[0] - 4 + k * 4} y2={mid[1] + 4}
                stroke="#2563eb" strokeWidth="2"
              />
            ))}
          </g>
        );
      })}

      {/* Equal marks (tick marks) */}
      {shape.equalSides && (highlight === 'all-sides' || highlight === 'opposite-sides') && shape.equalSides.map(([a, b], i) => {
        const mid = [(vertices[a][0] + vertices[b][0]) / 2, (vertices[a][1] + vertices[b][1]) / 2];
        return (
          <line
            key={`eq-${i}`}
            x1={mid[0] - 5} y1={mid[1] - 5}
            x2={mid[0] + 5} y2={mid[1] + 5}
            stroke="#1e40af" strokeWidth="2"
          />
        );
      })}

      {/* Diagonals */}
      {showDiagonals && vertices.length >= 4 && (
        <>
          <line
            x1={vertices[0][0]} y1={vertices[0][1]}
            x2={vertices[2][0]} y2={vertices[2][1]}
            stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4"
          />
          <line
            x1={vertices[1][0]} y1={vertices[1][1]}
            x2={vertices[3][0]} y2={vertices[3][1]}
            stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4"
          />
          {/* Intersection point */}
          <circle cx={center[0]} cy={center[1]} r="3" fill="#ef4444" />
        </>
      )}

      {/* Right angle marks */}
      {showAngles && shape.rightAngles?.map(idx => {
        const v = vertices[idx];
        return (
          <rect
            key={`ra-${idx}`}
            x={v[0] + (center[0] > v[0] ? 3 : -13)}
            y={v[1] + (center[1] > v[1] ? 3 : -13)}
            width="10" height="10"
            fill="none" stroke="#1e40af" strokeWidth="1.5"
          />
        );
      })}

      {/* Labels */}
      {showLabels && vertices.map((v, i) => {
        const [lx, ly] = labelOffset(v, center);
        return (
          <text
            key={`l-${i}`}
            x={lx} y={ly}
            fontSize="14" fontWeight="bold" fill="#1e40af"
            textAnchor="middle" dominantBaseline="central"
          >
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Update `DiagramRenderer.tsx` to use GeometryDiagram as primary**

In `src/components/rich/DiagramRenderer.tsx`, add import:

```typescript
import GeometryDiagram from '../diagrams/GeometryDiagram';
```

Update the component to try `GeometryDiagram` first for quadrilateral shapes, fall back to old components for non-quadrilateral diagrams:

```typescript
const geometryShapes = ['parallelogram', 'rhombus', 'rectangle', 'square', 'kite', 'trapezium', 'generic-quadrilateral'];

export default function DiagramRenderer({ diagramId }: Props) {
  // Use new engine for supported shapes
  if (geometryShapes.includes(diagramId)) {
    return (
      <div className="my-3 flex justify-center bg-white rounded-xl p-3 border border-gray-100">
        <GeometryDiagram shape={diagramId} showLabels />
      </div>
    );
  }

  // Fall back to legacy components for polygon-intro, angle-sum, etc.
  const Diagram = diagramMap[diagramId];
  if (!Diagram) {
    return (
      <div className="my-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-400">
        Diagram not available: {diagramId}
      </div>
    );
  }

  return (
    <div className="my-3 flex justify-center bg-white rounded-xl p-3 border border-gray-100">
      <Diagram />
    </div>
  );
}
```

- [ ] **Step 3: Verify all diagram types render**

Run: `npm run dev`
Select each topic that uses a diagram. Verify the quadrilateral shapes render correctly via the new engine.

- [ ] **Step 4: Commit**

```bash
git add src/components/diagrams/GeometryDiagram.tsx src/components/rich/DiagramRenderer.tsx
git commit -m "feat: add programmatic GeometryDiagram SVG engine (replaces individual diagram files for quads)"
```

---

## Task 30: Add Confetti CSS + Final Integration Polish

**Files:**
- Modify: `src/index.css` (or global styles file)

- [ ] **Step 1: Ensure confetti animation CSS is in global styles**

Check if `src/index.css` exists and add the confetti keyframes if not already present:

```css
@keyframes confetti {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti linear forwards;
}
```

- [ ] **Step 2: Verify full end-to-end flow**

Run: `npm run dev`

Test the complete flow:
1. Enter name on landing page
2. Click a topic from sidebar
3. See loading screen → video intro
4. Skip video → concept cards appear
5. Navigate through cards with Next
6. Quiz transition screen appears
7. Answer quizzes (test correct + wrong + hints)
8. Topic complete screen shows
9. Check ProgressPanel for XP, level, streak
10. Open doubt chat via floating button
11. Test on mobile viewport (375px)

- [ ] **Step 3: Commit any polish fixes**

```bash
git add -A
git commit -m "chore: final integration polish and confetti animation CSS"
```

---

## Task 31: Verify Build + Final Check

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected: No TypeScript errors, no build errors.

- [ ] **Step 2: Run the dev server and do a manual smoke test**

```bash
npm run dev
```

Walk through:
- Landing → Dashboard → Topic selection → Video → Cards → Quiz → Complete → Next Topic
- Doubt chat overlay works from multiple screens
- ProgressPanel shows gamification stats
- Sound plays on correct/wrong (if sound files exist)

- [ ] **Step 3: Commit if any final fixes needed**

---

# Summary

| Phase | Tasks | Key Deliverables |
|-------|-------|-----------------|
| **Phase 1: Foundation** | Tasks 1-9 | Bug fixes, types, templates, LessonContext, prompts, lesson API |
| **Phase 2: Core Lesson UI** | Tasks 10-15 | ConceptCard, CardFlow, QuizCard, QuizTransition, TopicComplete, LessonLoading |
| **Phase 3: Video + Integration** | Tasks 16-19 | VideoIntro, DoubtOverlay, LessonContainer, AppLayout wiring |
| **Phase 4: Gamification** | Tasks 20-24 | Sounds, GamificationContext, XP/Level/Badge/Streak UI, ProgressPanel update, gamification in lesson flow |
| **Phase 5: Voice, Vision & Polish** | Tasks 25-31 | TTS, STT, Claude Vision, GeometryDiagram engine, photo upload, final integration |
