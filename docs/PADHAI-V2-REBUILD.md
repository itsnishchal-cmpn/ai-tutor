# PadhAI v2 — Complete Rebuild Specification

> **Date**: April 2026
> **Status**: Approved for implementation
> **Scope**: Prototype — Class 8, Chapter 3 (Understanding Quadrilaterals), 11 topics

---

## CRITICAL RULES

1. **DO NOT push to GitHub** without explicit approval from the project owner.
2. After completing all UI changes, **run Playwright tests** to verify no UI components are broken and all functionality works correctly.
3. Implement features **one by one** in the order specified. Get confirmation before moving to the next.
4. All UI text is in **English**. All AI-generated teaching content is in **Hinglish** (Hindi-English mix).

---

## Table of Contents

1. [Current State & What's Changing](#1-current-state--whats-changing)
2. [New App Flow — Complete Screen-by-Screen](#2-new-app-flow--complete-screen-by-screen)
3. [Technical Architecture](#3-technical-architecture)
4. [API & Services](#4-api--services)
5. [Gamification System](#5-gamification-system)
6. [Voice System (TTS + STT)](#6-voice-system-tts--stt)
7. [Photo Upload & AI Vision](#7-photo-upload--ai-vision)
8. [Lesson Data Structure](#8-lesson-data-structure)
9. [Programmatic SVG Diagram Engine](#9-programmatic-svg-diagram-engine)
10. [Bug Fixes](#10-bug-fixes)
11. [What's NOT in This Phase](#11-whats-not-in-this-phase)
12. [Implementation Order](#12-implementation-order)
13. [Testing Requirements](#13-testing-requirements)
14. [File Structure Changes](#14-file-structure-changes)

---

## 1. Current State & What's Changing

### What Exists (v1)
- Chat-based interface where AI teaches via text messages
- Rich content parsing: `[DIAGRAM:id]`, `[QUIZ:MCQ]`, `[VIDEO:id]`, `[SUMMARY]`, `[RESOURCES]`, `$math$`
- 11 hand-crafted SVG diagram components
- YouTube video embeds (at end of topic)
- MCQ + type-in quizzes inline in chat
- Progress tracking (topics completed, quiz scores) in localStorage
- Streaming AI responses via SSE (Netlify Functions → Claude API)
- Responsive 3-panel layout (sidebar | chat | progress)

### What's Changing (v2)

| Aspect | v1 (Current) | v2 (New) |
|--------|-------------|----------|
| **Teaching UI** | Free-form chat with long text | Duolingo-style concept cards (1-2 sentences each) |
| **Video** | YouTube embed at end of topic | Video intro at START of topic, pause-and-ask for doubts |
| **Quiz** | Inline in chat (answers visible in theory above) | Full-screen quiz cards, separate from theory |
| **Wrong answers** | Immediately shows correct answer | Progressive hints (3 attempts), Socratic approach |
| **Voice output** | None | AI speaks every card via OpenAI TTS (Hinglish) |
| **Voice input** | None | Hold spacebar/mic to speak via OpenAI Whisper |
| **Photo input** | None | Upload NCERT page or handwritten problem → Claude Vision |
| **Gamification** | Basic progress numbers | XP, streaks, levels, badges, sound effects, celebrations |
| **Diagrams** | 11 individual SVG component files | Programmatic SVG engine (one component, configurable) |
| **AI chat** | Primary interface for all learning | Secondary — only for doubts (optional after lesson) |
| **Content generation** | One big AI response per interaction | Structured: AI generates card content per lesson template |

### What Stays the Same
- React + Vite + TypeScript + Tailwind CSS
- Netlify Functions backend
- Claude API for AI (Anthropic)
- Curriculum sidebar with chapter/section/topic tree
- localStorage for persistence (prototype)
- 1 chapter, 11 topics
- Responsive layout (sidebar | main | progress)

---

## 2. New App Flow — Complete Screen-by-Screen

### Screen 1: Landing Page

**No major changes.** Existing landing page with name input.

```
┌─────────────────────────────────┐
│                                 │
│       🎓 PadhAI                │
│   Your AI Math Buddy            │
│                                 │
│   ┌───────────────────────┐     │
│   │ Your Name             │     │
│   └───────────────────────┘     │
│                                 │
│      [ Start Learning → ]       │
│                                 │
│   Class 8 · CBSE · Mathematics  │
└─────────────────────────────────┘
```

**Route**: `/`
**After submit**: Navigate to `/learn`

---

### Screen 2: Main Dashboard (No Topic Selected)

Three-panel layout with updated progress panel showing gamification stats.

```
┌────────────┬──────────────────────────┬────────────┐
│            │                          │            │
│ Curriculum │                          │ Progress   │
│ Sidebar    │   Welcome, Arjun! 👋    │ & Stats    │
│            │                          │            │
│ Ch 3: Quad │   Select a topic from    │ 🔥 Streak │
│ ├─ Intro   │   the left to start      │   3 days   │
│ │  ├─ ✅   │   learning!              │            │
│ │  └─ ○    │                          │ ⭐ 240 XP │
│ ├─ Types   │   [ Start: Polygons ]    │ Lv 3      │
│ │  ├─ ...  │                          │ "Geometry  │
│ └─ Props   │                          │  Explorer" │
│            │                          │            │
│            │                          │ 📊 Quizzes │
│            │                          │   8/10     │
│            │                          │            │
│            │                          │ 🏅 Badges  │
│            │                          │ [3 earned] │
└────────────┴──────────────────────────┴────────────┘
```

**Desktop**: Sidebar (280px) | Main (flex-1) | Progress (280px)
**Mobile**: Main only. Sidebar = left drawer. Progress = right drawer. Top bar with hamburger + stats icons.

---

### Screen 3: Topic Start — Video Intro

When student clicks a topic from the sidebar. This is the FIRST thing they see.

```
┌──────────────────────────────────────┐
│                                      │
│   📐 Parallelogram                  │
│                                      │
│   "Aaj hum parallelogram ke baare   │
│    mein seekhenge!"                  │
│                                      │
│   ┌──────────────────────────┐       │
│   │                          │       │
│   │    ▶  Watch Intro        │       │
│   │    (2 min video)         │       │
│   │                          │       │
│   └──────────────────────────┘       │
│                                      │
│   [ Watch Video ]  [ Skip → Start ] │
│                                      │
└──────────────────────────────────────┘
```

**Video source**: YouTube videos from existing `videoMap.ts` (for prototype).
**Future**: Custom teacher-recorded videos with transcripts for timestamp-aware AI.

**When video is playing**, a floating "Have a doubt? 💬" button is visible.

**If student taps "Have a doubt?":**
- Video pauses
- A chat input slides up from the bottom
- Student types or speaks their doubt
- AI answers (knows the topic, but NOT the video timestamp — YouTube limitation)
- Student taps "Resume Video" to continue
- Or taps "Start Learning →" to proceed to concept cards

```
┌──────────────────────────────────────┐
│  ⏸ Video paused (tap to resume)     │
│──────────────────────────────────────│
│                                      │
│  AI: Haan bolo, kya doubt hai?      │
│                                      │
│  You: Curved shapes ko polygon       │
│       kyun nahi bolte?               │
│                                      │
│  AI: Accha sawaal! Polygon mein      │
│  sirf straight lines hoti hain.      │
│  "Poly" = many, "gon" = angles.     │
│  Curved shapes mein angles nahi      │
│  hote, isliye polygon nahi!          │
│                                      │
│  ┌──────────────────────────┬──┐     │
│  │ Type or hold 🎤 to speak│📎│     │
│  └──────────────────────────┴──┘     │
│                                      │
│  [ Resume Video ]  [ Start Cards → ] │
└──────────────────────────────────────┘
```

---

### Screen 4: Concept Cards (The Learning Phase)

This is the CORE new experience. One card at a time. Progress dots at top. Voice auto-plays the text.

**Card structure:**
- Progress indicator (dots or bar)
- Visual/diagram (top half)
- Short text — 1-2 sentences max (bottom half)
- Voice auto-reads the text
- "Next →" button to advance

```
Parallelogram        Card 1/5      ●○○○○
┌──────────────────────────────────────┐
│                                      │
│  🔊 Playing...                      │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │   [Visual: Real-world image  │    │
│  │    or context illustration]  │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  Arjun, kabhi notice kiya hai ki     │
│  door thoda tilt ho jaye toh kaisi   │
│  shape banti hai? Yeh hota hai       │
│  parallelogram! 🚪                  │
│                                      │
│                     [ Next → ]       │
│                                      │
└──────────────────────────────────────┘
```

```
Parallelogram        Card 2/5      ●●○○○
┌──────────────────────────────────────┐
│                                      │
│  🔊 Playing...                      │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │   [GeometryDiagram:         │    │
│  │    parallelogram with        │    │
│  │    opposite sides            │    │
│  │    highlighted in blue]      │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  Isme opposite sides hamesha equal   │
│  AUR parallel hoti hain — matlab     │
│  AB = CD aur AD = BC!               │
│                                      │
│                     [ Next → ]       │
│                                      │
└──────────────────────────────────────┘
```

```
Parallelogram        Card 3/5      ●●●○○
┌──────────────────────────────────────┐
│                                      │
│  🔊 Playing...                      │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │   [GeometryDiagram:         │    │
│  │    parallelogram with        │    │
│  │    angles marked,            │    │
│  │    ∠A=∠C and ∠B=∠D          │    │
│  │    highlighted]              │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  Aur opposite angles bhi equal       │
│  hote hain! ∠A = ∠C aur ∠B = ∠D.   │
│  Consecutive angles ka sum hamesha   │
│  180° hota hai ✨                   │
│                                      │
│                     [ Next → ]       │
│                                      │
└──────────────────────────────────────┘
```

Cards 4-5 continue for remaining sub-concepts (diagonals bisect, etc.).

**Transition to quiz** — after last concept card:

```
┌──────────────────────────────────────┐
│                                      │
│  🔊 "Ab dekhte hain kitna yaad      │
│      raha!"                          │
│                                      │
│         🎯                          │
│                                      │
│  Chalo, kuch questions solve         │
│  karte hain!                         │
│                                      │
│              [ Start Quiz → ]        │
│                                      │
└──────────────────────────────────────┘
```

**Key behaviors:**
- Voice auto-plays when card appears (student can toggle voice off)
- Student MUST tap "Next" to advance (no auto-advance)
- A floating "💬 Ask Doubt" button is always visible (opens doubt chat overlay)
- Progress dots show position in the card sequence
- Cards animate in (slide from right or fade-in)

---

### Screen 5: Quiz Cards (The Practice Phase)

**COMPLETELY SEPARATE from concept cards.** Student cannot scroll back to see theory. Each quiz is a full-screen card.

```
Quiz                    1/3          ❤❤❤
┌──────────────────────────────────────┐
│                                      │
│  🔊 "Parallelogram mein opposite   │
│      sides kaise hoti hain?"         │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  A) Perpendicular            │    │
│  ├──────────────────────────────┤    │
│  │  B) Equal & Parallel         │    │
│  ├──────────────────────────────┤    │
│  │  C) Only Equal               │    │
│  ├──────────────────────────────┤    │
│  │  D) Curved                   │    │
│  └──────────────────────────────┘    │
│                                      │
│             [ Check → ]              │
│                                      │
└──────────────────────────────────────┘
```

#### Wrong Answer — Attempt 1 (Hint 1):

```
┌──────────────────────────────────────┐
│                                      │
│  ❌ Yeh nahi hai!                    │
│                                      │
│  🔊 "Ek hint deta hoon..."         │
│                                      │
│  💡 Hint: Door ko tilt karke        │
│  dekho — opposite sides kya kar      │
│  rahi hain? Kya wo milti hain        │
│  kabhi?                              │
│                                      │
│           [ Try Again → ]            │
│                                      │
└──────────────────────────────────────┘
```

**"Try Again"** takes student back to the same question with options. Their previous wrong answer is visually dimmed/disabled so they can't pick it again.

#### Wrong Answer — Attempt 2 (Hint 2):

```
┌──────────────────────────────────────┐
│                                      │
│  ❌ Ek aur try!                     │
│                                      │
│  🔊 "Dhyan se socho..."            │
│                                      │
│  💡 Hint 2: Parallel matlab wo      │
│  kabhi nahi milti. Ab socho — kya    │
│  wo barabar (equal) bhi hain?        │
│                                      │
│           [ Try Again → ]            │
│                                      │
└──────────────────────────────────────┘
```

#### Wrong Answer — Attempt 3 (Reveal with Explanation):

After 3 wrong attempts, reveal the answer. No more "try again."

```
┌──────────────────────────────────────┐
│                                      │
│  💡 Answer: B) Equal & Parallel     │
│                                      │
│  🔊 "Koi baat nahi Arjun..."       │
│                                      │
│  Parallelogram mein opposite sides   │
│  hamesha equal AND parallel hoti     │
│  hain. Yaad rakhna — dono baatein   │
│  zaroori hain!                       │
│                                      │
│  No XP for this question             │
│                                      │
│             [ Next → ]               │
│                                      │
└──────────────────────────────────────┘
```

#### Correct Answer (Celebration):

```
┌──────────────────────────────────────┐
│                                      │
│         🎉 Sahi Jawab!              │
│                                      │
│      🔊 *celebration sound*          │
│                                      │
│         ✨ +20 XP                    │
│                                      │
│  Bilkul sahi! Opposite sides equal   │
│  AND parallel hoti hain! 💪          │
│                                      │
│             [ Next → ]               │
│                                      │
└──────────────────────────────────────┘
```

**XP rules for quizzes:**
- Correct on 1st attempt: +20 XP
- Correct on 2nd attempt: +10 XP
- Correct on 3rd attempt: +5 XP
- Revealed after 3 wrong: +0 XP

**Quiz flow:**
- 2-3 quiz questions per topic (each covering a different sub-concept)
- Questions, options, and hints are AI-generated (personalized, varied each time)
- Maximum 3 attempts per question before answer is revealed
- Previously wrong options are dimmed on retry

---

### Screen 6: Topic Complete — Achievement Screen

After all quizzes are done:

```
┌──────────────────────────────────────┐
│                                      │
│        🏆 Topic Complete!            │
│        *celebration sound*           │
│        *confetti animation*          │
│                                      │
│       "Parallelogram"               │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ ✅ Opposite sides: equal &   │    │
│  │    parallel                   │    │
│  │ ✅ Opposite angles: equal    │    │
│  │ ✅ Consecutive angles:       │    │
│  │    supplementary (180°)       │    │
│  │ ✅ Diagonals bisect each     │    │
│  │    other                      │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌─────────┬─────────┬─────────┐    │
│  │ ✨ XP   │ 🔥 Streak│ 🎯 Quiz │    │
│  │ +120    │ 4 days  │ 3/3    │    │
│  └─────────┴─────────┴─────────┘    │
│                                      │
│  🏅 New Badge: "Parallelogram Pro"  │
│     (if applicable)                  │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 💬 Have doubts? Ask AI       │    │
│  └──────────────────────────────┘    │
│                                      │
│       [ Next: Rhombus → ]           │
│                                      │
└──────────────────────────────────────┘
```

**What happens on this screen:**
- Topic is marked as completed in ProgressContext
- XP is added to total
- Streak is updated (if first lesson today)
- Badge is awarded if conditions met
- Sidebar checkmark updates
- Celebration sound plays
- Confetti animation plays

**"Next: Rhombus →"** takes the student to Screen 3 (Video Intro) for the next topic.
**"Have doubts? Ask AI"** opens the doubt chat overlay.

---

### Screen 7: Doubt Chat (Overlay, accessible anytime)

This is the existing chat interface, repurposed as a **secondary, overlay** experience. Available from:
- "Have a doubt? 💬" button during video playback
- Floating "💬" icon during concept cards and quizzes
- "Have doubts? Ask AI" button on topic complete screen

```
┌──────────────────────────────────────┐
│  💬 Ask PadhAI            [ ✕ ]     │
│──────────────────────────────────────│
│                                      │
│  AI: Haan Arjun, kya doubt hai?     │
│      Kuch bhi poocho! 😊            │
│                                      │
│  You: Diagonal bisect ka matlab      │
│       samajh nahi aaya               │
│                                      │
│  AI: Dekho, bisect matlab "do        │
│  barabar hisson mein katna".         │
│  [DIAGRAM: parallelogram-diagonals]  │
│  Jab dono diagonals milte hain,      │
│  toh exactly beech se kaatte hain!   │
│                                      │
│  ┌──────────────────────┬──┬───┐     │
│  │ Type or hold 🎤...   │📎│ ➤ │     │
│  └──────────────────────┴──┴───┘     │
│                                      │
└──────────────────────────────────────┘
```

**Input options:**
- Text input (type and send)
- Voice input: hold 🎤 button (mobile) or hold spacebar (desktop) to record → Whisper STT → send as text
- Photo upload: tap 📎 → camera or gallery → image sent to Claude Vision

**This chat uses the same Claude API** but with a modified system prompt that knows:
- Which topic the student is currently on
- That the student is asking a doubt (not starting a lesson)
- To keep answers short and focused

---

### Photo Upload Flows (within Doubt Chat)

#### Flow A: "Explain this page"

```
Student taps 📎 → selects photo of NCERT page

┌──────────────────────────────────────┐
│  You:                                │
│  ┌──────────────────────────┐        │
│  │ [Photo: NCERT page with  │        │
│  │  quadrilateral diagram]  │        │
│  └──────────────────────────┘        │
│  "Yeh page samjha do please"         │
│                                      │
│  AI: Dekho Arjun, iss page mein     │
│  quadrilateral ki properties table   │
│  hai. Pehli row mein parallelogram   │
│  hai — isme opposite sides equal     │
│  hoti hain...                        │
│  (continues in short Hinglish)       │
└──────────────────────────────────────┘
```

#### Flow B: "Help me solve this" (Guided, NOT answer-giving)

```
Student uploads photo of a math problem

┌──────────────────────────────────────┐
│  You:                                │
│  ┌──────────────────────────┐        │
│  │ [Photo: "Find ∠B if     │        │
│  │  ∠A = 70° in ABCD       │        │
│  │  parallelogram"]         │        │
│  └──────────────────────────┘        │
│  "Help me solve this"                │
│                                      │
│  AI: Accha, chalo step by step!      │
│  Step 1: Parallelogram mein          │
│  opposite angles ke baare mein       │
│  kya yaad hai? 🤔                    │
│                                      │
│  You: Equal hote hain                │
│                                      │
│  AI: Sahi! Toh agar ∠A = 70°,      │
│  toh ∠C kitna hoga? Socho!          │
│                                      │
│  You: 70°                            │
│                                      │
│  AI: Bilkul! Ab consecutive angles   │
│  ka sum 180° hota hai. Toh           │
│  ∠A + ∠B = 180°. Ab ∠B nikalo!     │
│                                      │
│  You: 110°                           │
│                                      │
│  AI: 🎉 Sahi jawab! ∠B = 110°.     │
│  Dekha, khud solve kar liya!         │
└──────────────────────────────────────┘
```

**Key behavior**: AI NEVER gives the direct answer. It guides step-by-step. System prompt enforces this.

---

## 3. Technical Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite + TypeScript | UI framework |
| Styling | Tailwind CSS v4 | Styling |
| Routing | react-router-dom v7 | Client-side routing |
| AI (Teaching + Chat) | **Claude API** (Anthropic) | Generates lesson cards, quiz content, doubt answers |
| AI (Vision) | **Claude API** (Anthropic) | Reads uploaded NCERT pages and math problems |
| Voice Output (TTS) | **OpenAI TTS API** | Converts card text to speech in Hinglish |
| Voice Input (STT) | **OpenAI Whisper API** | Converts student speech to text |
| Math Rendering | KaTeX | LaTeX math expressions |
| Icons | lucide-react | UI icons |
| Backend | Netlify Functions | Proxies all API calls |
| Deployment | Netlify | Hosting + serverless |
| Persistence | localStorage | User data, progress, chat history (prototype) |

### Environment Variables Required

```env
ANTHROPIC_API_KEY=sk-ant-...     # Claude API (teaching, chat, vision)
OPENAI_API_KEY=sk-...            # OpenAI TTS + Whisper STT
```

### API Proxy Architecture

All API calls go through Netlify Functions (never expose keys to frontend):

```
Frontend
  ├─→ /.netlify/functions/chat          → Claude API (text generation)
  ├─→ /.netlify/functions/chat-vision   → Claude API (image + text)
  ├─→ /.netlify/functions/tts           → OpenAI TTS API
  └─→ /.netlify/functions/stt           → OpenAI Whisper API
```

---

## 4. API & Services

### 4.1 Claude API — Lesson Content Generation

**Purpose**: Generate concept card text, quiz questions + hints, doubt answers.

**For lesson cards** — one structured API call per topic:

```
System prompt: [lesson generation prompt with topic template]

User message: "Generate a lesson for 'Parallelogram' for
student Arjun (Class 8). Return structured JSON."

Expected response (JSON):
{
  "cards": [
    {
      "type": "hook",
      "text": "Arjun, kabhi notice kiya hai ki door thoda tilt ho jaye toh kaisi shape banti hai?",
      "diagram": null,
      "diagramConfig": null
    },
    {
      "type": "concept",
      "text": "Isme opposite sides hamesha equal AUR parallel hoti hain — matlab AB = CD aur AD = BC!",
      "diagram": "geometry",
      "diagramConfig": { "shape": "parallelogram", "highlight": "opposite-sides", "labels": true }
    },
    ...
  ],
  "quizzes": [
    {
      "question": "Parallelogram mein opposite sides kaise hoti hain?",
      "options": ["Perpendicular", "Equal & Parallel", "Only Equal", "Curved"],
      "correctAnswer": "B",
      "hints": [
        "Door ko tilt karke dekho — opposite sides kya kar rahi hain?",
        "Parallel matlab wo kabhi nahi milti. Ab socho — kya wo barabar bhi hain?"
      ],
      "explanation": "Parallelogram mein opposite sides hamesha equal AND parallel hoti hain."
    },
    ...
  ],
  "summary": {
    "keyPoints": [
      "Opposite sides equal & parallel",
      "Opposite angles equal",
      "Consecutive angles supplementary (180°)",
      "Diagonals bisect each other"
    ]
  }
}
```

**Model**: `claude-sonnet-4-20250514`
**Max tokens**: 2048 (increased from 1024 for structured JSON)
**Temperature**: Keep default

### 4.2 Claude API — Doubt Chat

**Purpose**: Answer student doubts during video or after lesson.

Same as current `chat.mts` function but with a modified system prompt:
- Knows current topic
- Instructed to keep answers short (2-3 sentences)
- For problem-solving: GUIDE, never give direct answers
- Responds in Hinglish

### 4.3 Claude API — Vision (Photo Upload)

**Purpose**: Read NCERT pages, textbook diagrams, handwritten math problems.

**New Netlify function**: `chat-vision.mts`

```typescript
// Receives: base64 image + text prompt + conversation history
// Sends to Claude with vision: image content block + text
// Returns: streaming text response (same SSE protocol)
```

**System prompt addition for vision:**
```
When the student uploads a photo:
- If it's a textbook page: explain the content in simple Hinglish
- If it's a math problem: DO NOT solve it directly. Guide the student step-by-step.
  Ask them to identify what's given, what formula applies, and help them arrive at the answer.
- If the image is unclear: politely ask them to upload a clearer photo
```

### 4.4 OpenAI TTS — Voice Output

**Purpose**: Read concept card text and quiz feedback aloud in Hinglish.

**New Netlify function**: `tts.mts`

```typescript
// Receives: { text: string, voice?: string }
// Calls: OpenAI TTS API
// Returns: audio/mpeg binary stream

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate speech
const response = await openai.audio.speech.create({
  model: 'tts-1',           // or 'tts-1-hd' for higher quality
  voice: 'shimmer',          // warm, friendly voice. Alternatives: 'nova', 'alloy'
  input: text,
  response_format: 'mp3',
});
```

**Voice choice**: `shimmer` (warm, natural — good for a tutor). Can be tested with `nova` and `alloy` too.

**Frontend integration**:
- When a concept card appears, send card text to TTS endpoint
- Play returned audio automatically
- Show 🔊 indicator while playing
- Student can tap to toggle voice on/off (preference saved in localStorage)
- Cache audio per card to avoid re-generating on back navigation

**Cost**: ~$15 per 1M characters. A lesson card is ~100-200 chars. 11 topics × 5 cards × 150 chars = ~8,250 chars per full chapter. Negligible cost.

### 4.5 OpenAI Whisper — Voice Input

**Purpose**: Convert student speech to text for doubts/chat.

**New Netlify function**: `stt.mts`

```typescript
// Receives: audio file (webm/mp4 blob from MediaRecorder)
// Calls: OpenAI Whisper API
// Returns: { text: string }

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const transcription = await openai.audio.transcriptions.create({
  model: 'whisper-1',
  file: audioFile,
  language: 'hi',            // Hindi (handles Hinglish well)
  response_format: 'json',
});
```

**Frontend integration**:
- **Desktop**: Hold spacebar → start recording → release → send to Whisper → get text → send to AI
- **Mobile**: Hold 🎤 button → same flow
- Use `MediaRecorder` API to capture audio
- Show recording indicator (pulsing red dot) while recording
- Show "Processing..." while Whisper transcribes

**Cost**: $0.006 per minute. Average student doubt = 10-15 seconds. Negligible.

---

## 5. Gamification System

### 5.1 XP (Experience Points)

**Earning XP:**

| Action | XP |
|--------|-----|
| Complete a concept card (tap Next) | +5 XP per card |
| Quiz — correct on 1st attempt | +20 XP |
| Quiz — correct on 2nd attempt | +10 XP |
| Quiz — correct on 3rd attempt | +5 XP |
| Quiz — revealed after 3 wrong | +0 XP |
| Complete a topic (all cards + quizzes) | +50 XP bonus |
| Daily streak bonus (first lesson of the day) | +10 XP |

**Display**: XP counter visible in progress panel. Animated "+20 XP" popup on quiz correct.

### 5.2 Levels

XP thresholds determine level:

| Level | XP Required | Title |
|-------|------------|-------|
| 1 | 0 | Math Beginner |
| 2 | 100 | Number Explorer |
| 3 | 250 | Shape Learner |
| 4 | 500 | Geometry Explorer |
| 5 | 800 | Angle Master |
| 6 | 1200 | Quadrilateral Warrior |
| 7 | 1800 | Math Champion |
| 8 | 2500 | PadhAI Pro |

**Display**: Current level + title in progress panel. Level-up animation + sound when threshold crossed.

### 5.3 Daily Streaks

- Streak increments when student completes at least 1 lesson card or 1 quiz in a day.
- Streak resets to 0 if a day is missed.
- Streak counter visible in progress panel (🔥 icon).
- Visual: fire icon grows with streak length.
- Sound: streak maintained sound on first activity each day.

**Data stored**:
```typescript
{
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: string,  // "2026-04-08" format
}
```

### 5.4 Badges / Achievements

| Badge | Condition | Icon |
|-------|-----------|------|
| First Step | Complete first topic | 🎯 |
| Perfect Score | Get all quizzes right in a topic (1st attempt) | ⭐ |
| 3-Day Streak | Maintain 3-day streak | 🔥 |
| 7-Day Streak | Maintain 7-day streak | 🔥🔥 |
| Shape Master | Complete all 7 quadrilateral type topics | 📐 |
| Chapter Champion | Complete all 11 topics in Chapter 3 | 🏆 |
| Quick Learner | Complete a topic in under 5 minutes | ⚡ |
| Curious Mind | Ask 10 doubts via chat | 💬 |

**Display**: Badge grid in progress panel. New badge = popup animation + sound.

**Data stored**:
```typescript
{
  badges: string[],  // list of badge IDs earned
  badgeTimestamps: Record<string, number>,  // when each was earned
}
```

### 5.5 Sound Effects

| Event | Sound |
|-------|-------|
| Correct answer (1st attempt) | Cheerful chime / ding |
| Correct answer (2nd-3rd attempt) | Softer positive sound |
| Wrong answer | Gentle "try again" sound (NOT harsh buzzer) |
| Topic complete | Celebration fanfare |
| Level up | Achievement unlock sound |
| Badge earned | Special achievement sound |
| Streak maintained | Streak fire sound |
| Card advance (tap Next) | Soft tap/click sound |

**Implementation**: Small MP3/WAV files in `/public/sounds/`. Played via `Audio` API.
**User control**: Global sound on/off toggle in settings. Default: ON.

---

## 6. Voice System (TTS + STT)

### 6.1 Text-to-Speech (AI Speaks)

**When voice plays:**
- Automatically when a concept card appears
- Automatically on quiz question display
- Automatically on correct/wrong answer feedback
- NOT on the doubt chat (doubt chat is text-only by default; voice is optional there)

**Voice toggle:**
- 🔊 icon in top-right of card area
- Tap to toggle on/off
- Preference persisted in localStorage
- Default: ON

**Audio caching:**
- Cache generated audio per card (in memory) to avoid re-fetching if student goes back
- Clear cache on topic change

### 6.2 Speech-to-Text (Student Speaks)

**How to activate:**
- **Desktop**: Hold spacebar (when chat input is focused) → start recording → release → transcribe
- **Mobile**: Hold 🎤 microphone button (next to text input in doubt chat) → same flow

**UI states:**
1. Idle: 🎤 button visible, spacebar hint text
2. Recording: 🔴 pulsing indicator, "Listening..." text, waveform animation
3. Processing: "Transcribing..." text with spinner
4. Done: Transcribed text appears in input → auto-sends OR student can edit before sending

**Technical notes:**
- Use `navigator.mediaDevices.getUserMedia({ audio: true })` for mic access
- Use `MediaRecorder` API to capture audio as webm blob
- Send blob to `/api/stt` Netlify function
- Handle permission denial gracefully: "Mic access needed. Please allow in browser settings."

---

## 7. Photo Upload & AI Vision

### Upload UI

In the doubt chat input bar, a 📎 (paperclip) button opens the upload options:
- **Camera** (mobile): Opens device camera
- **Gallery/Files** (mobile + desktop): Opens file picker
- Accepts: JPG, PNG, HEIC, WebP
- Max size: 10MB (resize client-side if larger)

### Processing Flow

1. Student selects/captures image
2. Image preview shown in chat as student's message
3. Student can add text context: "Yeh page samjha do" or "Help me solve this"
4. Image encoded as base64
5. Sent to `/.netlify/functions/chat-vision` along with text and conversation history
6. Claude Vision analyzes image + responds
7. Response streamed back via SSE (same protocol as text chat)

### System Prompt for Vision

Added to the doubt chat system prompt when an image is present:

```
The student has uploaded an image. Analyze it carefully.

If it's a TEXTBOOK PAGE or DIAGRAM:
- Explain what's shown in simple Hinglish
- Break it into digestible points
- Relate it to what they're currently learning

If it's a MATH PROBLEM (printed or handwritten):
- DO NOT solve it directly
- Guide the student step by step:
  1. Ask them to identify what's given
  2. Ask which formula/concept applies
  3. Guide them through each step
  4. Let them arrive at the answer themselves
- Only reveal the answer if they're completely stuck after 3+ attempts

If the IMAGE IS UNCLEAR:
- Politely ask for a clearer photo
```

---

## 8. Lesson Data Structure

### Lesson Templates

Each topic has a template that defines the learning structure. AI fills in the personalized content.

```typescript
// src/data/lessonTemplates.ts

export interface ConceptCardTemplate {
  id: string;
  type: 'hook' | 'concept' | 'formula' | 'example';
  subConcept: string;           // what this card teaches
  diagramConfig?: {             // optional geometry diagram
    shape: string;
    highlight?: string;
    showLabels?: boolean;
    showAngles?: boolean;
    showDiagonals?: boolean;
  };
  contextImage?: string;        // optional real-world image URL
}

export interface QuizTemplate {
  id: string;
  subConcept: string;           // which sub-concept this tests
  type: 'mcq' | 'type-in';
  maxAttempts: 3;               // always 3
}

export interface LessonTemplate {
  topicId: string;
  videoId: string;              // YouTube ID for intro video
  cards: ConceptCardTemplate[];
  quizzes: QuizTemplate[];
  summary: {
    keyPointCount: number;      // how many key points to generate
  };
}
```

### Example: Parallelogram Template

```typescript
{
  topicId: 'parallelogram',
  videoId: 'DzXiWgT_hpE',    // Magnet Brains video
  cards: [
    {
      id: 'para-hook',
      type: 'hook',
      subConcept: 'introduction',
      contextImage: '/images/tilted-door.jpg',  // or stock image URL
    },
    {
      id: 'para-sides',
      type: 'concept',
      subConcept: 'opposite-sides-equal-parallel',
      diagramConfig: {
        shape: 'parallelogram',
        highlight: 'opposite-sides',
        showLabels: true,
      },
    },
    {
      id: 'para-angles',
      type: 'concept',
      subConcept: 'opposite-angles-equal',
      diagramConfig: {
        shape: 'parallelogram',
        highlight: 'angles',
        showLabels: true,
        showAngles: true,
      },
    },
    {
      id: 'para-consecutive',
      type: 'concept',
      subConcept: 'consecutive-angles-supplementary',
      diagramConfig: {
        shape: 'parallelogram',
        highlight: 'consecutive-angles',
        showAngles: true,
      },
    },
    {
      id: 'para-diagonals',
      type: 'concept',
      subConcept: 'diagonals-bisect',
      diagramConfig: {
        shape: 'parallelogram',
        highlight: 'diagonals',
        showDiagonals: true,
        showLabels: true,
      },
    },
  ],
  quizzes: [
    {
      id: 'para-quiz-1',
      subConcept: 'opposite-sides-equal-parallel',
      type: 'mcq',
      maxAttempts: 3,
    },
    {
      id: 'para-quiz-2',
      subConcept: 'opposite-angles-equal',
      type: 'mcq',
      maxAttempts: 3,
    },
    {
      id: 'para-quiz-3',
      subConcept: 'diagonals-bisect',
      type: 'mcq',
      maxAttempts: 3,
    },
  ],
  summary: {
    keyPointCount: 4,
  },
}
```

### AI Call for Lesson Generation

When a student starts a topic, we send the template + student info to Claude:

```
System: You are PadhAI's lesson content generator. Generate personalized
lesson content based on the template provided. All text must be in Hinglish.
Keep each card text to 1-2 sentences maximum. Be warm, use real-life examples.

User: Generate lesson content for student "Arjun" on topic "Parallelogram".

Template:
- Card 1 (hook): Introduction with real-life example
- Card 2 (concept): Opposite sides equal & parallel
- Card 3 (concept): Opposite angles equal
- Card 4 (concept): Consecutive angles supplementary
- Card 5 (concept): Diagonals bisect each other
- Quiz 1: Test opposite sides knowledge (MCQ, 4 options, 2 hints)
- Quiz 2: Test angles knowledge (MCQ, 4 options, 2 hints)
- Quiz 3: Test diagonals knowledge (MCQ, 4 options, 2 hints)
- Summary: 4 key points

Return ONLY valid JSON (no markdown, no code fences).
```

### Lesson State Machine

```
TOPIC_INTRO        → student taps "Watch Video" or "Skip"
  ↓
VIDEO_PLAYING      → student watches, can pause to ask doubts
  ↓
CONCEPT_CARDS      → cards 1..N, student taps Next
  ↓
QUIZ_TRANSITION    → "Ab dekhte hain!" screen
  ↓
QUIZ_CARDS         → quizzes 1..M, with hint system
  ↓
TOPIC_COMPLETE     → achievement screen, XP, badges
  ↓
NEXT_TOPIC_READY   → student taps "Next Topic"
```

Each state is tracked in a new `LessonContext` (or extend existing `ChatContext`).

---

## 9. Programmatic SVG Diagram Engine

### Why

Currently: 11 separate SVG component files, each hand-coded. Not scalable.

New approach: One `<GeometryDiagram>` component that renders any shape with configurable highlights.

### Component API

```typescript
interface GeometryDiagramProps {
  shape: 'parallelogram' | 'rhombus' | 'rectangle' | 'square' |
         'kite' | 'trapezium' | 'triangle' | 'pentagon' | 'hexagon' |
         'generic-quadrilateral';
  highlight?: 'opposite-sides' | 'all-sides' | 'angles' |
              'opposite-angles' | 'consecutive-angles' |
              'diagonals' | 'right-angles' | 'parallel-marks' | 'none';
  showLabels?: boolean;        // vertex labels (A, B, C, D)
  showMeasurements?: boolean;  // side lengths, angle degrees
  showDiagonals?: boolean;     // draw diagonals
  showAngles?: boolean;        // draw angle arcs
  width?: number;              // SVG width (default 300)
  height?: number;             // SVG height (default 250)
}
```

### Shape Definitions

Each shape is defined by vertex coordinates + metadata:

```typescript
const shapes = {
  parallelogram: {
    vertices: [[50, 180], [120, 40], [280, 40], [210, 180]],
    parallelSides: [[0,1], [2,3]],  // sides that are parallel
    equalSides: [[0,1], [2,3]],     // sides that are equal
    properties: { rightAngles: false, allSidesEqual: false }
  },
  rhombus: {
    vertices: [[150, 20], [270, 110], [150, 200], [30, 110]],
    parallelSides: [[0,1], [2,3]],
    equalSides: [[0,1], [1,2], [2,3], [3,0]],  // all sides equal
    properties: { rightAngles: false, allSidesEqual: true }
  },
  // ... etc for all shapes
};
```

### Rendering Features

The engine renders:
1. **Shape outline** (filled with light color)
2. **Vertex labels** (A, B, C, D at each corner)
3. **Side highlights** (colored overlay on specific sides based on `highlight` prop)
4. **Parallel marks** (arrows or tick marks on parallel sides)
5. **Equal marks** (tick marks on equal sides)
6. **Angle arcs** (at vertices, with degree labels)
7. **Right angle squares** (small square at 90° corners)
8. **Diagonals** (dashed lines connecting opposite vertices, with intersection point marked)

### Migration Plan

1. Build the `GeometryDiagram` component
2. It replaces all existing individual diagram components
3. Update `DiagramRenderer` to use the new engine with config from lesson templates
4. Keep existing components as fallback during migration
5. Delete old components once engine is verified working

---

## 10. Bug Fixes

### 10.1 API Error Retry

**Current behavior**: On API failure, shows "Oops! Something went wrong" with no retry option.

**New behavior**:
- Automatic retry: 3 attempts with exponential backoff (1s, 2s, 4s)
- If all retries fail: show error with a "Retry" button
- During retry: show "Reconnecting..." indicator

**Implementation in `api.ts`:**
```typescript
async function sendMessageWithRetry(params, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await sendMessage(params);
      return; // success
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000); // 1s, 2s, 4s
        continue;
      }
      params.onError(error.message + ' (after 3 retries)');
    }
  }
}
```

**UI**: "Retry" button in error message area.

### 10.2 Quiz Parser Robustness

**Current issue**: Parser assumes exactly 4 options (A-D). If AI generates 3 or 5, it breaks.

**Fix in `parseAIResponse.ts`:**
```typescript
// Change from:
const optionMatches = raw.match(/^[A-D]\)\s*.+$/gm);

// To (supports A-F, any number of options):
const optionMatches = raw.match(/^[A-F]\)\s*.+$/gm);
```

Also add validation:
- If no options found for MCQ, skip the quiz block (don't crash)
- If answer letter doesn't match any option, log warning and skip
- Handle missing EXPLANATION gracefully (already done)

---

## 11. What's NOT in This Phase

These are **explicitly deferred** and should NOT be worked on:

| Feature | Reason | When |
|---------|--------|------|
| More chapters (Class 6-12) | Prototype scope is 1 chapter | After product validation |
| WhatsApp parent reports | Needs messaging API integration | After core product is solid |
| Spaced repetition / revision | Needs learning history infrastructure | v3 |
| Deterministic math engine | Complex integration (SymPy/math.js) | v3 |
| Prerequisite gap detection | Needs multi-chapter content first | v3 |
| Exam mode / mock tests | Nice-to-have, not core learning flow | v3 |
| Offline / low-bandwidth mode | Needs service worker + content caching | v3 |
| Study planner / scheduler | Needs push notifications | v3 |
| Collaborative learning | Needs user accounts + backend | v4 |
| Leaderboards | Needs user accounts + backend | v4 |
| Security hardening (CORS, rate limits) | Prototype, not production | Before public launch |
| Accessibility (ARIA, screen readers) | Important but not prototype blocker | Before public launch |
| Unit tests / integration tests | Writing tests for rapidly changing prototype | After UI stabilizes |
| Custom teacher videos + transcripts | Need teacher to record content | When ready |
| AI-generated context images | Explore DALL-E/Gemini for illustrations | v3 |
| Dark mode | Nice-to-have | v3 |
| Multiple languages beyond Hinglish | Hindi, Tamil, Telugu, etc. | v4 |
| Admin panel / CMS | For managing curriculum + prompts | v3 |

---

## 12. Implementation Order

Execute in this exact order. Each step should be completed and verified before moving to the next.

### Step 1: Bug Fixes (Foundation)
1. Add API error retry with exponential backoff in `api.ts`
2. Fix quiz parser to handle 3-6 options in `parseAIResponse.ts`
3. Verify both fixes work

### Step 2: Lesson Data Structure + Templates
1. Create `LessonTemplate` types in `src/types/lesson.ts`
2. Create lesson templates for all 11 topics in `src/data/lessonTemplates.ts`
3. Create `LessonContext` with state machine (TOPIC_INTRO → CONCEPT_CARDS → QUIZ → COMPLETE)

### Step 3: Concept Card UI
1. Build `ConceptCard` component (single card with visual + text + Next button)
2. Build `CardFlow` component (manages card sequence, progress dots, transitions)
3. Build card animations (slide-in, fade)
4. Build transition screen ("Ab quiz time!")

### Step 4: Quiz Card UI (Separate from Theory)
1. Build new `QuizCard` component (full-screen, no scroll back to theory)
2. Implement progressive hint system (3 attempts)
3. Implement "dimmed previous wrong answer" on retry
4. XP popup on correct answer
5. Connect to ProgressContext

### Step 5: Topic Complete Screen
1. Build `TopicCompleteScreen` component
2. Confetti animation
3. Summary display with key points
4. XP earned + streak + quiz score display
5. Badge award display (if applicable)
6. "Next Topic" button wired to next topic in curriculum

### Step 6: Video Intro Screen
1. Build `VideoIntro` component (video player + skip button)
2. Implement "pause and ask doubt" floating button
3. Build doubt overlay (chat input slides up when video paused)
4. Wire video from `videoMap.ts`

### Step 7: Lesson Flow Integration
1. Modify `AppLayout` to render lesson flow instead of chat when topic is active
2. Wire state machine: Topic Start → Video → Cards → Quiz → Complete → Next Topic
3. AI content generation: Call Claude for lesson content when topic starts
4. Parse AI JSON response into card + quiz data
5. Handle loading state while AI generates content

### Step 8: Gamification System
1. Create `GamificationContext` (XP, level, streak, badges)
2. XP tracking + level calculation
3. Streak tracking (date-based)
4. Badge system (condition checks)
5. Update `ProgressPanel` with XP, level, streak, badges
6. Add sound effects (correct, wrong, complete, level-up, badge)
7. Add celebration animations (confetti on topic complete, XP popup)

### Step 9: Voice Output (TTS)
1. Create `tts.mts` Netlify function (OpenAI TTS proxy)
2. Build `useVoice` hook (fetches audio, plays it, manages queue)
3. Integrate TTS into concept cards (auto-play on card appear)
4. Integrate TTS into quiz feedback (read hints and results)
5. Add voice toggle button (🔊 / 🔇)
6. Audio caching (in-memory per session)

### Step 10: Voice Input (STT)
1. Create `stt.mts` Netlify function (OpenAI Whisper proxy)
2. Build `useVoiceInput` hook (MediaRecorder, permission handling)
3. Add 🎤 button to doubt chat input
4. Add spacebar-hold detection for desktop
5. Recording indicator UI (pulsing dot, "Listening...")
6. Transcription → auto-fill input → send

### Step 11: Photo Upload + AI Vision
1. Create `chat-vision.mts` Netlify function (Claude Vision proxy)
2. Add 📎 button to doubt chat input
3. Build image upload UI (camera + gallery options)
4. Image preview in chat
5. Image + text sent to Claude Vision
6. Streaming response rendered in chat
7. System prompt enforces "guide, don't solve" for math problems

### Step 12: Programmatic SVG Diagram Engine
1. Define shape vertex data for all shapes
2. Build `GeometryDiagram` component with configurable props
3. Implement: shape rendering, labels, highlights, angle arcs, parallel marks, equal marks, diagonals
4. Update `DiagramRenderer` to use new engine
5. Verify all 11 diagram types render correctly
6. Remove old individual SVG component files

### Step 13: Doubt Chat Refinement
1. Update doubt chat system prompt (topic-aware, keep-it-short)
2. Ensure doubt chat works from: video screen, concept cards, quiz, completion screen
3. Doubt chat is an overlay/modal (doesn't replace the lesson flow)
4. Chat history per topic persisted

### Step 14: Polish & Integration Testing
1. End-to-end flow test: Landing → Topic → Video → Cards → Quiz → Complete → Next Topic
2. Gamification test: XP adds up, levels work, streaks track, badges award
3. Voice test: TTS plays on cards, STT captures speech
4. Photo test: Upload image → AI responds contextually
5. Mobile responsive test: All screens work on 375px width
6. Error handling: API fails → retry → error message → retry button
7. Run Playwright test suite (see Section 13)

---

## 13. Testing Requirements

### Playwright E2E Tests

Before deploying or pushing any major UI changes, run Playwright tests covering:

#### Critical Flows
1. **Landing → Dashboard**: Enter name → navigate to /learn → see curriculum
2. **Topic Selection**: Click topic → video intro screen appears
3. **Video Screen**: Video renders → skip button works → doubt button works
4. **Concept Cards**: Cards render → Next button advances → progress dots update
5. **Quiz Cards**: Options selectable → Check button works → wrong answer shows hint → correct answer shows celebration
6. **Topic Complete**: Achievement screen renders → XP displayed → Next Topic button works
7. **Navigation**: Sidebar topic switching works → progress persists

#### Component Tests
8. **GeometryDiagram**: Renders all shape types without crashing
9. **Voice toggle**: On/off persists across cards
10. **Photo upload**: File picker opens → image preview renders
11. **Gamification**: XP counter updates → streak displays → badges show

#### Edge Cases
12. **API failure**: Error message appears → retry button works
13. **Empty state**: No topic selected → empty state renders
14. **Mobile viewport**: All screens render at 375px width without overflow
15. **Back navigation**: Browser back doesn't break lesson flow

### How to Run Tests
```bash
# Install Playwright (add to devDependencies)
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run all tests
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui
```

### Test File Location
```
tests/
├── e2e/
│   ├── landing.spec.ts
│   ├── lesson-flow.spec.ts
│   ├── quiz-flow.spec.ts
│   ├── gamification.spec.ts
│   ├── doubt-chat.spec.ts
│   └── mobile-responsive.spec.ts
└── playwright.config.ts
```

---

## 14. File Structure Changes

### New Files to Create

```
src/
├── types/
│   └── lesson.ts                    # LessonTemplate, LessonState types
│   └── gamification.ts              # XP, Level, Badge, Streak types
│
├── data/
│   └── lessonTemplates.ts           # Templates for all 11 topics
│   └── badgeDefinitions.ts          # Badge conditions + metadata
│   └── levelDefinitions.ts          # Level thresholds + titles
│   └── soundMap.ts                  # Sound effect file references
│
├── contexts/
│   └── LessonContext.tsx            # Lesson state machine
│   └── GamificationContext.tsx      # XP, streaks, levels, badges
│
├── hooks/
│   └── useLesson.ts                # Lesson flow management
│   └── useVoice.ts                 # TTS playback
│   └── useVoiceInput.ts            # STT recording
│   └── useGamification.ts          # XP/streak/badge operations
│
├── components/
│   ├── lesson/
│   │   ├── VideoIntro.tsx           # Video intro screen
│   │   ├── ConceptCard.tsx          # Single concept card
│   │   ├── CardFlow.tsx             # Card sequence manager
│   │   ├── QuizCard.tsx             # Full-screen quiz with hints
│   │   ├── QuizTransition.tsx       # "Quiz time!" transition screen
│   │   ├── TopicComplete.tsx        # Achievement screen
│   │   ├── LessonContainer.tsx      # Orchestrates the full lesson flow
│   │   └── DoubtOverlay.tsx         # Floating doubt chat
│   │
│   ├── gamification/
│   │   ├── XPPopup.tsx              # Animated "+20 XP" popup
│   │   ├── LevelUpModal.tsx         # Level up celebration
│   │   ├── BadgeUnlock.tsx          # Badge earned popup
│   │   ├── StreakCounter.tsx        # Fire streak display
│   │   └── ConfettiEffect.tsx       # Confetti animation
│   │
│   ├── voice/
│   │   ├── VoiceToggle.tsx          # 🔊/🔇 toggle button
│   │   ├── VoiceRecordButton.tsx    # 🎤 hold-to-record button
│   │   └── RecordingIndicator.tsx   # Pulsing red dot while recording
│   │
│   ├── upload/
│   │   └── PhotoUpload.tsx          # Camera/gallery upload UI
│   │
│   └── diagrams/
│       └── GeometryDiagram.tsx      # NEW: Programmatic SVG engine
│       # (old individual SVG files to be removed after migration)
│
├── lib/
│   └── audioPlayer.ts              # Audio playback utility
│   └── soundEffects.ts             # Play correct/wrong/levelup sounds
│
netlify/
└── functions/
    ├── chat.mts                     # Existing (Claude text API)
    ├── chat-vision.mts              # NEW: Claude Vision API
    ├── tts.mts                      # NEW: OpenAI TTS API
    └── stt.mts                      # NEW: OpenAI Whisper API

public/
└── sounds/
    ├── correct.mp3
    ├── wrong.mp3
    ├── topic-complete.mp3
    ├── level-up.mp3
    ├── badge-earned.mp3
    ├── streak.mp3
    └── tap.mp3

tests/
├── e2e/
│   ├── landing.spec.ts
│   ├── lesson-flow.spec.ts
│   ├── quiz-flow.spec.ts
│   ├── gamification.spec.ts
│   ├── doubt-chat.spec.ts
│   └── mobile-responsive.spec.ts
└── playwright.config.ts
```

### Files to Modify

```
src/components/layout/AppLayout.tsx     # Render LessonContainer instead of ChatInterface when topic active
src/components/layout/ProgressPanel.tsx  # Add XP, streak, level, badges display
src/components/layout/CurriculumSidebar.tsx  # No major changes (completion checkmarks already work)
src/components/chat/ChatInput.tsx        # Add 🎤 and 📎 buttons for doubt chat
src/components/rich/DiagramRenderer.tsx  # Switch to GeometryDiagram engine
src/data/systemPrompt.ts               # Separate prompts: lesson gen, doubt chat, vision
src/lib/api.ts                          # Add retry logic
src/lib/parseAIResponse.ts             # Fix quiz option parsing (A-F support)
src/contexts/ProgressContext.tsx        # Integrate with gamification
src/App.tsx                            # Add new context providers
netlify/functions/chat.mts             # Add vision endpoint reference, no changes needed here
package.json                           # Add openai, @playwright/test dependencies
.env.example                           # Add OPENAI_API_KEY
```

### Files to Remove (after diagram engine migration)

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

## References & Inspiration

- **Tegore.ai** (tegore.ai) — YC-backed AI math tutor. Uses voice + interactive visuals, dialectic teaching. Developing "Duolingo for Math." Voice output with panda mascot.
- **Khare Classes** (khareclasses.com) — IIT Bombay alumni founded. 100K+ students. Custom AI-driven app, gamification (stars), 5.6 days/week engagement, 46 min/day.
- **Duolingo** — Gold standard for gamification: streaks (3.6x retention), leagues (23% higher completion), XP, hearts. Sound design is critical to engagement.
- **Khanmigo** — Socratic method (never gives answers, guides with questions). 700K+ users.
- **PhysicsWallah (Alakh AI)** — India's most affordable. AI doubt engine resolves 85% queries in real-time.

---

## Summary: What Makes PadhAI v2 Different

1. **Not a chat app** — it's a structured lesson flow with concept cards, like Duolingo but for teaching (not just practice)
2. **Voice-first** — AI speaks in Hinglish, student can speak back
3. **Theory and quiz are separated** — can't cheat by scrolling up
4. **Wrong answers get HINTS, not answers** — Socratic approach builds understanding
5. **Gamification is built in** — XP, streaks, badges, sounds make learning addictive
6. **Photo-based doubt solving** — snap NCERT page or problem → guided help
7. **Video + AI together** — watch intro video, pause to ask AI doubts
8. **Culturally Indian** — Hinglish, real-life examples (cricket, kites, doors), warm didi/bhaiya personality

---

*This document is the single source of truth for PadhAI v2 implementation. All implementation should follow the order and specifications described here.*
