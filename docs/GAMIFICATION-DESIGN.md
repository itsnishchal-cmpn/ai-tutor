# PadhAI v2 — Gamification UI Redesign

> **Date**: April 2026
> **Status**: Design spec — NOT yet implementing
> **Goal**: Transform current white+blue basic UI into a vibrant, Duolingo-inspired gamification UI that kids love
> **Constraint**: All existing functionality stays intact. Layout is being fully rethought — no more 3-column dashboard. Full-screen sequential flow like Duolingo.

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [New App Flow Architecture](#2-new-app-flow-architecture)
3. [New Color System](#3-new-color-system)
4. [Landing Page Redesign](#4-landing-page-redesign)
5. [Top Bar (Replaces Both Sidebars)](#5-top-bar-replaces-both-sidebars)
6. [Progress Path (Full-Screen Home)](#6-progress-path-full-screen-home)
7. [Concept Card Redesign](#7-concept-card-redesign)
8. [Quiz Card Redesign](#8-quiz-card-redesign)
9. [Topic Complete Screen Redesign](#9-topic-complete-screen-redesign)
10. [Gamification Components Upgrade](#10-gamification-components-upgrade)
11. [Doubt Overlay Redesign](#11-doubt-overlay-redesign)
12. [Micro-Interactions & Animations](#12-micro-interactions--animations)
13. [Sound Design System](#13-sound-design-system)
14. [Daily Quests (New Feature)](#14-daily-quests-new-feature)
15. [Implementation Order](#15-implementation-order)
16. [Anti-Patterns to Avoid](#16-anti-patterns-to-avoid)

---

## 1. Current State Assessment

### What exists now (component by component)

| Component | Current State | Problem |
|-----------|--------------|---------|
| **AppLayout** | `bg-gray-50`, 3-column layout, gray borders | Feels like a dashboard, not a game. Sidebars waste space. |
| **CurriculumSidebar** | Flat topic list with checkmarks, blue highlight, always visible in sidebar | No sense of journey. Sidebar takes 280px permanently. |
| **ProgressPanel** | Stats cards in `bg-gray-50`, text-based numbers, always visible in sidebar | Numbers without excitement. Takes 280px. Most info is glanceable — doesn't need a whole panel. |
| **ConceptCard** | White card, brand-600 "Next" button, dot progress | Flat, no depth, no card personality |
| **CardFlow** | Simple opacity transition (200ms) | No slide, no bounce, no life |
| **QuizCard** | White options with blue border on hover, hearts as text | Feels like a form, not a challenge |
| **TopicComplete** | Trophy emoji, green/blue stat boxes | Celebration feels muted |
| **ConfettiEffect** | 40 particles, 2x2px, 7 colors, 3s duration | Too subtle — particles too small |
| **LevelUpModal** | White card, emoji, brand-600 level number | Generic modal, no wow factor |
| **BadgeUnlock** | Same modal pattern as LevelUp | No rarity feel, no glow |
| **StreakCounter** | Fire emoji + `animate-pulse` + number | Minimal — just text with a pulse |
| **XPPopup** | Brand-600 pill, "+X XP", 1.5s visibility | Quick flash, easy to miss |
| **LandingPage** | Gradient bg, white card, feature tags | Clean but forgettable |

### Current color palette

- **Primary**: `#3b82f6` (Tailwind blue-500) — used for everything
- **Background**: `gray-50`, white
- **Borders**: `gray-100`, `gray-200`
- **Text**: `gray-800`, `gray-600`, `gray-500`
- **Success**: `#22c55e` (green-500)
- **Error**: `#ef4444` (red-500)

**The problem**: One blue color does all the heavy lifting. No visual hierarchy between actions, rewards, and content. The gray backgrounds make everything feel corporate, not playful.

---

## 2. New App Flow Architecture

### The Big Shift: Dashboard → Full-Screen Sequential Flow

**Current**: 3-column dashboard (sidebar | content | progress panel) — always visible, always competing for attention. This is how a CRM or admin tool works, not a learning game.

**New**: Full-screen sequential views. Only ONE thing on screen at a time. This is how Duolingo, Khan Academy Kids, and every successful gamified learning app works.

### Screen Flow Diagram

```
┌──────────────┐
│  Landing     │  Name input → Start
│  Page        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Progress    │  Full-screen winding path
│  Path (Home) │  Top bar: XP | Level | Streak | Settings
│              │  Tap a topic node → enters lesson
└──────┬───────┘
       │ (tap node)
       ▼
┌──────────────┐
│  Video Intro │  Full-screen video player
│  (optional)  │  "Start Learning →" or "Skip"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Concept     │  Full-screen card, one at a time
│  Cards       │  Top: progress bar + topic name
│  (1 → N)     │  Bottom: Next / Back / Ask Doubt (FAB)
└──────┬───────┘
       │ (after last card)
       ▼
┌──────────────┐
│  Quiz        │  Full-screen quiz transition
│  Transition  │  "Quiz Time!" → Start Quiz
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Quiz Cards  │  Full-screen, one question at a time
│  (1 → N)     │  Top: quiz progress + hearts
└──────┬───────┘
       │ (after last quiz)
       ▼
┌──────────────┐
│  Topic       │  Full celebration screen
│  Complete    │  Stats, badges, confetti
│              │  "Next Topic →" button
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Progress    │  Back to path — node now green
│  Path (Home) │  Auto-scrolls to next available node
│              │  Next node pulses, inviting tap
└──────────────┘
```

**Doubt Overlay**: Available as a FAB (floating action button) on concept cards, quiz cards, and topic complete. Opens as a bottom sheet / modal overlay on top of any screen.

### What Happens to the 3-Column Layout

| Old Component | What Happens | Where Its Content Goes |
|---------------|-------------|----------------------|
| **AppLayout** (3-col) | **Removed**. Replaced with a single full-width container that switches between views. | New `AppShell` component: just a container with view routing. |
| **CurriculumSidebar** (280px left) | **Removed as sidebar**. Becomes the full-screen Progress Path home view. | New `ProgressPath` component — the home/hub screen. |
| **ProgressPanel** (280px right) | **Removed as sidebar**. Stats move to a compact top bar + the topic complete screen. | New `TopBar` component (always visible, compact). Badge shelf moves to a profile/stats modal accessible from top bar. |

### View Routing

The app has a simple state machine, no URL routing needed (single-page app):

```typescript
type AppView =
  | { screen: 'landing' }
  | { screen: 'home' }                          // Progress Path
  | { screen: 'video-intro'; topicId: string }
  | { screen: 'lesson'; topicId: string }        // Concept Cards
  | { screen: 'quiz-transition'; topicId: string }
  | { screen: 'quiz'; topicId: string }           // Quiz Cards
  | { screen: 'topic-complete'; topicId: string }
```

Transitions between views use full-screen animations:
- **Path → Lesson**: Path zooms out / fades, lesson slides in from right
- **Lesson → Quiz**: Cards slide away, quiz transition fades in
- **Topic Complete → Path**: Celebration fades, path slides in with the completed node now green (animated fill)

### Mobile vs Desktop

Since there are no sidebars, the app is **naturally responsive**:
- Content is always full-width with a `max-w-2xl` (or similar) centered container
- Top bar is always visible (thin, compact)
- Same flow on mobile and desktop — no layout switching needed
- On very wide screens (>1200px), the progress path has more horizontal space for wider zigzag, and cards get more padding. That's it.

---

## 3. New Color System

### Primary Palette (inspired by Duolingo, adapted for PadhAI)

| Role | Name | Hex | Tailwind Override | Usage |
|------|------|-----|-------------------|-------|
| **Primary** | PadhAI Green | `#58CC02` | `brand-500` | Correct answers, progress, primary CTA buttons, "Next" |
| **Primary Dark** | Forest | `#46A302` | `brand-600` | Button hover, active states |
| **Primary Light** | Mint | `#BFF199` | `brand-100` | Success backgrounds, card tints |
| **Secondary** | Sky Blue | `#1CB0F6` | `secondary-500` | Info cards, reading content, links, concept cards |
| **Secondary Light** | Ice | `#DDF4FF` | `secondary-100` | Info backgrounds |
| **Reward** | Sunshine | `#FFC800` | `reward-500` | XP, coins, streaks, stars, achievements |
| **Reward Light** | Cream | `#FFF4CC` | `reward-100` | Reward backgrounds |
| **Error** | Coral Red | `#FF4B4B` | `error-500` | Wrong answers, hearts lost |
| **Error Light** | Blush | `#FFDFE0` | `error-100` | Error backgrounds |
| **Premium** | Royal Purple | `#A855F7` | `premium-500` | Rare badges, legendary items, special achievements |
| **Premium Light** | Lavender | `#F3E8FF` | `premium-100` | Premium backgrounds |

### Neutral Palette

| Role | Hex | Usage |
|------|-----|-------|
| **App Background** | `#F7F7F7` | Main bg — very slightly warm, not cold gray |
| **Card Surface** | `#FFFFFF` | Card backgrounds |
| **Card Border** | `#E5E5E5` | Subtle card borders |
| **Text Primary** | `#3C3C3C` | Headings, body text |
| **Text Secondary** | `#777777` | Labels, captions |
| **Text Disabled** | `#AFAFAF` | Locked/disabled text |
| **Divider** | `#EBEBEB` | Section dividers |

### How to implement

Update `src/index.css` CSS variables and Tailwind config to register these as named colors. Replace `brand-*` usage across all components.

```css
/* Example: new CSS custom properties */
--color-primary: #58CC02;
--color-primary-dark: #46A302;
--color-primary-light: #BFF199;
--color-secondary: #1CB0F6;
--color-reward: #FFC800;
--color-error: #FF4B4B;
--color-premium: #A855F7;
```

### Visual contrast rules
- Primary buttons: `bg-primary text-white` with `shadow-md` for depth
- Cards: white bg with `shadow-sm` and subtle border — they should feel *lifted*
- Locked items: grayscale + reduced opacity (40%)
- Active/current items: colored border or glow ring

---

## 4. Landing Page Redesign

**File**: `src/components/landing/LandingPage.tsx`

### Current
- Gradient from brand-50 to blue-50
- GraduationCap icon in blue circle
- White input card
- Text-based feature badges

### New Design

**Background**: Warm gradient from `#F0FFF0` (mint) via white to `#FFF8E1` (cream). Subtle floating geometric shapes (triangles, squares, circles) as decorative SVG elements that slowly drift/rotate (CSS animation).

**Logo Area**:
- Replace GraduationCap with a **custom mascot or playful logo**. If no mascot yet, use a rounded, bouncy geometric character (think: a friendly quadrilateral with eyes — fits the math theme).
- "PadhAI" in bold with the "AI" suffix in `reward-500` (golden).
- Subtitle: Keep "Your AI Math Tutor" but add a playful tagline underneath: "Learn, Play, Master!"

**Input Card**:
- Rounded-2xl with a thicker left border in gradient (green to blue) — gives a "card" feel.
- Replace "Welcome!" with "Ready to Play?" or "Let's Start!"
- Input field: rounded-full with a green focus ring (not blue).
- "Start Learning" button: `bg-primary` (green), rounded-full, larger padding, with a subtle `shadow-lg` and a **bounce on hover** (scale 1.05).
- Add a small sparkle/star animation near the button.

**Feature Badges**: Replace text badges with **illustrated mini-cards** in a horizontal scroll:
- Each card has an icon (in a colored circle) + short text
- "AI Tutor" (blue circle + bot icon), "Quizzes" (green circle + target icon), "Voice" (purple circle + mic icon), "XP & Badges" (gold circle + trophy icon)

---

## 5. Top Bar (Replaces Both Sidebars)

**New file**: `src/components/layout/TopBar.tsx` (replaces `ProgressPanel.tsx` as the stats display)

The top bar is a thin, always-visible strip that shows key stats at a glance. It replaces the 280px progress panel sidebar entirely.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  PadhAI    🔥 4    ⭐ 680 XP    Lv.5 Angle Master   ⚙️  │
└──────────────────────────────────────────────────────────┘
```

**Height**: 48-56px. Compact. Never takes more than one row.

**Left**: App logo/name ("PadhAI" in bold, "AI" in gold). On lesson screens, this becomes a "← Back" button that returns to the progress path (with confirmation if mid-lesson).

**Center/Right — Key Stats** (always visible):
- **Streak**: SVG flame icon + day count (see StreakCounter upgrade in section 10)
- **XP**: Star/sparkle icon + total XP number (reward-500 gold color)
- **Level**: Colored pill badge: "Lv.5" with level title on hover/tap

**Far Right**:
- **Settings gear icon** — opens a dropdown/modal with:
  - Sound toggle (on/off)
  - Voice toggle (on/off)
  - Voice selector dropdown
  - Badge shelf / "My Achievements" (full badge grid with earned/locked)
  - Daily quests panel
  - Reset progress (danger zone, hidden in submenu)

### Behavior on Different Screens

| Screen | Top Bar State |
|--------|--------------|
| **Landing Page** | Hidden — landing is its own full-screen experience |
| **Progress Path (Home)** | Full top bar with all stats |
| **Lesson (Cards)** | Logo becomes "← Back to Path". Stats still visible. Add topic name + card progress (e.g., "Parallelogram — Card 3/5") |
| **Quiz** | Logo becomes "← Back to Path". Stats visible. Add quiz progress + hearts (e.g., "Quiz 2/3 ❤️❤️❤️") |
| **Topic Complete** | Full top bar — stats update live (XP counter animates up, streak flame pulses) |

### What Moves Where (from old ProgressPanel)

| Old ProgressPanel Content | New Location |
|--------------------------|-------------|
| User name | Top bar (or removed — not critical) |
| XP / Level | Top bar — always visible |
| Streak | Top bar — always visible |
| Accuracy % | Topic Complete screen stats |
| Badge grid | Settings dropdown → "My Achievements" modal |
| Voice selector | Settings dropdown |
| Sound toggle | Settings dropdown |
| Encouragement text | Removed — celebrations replace this |
| Reset button | Settings dropdown (hidden) |

### Mobile
- Same top bar, slightly more compact
- Stats can abbreviate: "🔥4" "⭐680" "Lv5"
- Settings icon opens a full bottom-sheet instead of dropdown

---

## 6. Progress Path (Full-Screen Home)

**New file**: `src/components/path/ProgressPath.tsx` (replaces `CurriculumSidebar.tsx`)

This is the **primary home screen** of the app. Not a sidebar — a full-screen, scrollable map. This is what the user sees after landing page, and what they return to after completing each topic.

### Visual Design

```
┌──────────────────────────────────────────────────────────┐
│  PadhAI    🔥 4    ⭐ 680 XP    Lv.5 Angle Master   ⚙️  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│           Ch 3: Understanding Quadrilaterals             │
│                                                          │
│                    ╭───╮                                 │
│               ┌────┤ ✓ ├────┐   "Intro to Polygons"     │
│               │    ╰───╯    │                            │
│               │      │      │                            │
│            ···│······│······│···  (graph paper bg)       │
│               │      │      │                            │
│               │    ╭───╮    │                            │
│               └────┤ ✓ ├────┘   "Angle Sum Property"    │
│                    ╰───╯                                 │
│                      │                                   │
│                      │                                   │
│                    ╭───╮                                 │
│          ┌─────────┤ ◉ ├─────────┐  "Parallelogram"    │
│          │  ✨glow  ╰───╯  ✨     │   ← CURRENT (large) │
│          └─────────────────────────┘                     │
│                      │                                   │
│                    ╭───╮                                 │
│               ┌────┤ ○ ├────┐   "Rhombus"  (available)  │
│               │    ╰───╯    │                            │
│               │      │      │                            │
│            🔺 │      │      │ △  (decorative shapes)    │
│               │      │      │                            │
│               │    ╭───╮    │                            │
│               └────┤ 🔒├────┘   "Rectangle" (locked)    │
│                    ╰───╯                                 │
│                      │                                   │
│                      ⋮                                   │
│                                                          │
│        ┌──────────────────────────┐                      │
│        │  🎯 Daily Quests  2/3   │  (floating card,     │
│        │  ══════════════════════  │   bottom of screen)  │
│        │  ✅ Complete 2 lessons   │                      │
│        │  ⬜ Perfect quiz         │                      │
│        └──────────────────────────┘                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Node Design (larger and more detailed than sidebar version)

Since this is full-screen, nodes can be bigger and more expressive:

| State | Visual | Size | Details |
|-------|--------|------|---------|
| **Completed** | Filled circle + white checkmark + green glow | 56px | Green (#58CC02). Topic name below in green. Crown icon if mastered (perfect quiz). |
| **Current** | Filled circle + topic icon + pulsing glow ring + "Start" label | 72px (largest) | Blue (#1CB0F6) with animated glow. Draws attention. Slightly bounces on idle. |
| **Available** | Outlined circle, bright, topic icon inside | 56px | Blue outline. Topic name below. Tappable — starts the topic. |
| **Locked** | Gray filled circle + lock icon | 48px | Gray (#CFCFCF). Topic name in gray. Not tappable. Shows "Complete [previous topic] to unlock" on tap. |

### Connecting Path

- SVG `<path>` elements with bezier curves creating a winding trail
- **Completed segments**: Thick (4px) solid green line
- **Current → next**: Animated dashed line (green dashes march forward using `stroke-dashoffset` CSS animation — creates a "flowing" effect suggesting progress)
- **Locked segments**: Thin (2px) gray dashed line
- Path zigzags left-center-right as it goes down, creating visual rhythm

### Decorative Elements (Math Theme)

Small, subtle, non-interactive decorations placed alongside the path:
- Tiny geometric shapes (triangles, squares, pentagons, hexagons) in muted pastel colors
- Small icons: rulers, protractors, pencils, compasses — scattered like scenery in a game world
- After every 3-4 nodes: a **milestone marker** (small flag or star)
- After the final node: a **trophy/castle** representing chapter completion
- Background: very subtle graph paper grid pattern (fits math theme, doesn't distract)

### Scroll & Auto-Focus

- On load: auto-scroll to center the **current node** in the viewport
- Smooth scroll (CSS `scroll-behavior: smooth`)
- After topic complete → return to path: scroll animation moves to the newly completed node, node fills green (animated), then auto-scrolls down to the next available node which starts pulsing

### Section Headers

If the chapter has sections (e.g., "Types of Quadrilaterals", "Special Properties"), show them as:
- Horizontal divider lines across the path
- Section name in a small rounded pill: "Section 2: Special Quadrilaterals"
- These break up the path visually and give context

### Tapping a Node

| Node State | On Tap |
|-----------|--------|
| **Completed** | Opens a mini-summary card: key points, quiz score, "Review Again?" button. Review re-opens the lesson in read-only mode. |
| **Current** | Navigates to Video Intro (if available) or directly to Concept Cards. Full-screen transition animation. |
| **Available** | Same as Current — starts the lesson. |
| **Locked** | Shows a small tooltip/popover: "Complete [previous topic] first!" with a pointing arrow to the prerequisite node. |

### Daily Quests Widget

A floating card at the bottom of the progress path screen (not blocking the path, positioned after the last visible node or as a sticky bottom element):
- Collapsible: shows "🎯 Daily Quests 2/3" in collapsed state
- Tap to expand: shows all 3 quests with progress bars
- See section 14 for full quest design

### Implementation Approach

- `ProgressPath.tsx` — main component, renders SVG path + node components
- `PathNode.tsx` — individual node component (accepts state, position, topic data)
- Path coordinates: calculate x,y positions based on node index and a zigzag pattern function
- SVG for path lines, HTML for node content (positioned absolutely over the SVG)
- Framer Motion or CSS transitions for node state animations
- `useRef` + `scrollIntoView` for auto-scroll behavior

---

## 7. Concept Card Redesign

**Files**: `src/components/lesson/ConceptCard.tsx`, `src/components/lesson/CardFlow.tsx`

### Current
- White background, flat
- Small dot progress indicator (2x2px dots)
- Text centered, max-w-lg
- Basic brand-600 "Next" button
- Simple opacity transition between cards

### New Design

**Card Container**:
- White background with `rounded-2xl`, `shadow-md`, and a **colored top border** (4px) that matches the topic's color category:
  - Intro topics: blue
  - Shape topics: green
  - Summary/review: purple
- Subtle inner padding increase (p-6 → p-8) for more breathing room
- Card should feel *elevated* — like a physical card on a table

**Progress Indicator** (replace dots):
- **Segmented progress bar** at the very top of the card (full width, inside the rounded corners)
- Each segment represents a card
- Completed segments: filled green
- Current segment: filling with animated green (pulse/shimmer)
- Upcoming segments: light gray
- Height: 4px, subtle but always visible

**Card Type Badges**: Small pill badge in top-left corner of card:
- "Hook" card: amber pill with lightbulb icon — "Did you know?"
- "Concept" card: blue pill with book icon — "Concept"
- "Formula" card: purple pill with function icon — "Formula"
- "Example" card: green pill with pencil icon — "Example"

**Content Area**:
- Diagram section: Slightly rounded container with `bg-gray-50` background, giving diagrams a "canvas" feel
- Text: Slightly larger (text-xl on desktop), with **key terms in bold + primary color** for emphasis
- Add subtle quotation-style formatting for the Hinglish text (left border accent)

**Voice Indicator**:
- Replace plain text with an **animated speaker icon** in the top-right
- While speaking: sound wave bars animate (3 bars, different heights, like an equalizer)
- Muted state: speaker icon with a slash, gray

**Navigation Buttons**:
- "Next" button: `bg-primary` GREEN (not blue), rounded-xl, with right arrow icon, **larger** (py-4 px-8)
  - Hover: scale to 1.03, shadow increases
  - Active/press: scale to 0.97 (physical press feel)
- "Back" button: outlined style (border-gray-300, text-gray-600), smaller than Next
- "Ask Doubt" button: amber/orange pill style with speech bubble icon — floats at bottom-right corner as a **FAB (Floating Action Button)**, always visible

**Full-Screen Layout** (no sidebars, card gets the whole viewport):
- Card is centered in viewport with `max-w-2xl`, generous vertical padding
- Top bar visible above with topic name + card progress
- Card container takes remaining height (`flex-1`)
- Diagram gets more space since there are no sidebars competing for width
- On mobile: card fills the screen naturally, no change needed

**Card Transitions** (upgrade CardFlow):
- **Slide + fade**: New card slides in from right (translateX: 100% → 0) while old card slides left (0 → -100%) over 300ms
- Use `ease-out` curve for natural feel
- Slight scale effect: incoming card starts at scale 0.95 and grows to 1.0
- Going back: reverse direction (slide from left)

---

## 8. Quiz Card Redesign

**File**: `src/components/lesson/QuizCard.tsx`

### Current
- White card, blue-bordered options on hover
- Hearts as text counter
- Feedback in colored boxes (green-50, amber-50, blue-50)
- Standard button styling

### New Design

**Quiz Header**:
- Replace plain text "Quiz 1/3" with a **challenge banner**:
  - Gradient background (secondary-500 to primary-500)
  - White text: "Challenge 1 of 3"
  - Target/crosshair icon
- Hearts display: Replace text hearts with **animated heart icons**
  - Full hearts: red, slight pulse animation
  - Lost heart: plays a crack + shatter micro-animation (heart splits, pieces fall), then turns gray
  - 3 hearts displayed as actual heart SVGs in a row

**Question Area**:
- Question text in a card with `bg-secondary-100` (ice blue) background
- Slightly larger text (text-lg)
- Voice icon animates while question is read aloud

**Answer Options** — make them feel like **game buttons**:
- Each option is a rounded-xl card with:
  - Left color accent bar (4px, unique color per option: A=red, B=blue, C=yellow, D=green — Kahoot style)
  - Option letter in a colored circle on the left
  - Option text in medium weight
  - `shadow-sm` for depth
- **Hover**: scale 1.02, shadow-md, border color intensifies
- **Press**: scale 0.98 (click feel)
- **Selected** (before checking): thick colored border, slight glow
- **Disabled** (wrong on previous attempt): reduced opacity (40%), crossed-out text, no hover effect

**Feedback States** — make celebrations and errors feel significant:

**Correct Answer**:
- Entire card background flashes green briefly (200ms)
- Selected option: green border + animated checkmark (SVG path draws itself)
- **Confetti mini-burst** (15-20 particles, just in the card area, not full screen)
- "+20 XP" pops up and floats to the XP counter position
- "Sahi Jawab!" text bounces in (scale 0 → 1.1 → 1.0)
- If combo (2+ correct in a row): show "2x Combo!" text in reward-500 color

**Wrong Answer (Hints)**:
- Selected option: shakes horizontally (translateX oscillation, 300ms) + red border
- Card does NOT turn fully red — just the option shakes
- Hint appears below in a warm amber card (`bg-reward-100`) with a lightbulb icon
- "Try Again" button: outlined orange, not the primary green — differentiates from success

**Answer Revealed (3 wrong)**:
- Correct option highlighted with green border + glow
- Explanation in a blue info card (`bg-secondary-100`)
- Empathetic text — no "you failed", instead: "Koi baat nahi! Yeh yaad rakhna..."
- "No XP" shown in muted gray text (small, not emphasized)

**Check Button**:
- Large, centered, `bg-primary` green
- Disabled until an option is selected (gray, no shadow)
- Once selected: button becomes active with a subtle bounce animation

---

## 9. Topic Complete Screen Redesign

**File**: `src/components/lesson/TopicComplete.tsx`

### Current
- Trophy emoji, green box with checkmarks, two stat boxes, basic buttons

### New Design: Full Celebration Screen

**Background**: The entire screen gets a **radial gradient burst** emanating from center (reward-100 → white at edges). Subtle particle effects (stars/sparkles) floating upward continuously.

**Trophy Section**:
- Replace emoji with an **animated SVG trophy**:
  - Trophy scales from 0 → 1.2 → 1.0 (bounce in) over 600ms
  - Golden glow pulsing behind it
  - Small sparkle particles around the trophy
- "Topic Complete!" text: large (text-3xl), bold, slides up from below with a bounce

**Stats Display** — redesign as **achievement cards in a row**:
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  ✨ XP   │  │  🔥 Streak│  │  🎯 Quiz │
│          │  │          │  │          │
│  +120    │  │  4 days  │  │  3/3     │
│ ████████ │  │ ████░░░░ │  │ ████████ │
└──────────┘  └──────────┘  └──────────┘
```
- Each stat card has:
  - Colored icon at top (green for XP, orange for streak, blue for quiz)
  - Large number that **counts up from 0** to the actual value (number roll animation, 1 second)
  - Mini progress bar at bottom
  - Card has colored top border matching its theme

**Key Points Section**:
- Each key point **slides in sequentially** (staggered, 200ms apart)
- Checkmark icon draws itself (SVG path animation) as each point appears
- Background: subtle green tint

**Badge Award** (if applicable):
- Badge slides in from above with a glow
- Rarity border treatment (bronze/silver/gold/purple)
- "New Badge Unlocked!" text with sparkle effect
- Badge rarity text: "Only 15% of learners have this!"

**Action Buttons**:
- "Next Topic" button: Large, `bg-primary` green, with right arrow, **elevated** with shadow-lg
  - The topic name is shown on the button: "Next: Rhombus →"
- "Ask Doubts" button: outlined style, speech bubble icon
- Small gap between them, centered

**Confetti**: Full-screen confetti burst on load. Bigger particles than current (4x4px), more of them (80+), longer duration (4 seconds). Multiple colors from the new palette.

---

## 10. Gamification Components Upgrade

### 8.1 ConfettiEffect

**File**: `src/components/gamification/ConfettiEffect.tsx`

**Current**: 40 particles, 2x2px, 7 colors, 3s
**New**:
- **80 particles** for full celebrations, 25 for mini (quiz correct)
- **Varied shapes**: mix of squares (4x4px), circles (3px radius), and rectangles (2x6px) — adds visual variety
- **Colors**: Use new palette colors (`#58CC02`, `#1CB0F6`, `#FFC800`, `#FF4B4B`, `#A855F7`, `#FFD700`)
- **Physics**: Particles should have slight horizontal drift (not just straight down), random rotation speed, and slight size variation
- **Duration**: 4 seconds for full, 2 seconds for mini
- **Gravity**: Particles should accelerate downward (ease-in on Y axis), not constant speed
- Accept a `size` prop: `'mini'` | `'full'` to control particle count and spread

### 8.2 XPPopup

**File**: `src/components/gamification/XPPopup.tsx`

**Current**: Brand-600 pill, 1.5s, simple fade
**New**:
- Background: `reward-500` (golden) instead of blue
- Text: white, bold, slightly larger
- **Animation**:
  1. Pops in with scale bounce (0 → 1.2 → 1.0) over 300ms
  2. Holds for 1 second
  3. **Flies toward the XP counter** in the progress panel (animated position change using absolute coordinates) over 500ms
  4. On arrival, XP counter briefly glows/pulses
- **Stacking**: If multiple XP events happen rapidly (e.g., card complete + quiz correct), stack them vertically with staggered timing
- Add a small star/sparkle icon next to the "+" text

### 8.3 LevelUpModal

**File**: `src/components/gamification/LevelUpModal.tsx`

**Current**: White card, emoji, brand text, 3s auto-dismiss
**New**:
- **Background**: dark overlay (`bg-black/60`) with a radial glow in reward-500 color emanating from center
- **Card**: Rounded-3xl, wider (max-w-md), with a gradient border (green → blue → purple)
- **Animation sequence** (don't auto-dismiss — require user tap):
  1. Background dims (200ms)
  2. Radial light burst from center (golden, fades quickly)
  3. "LEVEL UP!" text zooms in with bounce (scale 0 → 1.3 → 1.0)
  4. Level number counter rolls from old level → new level
  5. Level title fades in below
  6. New abilities/unlocks listed (if any)
  7. Sparkle particles float upward around the card
- **Button**: "Continue" in primary green, user must tap to dismiss
- **Sound**: Distinct level-up fanfare

### 8.4 BadgeUnlock

**File**: `src/components/gamification/BadgeUnlock.tsx`

**Current**: Same as LevelUpModal pattern, 3s auto-dismiss
**New**:
- Similar overlay treatment to LevelUpModal
- Badge icon is larger (80x80px rendered) with **rarity-based border**:
  - Common badges: bronze ring
  - Rare badges (7-day streak, Quick Learner): silver ring + subtle shine animation (linear-gradient sweep)
  - Epic badges (Shape Master, Chapter Champion): gold ring + glow
  - Legendary (PadhAI Pro): animated prismatic/rainbow border + particle effects
- "New Badge Unlocked!" text with trophy icon
- Badge name and description
- Rarity label: "Common" / "Rare" / "Epic" / "Legendary" in appropriate color
- Optional: "X% of learners have this" rarity stat
- **Sound**: Badge unlock chime (different from level-up)

### 8.5 StreakCounter

**File**: `src/components/gamification/StreakCounter.tsx`

**Current**: Fire emoji + animate-pulse + number text
**New**:
- Replace emoji with an **SVG flame icon** that can be styled and animated:
  - Constant subtle flicker (scale Y oscillation between 0.95 and 1.05, CSS keyframes, 1.5s loop)
  - Color intensifies with streak length:
    - 1-2 days: orange (#FF9500)
    - 3-6 days: deep orange (#FF6B00)
    - 7-13 days: red-orange (#FF3B00) + slight glow
    - 14-29 days: red (#FF0000) + stronger glow
    - 30+ days: blue flame (#1CB0F6) + particle sparks (special!)
- Number display: bold, larger text, with a subtle background circle
- On streak increment (first activity of the day):
  - Flame grows to 1.5x scale, then settles back
  - Number counter rolls up (+1)
  - Small celebratory burst of sparks around the flame
  - "Streak maintained!" toast appears briefly
- **Milestone celebrations** (7, 14, 30, 60, 100 days): trigger a special modal similar to BadgeUnlock

---

## 11. Doubt Overlay Redesign

**File**: `src/components/lesson/DoubtOverlay.tsx`

### Current
- Standard modal/bottom-sheet
- Brand-600 user bubbles, white AI bubbles
- Red recording mode
- Basic input bar

### New Design

**Container**: Keep bottom-sheet on mobile, modal on desktop. But:
- Add a **gradient header bar** (secondary-500 to primary-500) with "Ask PadhAI" in white
- Rounded-t-3xl on mobile for more modern feel

**Message Bubbles**:
- User messages: `bg-primary` (green), white text, rounded-2xl with tail on right
- AI messages: white bg, gray-800 text, rounded-2xl with tail on left, subtle shadow-sm
- Add small avatar icons: user initial circle (green) and PadhAI bot icon (blue circle)

**Recording Mode**: Keep red theme but make it more polished:
- Pulsing red ring around the mic icon (expanding ring animation)
- Waveform bars: use primary color instead of generic (or red during recording)
- Cancel button: outlined red, "Stop" button: solid red

**Input Bar**:
- Rounded-full input field (not rectangular)
- Green send button (circular, with arrow icon)
- Mic button: circular, gray, with pulse hint animation when idle ("hold to speak")
- Attachment button: small, subtle

---

## 12. Micro-Interactions & Animations

### Button Press Effects (Global)

Apply to ALL clickable elements:

```css
/* Press effect */
.btn-press {
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}
.btn-press:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.btn-press:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
```

### Progress Bar Fills (Global)

All progress bars should:
- Animate fill over 400-600ms with `ease-out`
- At 100%: white shimmer sweep (linear-gradient animation moving left to right)
- Never jump — always smooth transition

### Card Entrance Animations

- **Concept cards**: slide from right + scale up (0.95 → 1.0) over 300ms
- **Quiz options**: stagger in from bottom, 100ms apart per option
- **Stat cards**: stagger in with fade + slide up, 150ms apart
- **Badges**: pop in with scale bounce (0 → 1.1 → 1.0)

### Correct Answer Celebration (Quiz)

Sequence (all within ~1.5 seconds):
1. Selected option flashes green (100ms)
2. Checkmark SVG draws itself inside the option (300ms)
3. Mini confetti burst from the option area (2s, 20 particles)
4. "+20 XP" pops up above the card and floats upward (800ms)
5. Combo text appears if applicable ("3x Combo!" in reward color)
6. Card transitions to feedback state

### Wrong Answer Feedback (Quiz)

Sequence (all within ~800ms):
1. Selected option shakes horizontally (300ms, 5 oscillations)
2. Option turns red-bordered (200ms)
3. Brief red flash on option only (100ms)
4. Heart break animation on one heart (crack + gray, 400ms)
5. Transition to hint display

### Topic Complete Celebration

Sequence (over ~3 seconds):
1. Screen dims slightly
2. Trophy bounces in from top (scale 0 → 1.2 → 1.0), 600ms
3. "Topic Complete!" text slides up with bounce, 400ms
4. Full confetti burst starts (80 particles, 4s)
5. Stat cards stagger in (count-up numbers), 200ms apart
6. Key points slide in sequentially, 200ms apart
7. Badge (if earned) slides in last with glow

### Number Count-Up Animation

For stat displays (XP, accuracy %, quiz score):
- Number counts from 0 to final value over 1 second
- Use `ease-out` — fast at start, slows at end
- Increment by whole numbers (no decimals mid-count)

---

## 13. Sound Design System

### Sound Inventory

| Event | Sound Character | Duration | File Name |
|-------|----------------|----------|-----------|
| Card advance (Next) | Soft click/tap | 100ms | `tap.mp3` |
| Correct answer (1st try) | Bright ascending chime | 500ms | `correct.mp3` |
| Correct answer (2nd-3rd) | Softer positive tone | 400ms | `correct-soft.mp3` |
| Wrong answer | Low, gentle "bonk" | 300ms | `wrong.mp3` |
| Topic complete | Celebratory fanfare | 2s | `complete.mp3` |
| Level up | Grand achievement jingle | 2.5s | `levelup.mp3` |
| Badge earned | Sparkling unlock sound | 1.5s | `badge.mp3` |
| Streak maintained | Fire whoosh | 800ms | `streak.mp3` |
| XP gained | Coin/point collection | 300ms | `xp.mp3` |
| Quiz start | Exciting buildup | 1s | `quiz-start.mp3` |
| Button press | Subtle click | 50ms | `click.mp3` |
| Combo (3+) | Ascending multi-tone | 600ms | `combo.mp3` |

### Sound Design Principles
- All sounds under 2.5 seconds
- Ascending tones = positive, descending = negative
- Nothing harsh or startling — this is for kids
- Combo/streak sounds should escalate in pitch with higher combos
- **Mute toggle** must be easy to find and persistent (localStorage)
- Sound volume: 60-70% max (not full blast)
- File format: MP3 for compatibility, keep files small (<50KB each)
- Source sounds from free libraries (Mixkit, Freesound) or generate with simple synth tools

---

## 14. Daily Quests (New Feature)

### What It Is

3 daily objectives that refresh every 24 hours. Proven to increase daily active usage by ~25% (Duolingo data).

### Quest Types

| Quest | Description | Reward |
|-------|-------------|--------|
| **Complete X Lessons** | "Complete 2 lessons today" | +30 XP |
| **Perfect Quiz** | "Get all answers right in a quiz (1st attempt)" | +25 XP |
| **X Correct in a Row** | "Get 5 answers correct in a row" | +20 XP |
| **Review a Topic** | "Revisit any completed topic" | +15 XP |
| **Ask a Doubt** | "Ask PadhAI a question" | +10 XP |
| **Streak Keeper** | "Maintain your streak today" | +10 XP |

Each day, randomly pick 3 from the pool (always include 1 easy, 1 medium, 1 challenging).

### UI Design

**On Progress Path** — a floating collapsible card at the bottom of the home screen (also accessible from Settings in top bar):

```
┌─────────────────────────────────┐
│  🎯 Daily Quests     2/3 done  │
│─────────────────────────────────│
│                                 │
│  ✅ Complete 2 lessons   +30 XP│
│  ████████████████████  2/2     │
│                                 │
│  ⬜ Perfect Quiz         +25 XP│
│  ░░░░░░░░░░░░░░░░░░░  0/1     │
│                                 │
│  ✅ Ask a doubt          +10 XP│
│  ████████████████████  1/1     │
│                                 │
│  ⏰ Resets in 6h 23m           │
└─────────────────────────────────┘
```

- Each quest: icon + description + XP reward + mini progress bar
- Completed quests: green checkmark, filled bar, strikethrough or green tint
- In-progress: partial bar fill
- Not started: empty bar
- Refresh countdown at bottom
- When a quest completes: quest card flashes green, "+X XP" floats up

### Data Structure

```typescript
interface DailyQuest {
  id: string;
  type: 'complete_lessons' | 'perfect_quiz' | 'correct_streak' | 'review_topic' | 'ask_doubt' | 'streak_keeper';
  description: string;
  target: number;
  progress: number;
  reward: number; // XP
  completed: boolean;
}

// Stored in localStorage
interface DailyQuestsState {
  quests: DailyQuest[];
  generatedDate: string; // "2026-04-08"
  completedToday: number;
}
```

### Integration Points
- `GamificationContext` checks quest progress on every XP-earning action
- Quest completion triggers XPPopup + mini celebration
- All 3 quests completed → bonus confetti + "All Quests Done!" toast

---

## 15. Implementation Order

The layout change (removing sidebars, going full-screen) must happen FIRST because everything else depends on it.

### Phase 1: Layout Revolution (Do First — This Changes Everything)

1. **New color system** — Update CSS variables in `src/index.css`. Define new palette (primary green, secondary blue, reward gold, error red, premium purple). Replace all `brand-*` usage.
2. **New AppShell** — Replace the 3-column `AppLayout.tsx` with a single full-width container + view state machine. Wire up `AppView` type and screen transitions.
3. **TopBar** — New `TopBar.tsx` replacing both sidebars' info. Compact strip: logo, streak, XP, level, settings dropdown. Visible on all screens except landing.
4. **Full-screen Progress Path** — New `ProgressPath.tsx` + `PathNode.tsx`. Winding SVG path with nodes. This becomes the home screen. Remove `CurriculumSidebar.tsx` from the layout.
5. **Remove ProgressPanel from layout** — Move badge shelf, voice selector, sound toggle into settings dropdown. Move stats to top bar + topic complete screen. Delete or archive `ProgressPanel.tsx`.
6. **Global animation utilities** — Add reusable CSS keyframes and utility classes (bounce-in, slide-in-right, fade-up, count-up, shimmer, press-effect).

**After Phase 1**: App flow works end-to-end with new layout. User sees path → taps node → sees lesson → completes → returns to path. No sidebars.

### Phase 2: Core Learning UI

7. **ConceptCard redesign** — New card styling (colored top border, segmented progress bar, type badges, bigger text). Full-screen card layout.
8. **CardFlow transitions** — Replace opacity fade with slide + scale transitions between cards.
9. **QuizCard redesign** — Kahoot-style colored options, animated SVG hearts, celebration on correct, shake on wrong.
10. **QuizTransition** — More exciting "Quiz Time!" screen with animation.
11. **LandingPage refresh** — New colors, playful elements, floating geometric decorations, green CTA.

### Phase 3: Celebrations & Feedback

12. **ConfettiEffect upgrade** — Bigger particles, varied shapes, two sizes (mini for quiz correct, full for topic complete).
13. **XPPopup upgrade** — Golden color, fly-to-counter animation in top bar.
14. **TopicComplete redesign** — Full celebration screen with count-up stats, animated trophy, staggered reveals.
15. **LevelUpModal redesign** — Grand animation with radial burst, no auto-dismiss.
16. **BadgeUnlock redesign** — Rarity borders, glow effects, rarity labels.

### Phase 4: Polish & Enhancements

17. **StreakCounter upgrade** — SVG flame with intensity scaling, milestone celebrations.
18. **Sound effects** — Source audio files, integrate at all trigger points (correct, wrong, complete, level up, etc.).
19. **DoubtOverlay polish** — Gradient header, rounded bubbles, better recording UI.
20. **Daily Quests** — New feature: quest generation, tracking, floating widget on progress path.
21. **View transition animations** — Polish screen-to-screen transitions (path → lesson, lesson → quiz, topic complete → path).

---

## 16. Anti-Patterns to Avoid

These are firm rules, not suggestions:

| Do NOT | Why | Instead |
|--------|-----|---------|
| Guilt-trip in notifications ("PadhAI is sad you left!") | Kids can't distinguish manipulation from social cues | Use encouraging language: "Ready to continue?" |
| Auto-dismiss important celebrations | Users need time to feel rewarded | Require tap/click to dismiss level-up and badges |
| Use harsh buzzer sounds for wrong answers | Creates anxiety, discourages risk-taking | Use gentle, neutral "try again" sounds |
| Show "0 XP" prominently on failed questions | Emphasizes failure over learning | Show it small and muted, focus on the explanation |
| Make leaderboard mandatory | Some kids get anxious with competition | If added later, make it opt-in |
| Lock core learning behind gamification | Learning is the goal, not the game | Gamification decorates; it never blocks |
| Use infinite scroll / auto-advance | No natural stopping point leads to compulsive use | Always require tap to advance, suggest breaks |
| Over-animate everything | Too much motion = sensory overload + performance issues | Keep animations short (<1s for micro, <3s for celebrations) |
| Use neon/fluorescent colors on large areas | Causes eye fatigue in extended sessions | Use vibrant but not garish — test on screens kids actually use |
| Reset all streak progress permanently | Streak anxiety > streak motivation if stakes are too high | Offer streak freeze, show "longest streak" as permanent achievement |

---

## Summary of What Changes vs What Stays

### Layout Changes (Architectural)
- **3-column dashboard → Full-screen sequential flow** (the biggest change)
- **CurriculumSidebar → Full-screen Progress Path** (the home screen)
- **ProgressPanel → Compact Top Bar** (48px strip) + Settings dropdown + Topic Complete stats
- **AppLayout → AppShell** with view state machine (landing → path → lesson → quiz → complete → path)
- Naturally responsive — no layout switching between mobile/desktop

### Visual Changes
- Color palette: single blue → 5-color system (green/blue/gold/red/purple)
- All component styling: depth, shadows, rounded corners, colored accents
- Card transitions: opacity → slide + scale + bounce
- Gamification visuals: bigger confetti, golden XP, animated SVG flames, rarity badge borders
- Progress path: winding game trail with node states, decorations, animations
- Feedback: 4-tier celebration hierarchy (small → medium → large → epic)
- New: daily quests, sound effects, combo counters

### Stays Exactly The Same
- All functionality (lesson flow, quiz logic, doubt chat, voice, photo upload)
- All data structures and localStorage persistence
- All API integrations (Claude, OpenAI TTS/STT)
- All hooks, contexts, and state management logic
- Curriculum data (11 topics, 1 chapter)
- XP values, level thresholds, badge conditions
- Lesson generation, quiz generation, doubt chat behavior

### Files That Get Removed/Archived
- `src/components/layout/AppLayout.tsx` — replaced by new `AppShell.tsx`
- `src/components/layout/CurriculumSidebar.tsx` — replaced by `ProgressPath.tsx`
- `src/components/layout/ProgressPanel.tsx` — split into `TopBar.tsx` + settings modal

### New Files Created
- `src/components/layout/AppShell.tsx` — Full-screen view container + state machine
- `src/components/layout/TopBar.tsx` — Compact stats bar
- `src/components/path/ProgressPath.tsx` — Full-screen winding path (home screen)
- `src/components/path/PathNode.tsx` — Individual path node component
- `src/components/layout/SettingsModal.tsx` — Settings dropdown (badges, sound, voice, etc.)
