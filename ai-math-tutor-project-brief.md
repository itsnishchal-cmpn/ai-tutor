# AI Math Tutor for Indian Students — Complete Project Brief

> This document captures the full brainstorming, market research, product vision, technical architecture, and prototype specification for an AI-powered math tutoring product targeting Indian students from Class 6 to Class 12. Use this as the single source of truth when building the prototype in Claude Code.

---

## 1. Why We Are Doing This

### The Problem
One-on-one math tutoring in India is expensive and inconsistent:
- In Bangalore (Tier 1): ~₹800 per session / ~₹9,600/month (3 sessions/week)
- In Tier 2 cities: ~₹400-500 per session / ~₹5,000-6,000/month
- Batch coaching classes (₹200-400/month) offer zero personalization
- Quality tutors are scarce in Tier 2/3 cities regardless of price
- Millions of students who *want* to learn math can't access or afford good tutoring

### The Vision
Build an AI-powered math tutor that replicates — and in some ways exceeds — the experience of having a dedicated one-on-one tutor, at a fraction of the cost (target: ₹299-499/month). The AI tutor should feel like a warm, patient, Hinglish-speaking didi/bhaiya sitting next to the student, not a chatbot.

### Target Users
- **Primary**: Students in Class 6 to Class 10 (expandable to Class 12)
- **Boards**: CBSE (NCERT) first, then ICSE, state boards
- **Subject**: Mathematics (starting point)
- **Geography**: India — Tier 1, 2, and 3 cities
- **Key persona**: A motivated student who wants to learn but can't afford/access a good tutor

---

## 2. Market Research — What Exists and What's Missing

### Competitors Analyzed

#### India-Specific Players

**SparkEd Math** (https://www.sparkedmaths.com)
- Covers Classes 6-10, CBSE, ICSE, IB MYP, Olympiad
- Features: Upload screenshot → get step-by-step solution + AI coach
- Gap: It's a doubt-solving tool, not a structured tutor. No curriculum journey. Reactive, not proactive.

**Super Tutor** (https://supertutor.in/)
- Maps to board syllabi (CBSE, ICSE, state boards)
- Features: AI doubt solving, quizzes, mock tests
- Gap: Exam-prep focused, not conceptual teaching. No conversational tutoring.

**MeraTutor.AI** (https://www.meratutor.ai/)
- K-12 AI tutor for Indian students
- Gap: Limited information on depth of interaction

**Embibe** (acquired by Reliance/Jio Platforms)
- Strong on competitive exam prep (JEE, NEET)
- Analytics-heavy, performance tracking
- Gap: Not conversational. More of an analytics + practice platform.

**Edza AI**
- JEE/NEET focused, 30,000+ learners in Classes 9-12
- Gap: Competitive exam specific, not general math learning

#### Global Players Touching India

**Khan Academy + Khanmigo**
- Free, available in Hindi, CBSE-aligned curriculum
- Khanmigo uses GPT-4 for Socratic tutoring
- Critical gap: **Mathematical accuracy is unreliable** — gets basic arithmetic wrong. Good at conversational scaffolding but answers can't be trusted.
- Source: https://www.linkedin.com/pulse/khanmigo-great-ready-tutor-student-richard-tong

**Tegore** (https://www.tegore.ai/)
- YC-backed, San Francisco-based
- "Duolingo for Math" — focused on Algebra I & II for US high schoolers
- Gap: Not built for Indian education system at all. US curriculum only.

### Core Gaps Across All Competitors

1. **No "full journey" tutoring** — Products are either doubt-solvers (reactive) or exam-prep tools. Nobody teaches a concept from scratch, checks understanding, then gives progressively harder problems while adapting.

2. **Shallow conversational experience** — Either dumps a wall of steps (textbook-like) or does mechanical Socratic questioning. No warmth, no code-switching, no personality.

3. **No structured curriculum ownership** — Khan Academy has structure but bolted-on AI. AI-first products (SparkEd, Doubtnut) have no real curriculum. Nobody says "today we cover 5.1, here's how we'll spend the next 40 minutes."

4. **No real adaptivity** — Most adapt difficulty but not explanation style. Don't detect whether a student is visual vs. algebraic in their thinking.

5. **Board-specific depth is lacking** — NCERT has a specific pedagogical approach. Products either ignore this or superficially tag content as "CBSE."

### Market Size
- AI tutoring demand in India projected at 19.2% CAGR
- Global AI tutoring market: USD 3,716.6 million in 2025
- Source: https://www.futuremarketinsights.com/reports/ai-tutoring-services-market

---

## 3. How Our Product Is Different

| Aspect | Existing Products | Our Product |
|--------|------------------|-------------|
| Teaching model | Reactive doubt-solving OR exam prep | Proactive structured lessons — AI teaches from scratch |
| Conversation | Robotic, English-only, wall-of-text | Warm Hinglish, short exchanges, personality |
| Curriculum | Either no structure or structure with no AI | Deep NCERT-aligned curriculum with AI woven in |
| Understanding check | None or end-of-chapter quiz | Micro-checks after every concept, adaptive re-explanation |
| Content | Text/solutions only | Blended — AI conversation + curated videos + interactive elements |
| Parent involvement | None | Weekly progress reports, struggle areas highlighted |
| Math accuracy | LLM does computation (unreliable) | LLM for conversation + deterministic math engine for computation |
| Pricing | Free (limited) or ₹500-2000/month | ₹299-499/month target |

---

## 4. Product Architecture — Three Layers

### Layer 1: Structured Curriculum Engine
The backbone of the product. For each class and board:
- Complete NCERT syllabus mapped chapter by chapter, topic by topic
- Example: Class 8 → Ch. 3: Understanding Quadrilaterals → 3.1 Polygons → 3.2 Classification → ...
- Each topic has a learning path: Concept Explanation → Worked Examples → Guided Practice → Independent Practice → Assessment
- This is **curated by math teachers**, not AI-generated
- The curriculum tree is what gives students a clear sense of progress ("I'm on Chapter 5 of 14")

### Layer 2: AI Tutor (Conversational Layer)
The differentiator. The AI doesn't just answer questions — it **teaches**.
- Opens each lesson with context setting in Hinglish
- Teaches conversationally with short exchanges (3-4 sentences max per message)
- Uses analogies from daily life / cricket / relatable Indian contexts
- Checks understanding via micro-problems after each concept (not "samajh aaya?" but actual problems)
- If student gets it wrong → doesn't show answer → breaks problem down differently
- Has a **teaching plan** for each session (not just reactive Q&A)
- Surfaces curated video content at the right moments ("yeh 2-min video dekh le, isme bahut achhe se dikhaya hai")
- Celebrates correct answers, normalizes mistakes ("Yeh bahut common confusion hai, let me explain differently")

#### Content Integration Strategy (Three Tiers)
1. **AI's own explanations** (70%) — Text, inline diagrams, step-by-step walkthroughs
2. **Curated embedded content** (25%) — Short video clips (2-5 min max), animations, interactive diagrams pre-mapped to curriculum points. Sources: Magnet Brains, Dear Sir, Khan Academy Hindi
3. **External resource links** (5%) — For deep curiosity, advanced "why" questions, edge cases. AI can search and surface relevant resources.

**Critical rule**: Videos are teaching aids, not replacements. The AI stays in control of the session. Videos are short, embedded, and the AI continues the conversation after.

### Layer 3: Progress & Accountability
- Students see: streaks, milestones, "I'm 35% through the year's syllabus"
- Parents receive (via WhatsApp/email): "This week Aryan completed 3 lessons on Quadratic Equations. He's strong on factoring but struggled with word problems. We've scheduled extra practice."
- Dashboard shows: lessons completed, accuracy rates, time spent, areas of strength/weakness
- Inactivity alerts: "Aryan hasn't opened the app in 3 days"

---

## 5. AI Limitations & Solutions

### Limitation 1: Mathematical Accuracy
- **Problem**: LLMs get arithmetic wrong. Khanmigo has this issue.
- **Solution**: LLM handles teaching/conversation ONLY. All computation routed through deterministic math engine (Python + SymPy backend). LLM never computes — it explains.
- **Verdict**: Solvable. Not a product killer.

### Limitation 2: Can't Read Body Language
- **Problem**: Can't see confusion on a student's face.
- **Solution**: Design-driven — every explanation followed by micro-check problem. Wrong answer or slow response = confusion signal. Make it safe to say "nahi samjha" (AI responds positively). Track response patterns for adaptive pacing.
- **Verdict**: Solvable through interaction design. Not a killer.

### Limitation 3: Motivation & Accountability (No Social Pressure)
- **Problem**: Student can close app and open Instagram. No human presence.
- **Solution**: Short sessions (15-20 min), parent notification loop, streaks/gamification, peer leaderboards. Target user self-selects for motivation (wants to learn but lacks access).
- **Verdict**: Partially solvable. Not a killer — target audience is motivated.

### Limitation 4: Handwritten Math
- **Problem**: Math needs pen and paper, especially geometry.
- **Solution**: Student works on paper → takes photo → AI vision model evaluates working (not just final answer). In-app canvas for interactive geometry. "Draw a perpendicular from A to BC" → app evaluates.
- **Verdict**: Solvable with current vision models. Not a killer.

### Limitation 5: Deep "Why" Questions
- **Problem**: AI may struggle with genuinely deep conceptual questions beyond curriculum.
- **Solution**: Pre-build rich explanations for common "why" questions (finite and predictable per topic). Bridge with animations/videos. For edge cases, link to curated external resources (3Blue1Brown, etc.). AI is honest when it's at its limit.
- **Verdict**: Mostly solvable. Not a killer.

### Limitation 6: Learning Disabilities / Special Needs
- **Problem**: Can't diagnose or specifically accommodate dyscalculia, ADHD, etc.
- **Solution**: Not in v1. Future feature: preference settings ("needs more time", "prefer visual", "smaller steps"). Self-identified by parents/students.
- **Verdict**: Not solvable in v1. Not a killer — not launch target.

### Limitation 7: Internet Dependency
- **Problem**: Inconsistent internet in Tier 2/3 cities.
- **Solution**: Text-based chat = minimal bandwidth. Cache curriculum content locally. Pre-download lesson plans for offline viewing. AI interaction needs connectivity but Jio 4G coverage is extensive.
- **Verdict**: Partially solvable. Not a killer in 2026 India.

### The Real Risk
Not a technical limitation — it's **getting the tone right**. If the AI feels like a chatbot, students won't engage. If it feels like a warm, slightly funny Hinglish-speaking didi/bhaiya who genuinely cares → that's magic. This is a prompt engineering and interaction design challenge.

---

## 6. Real Problems With Current Tutoring (What We Solve)

### One-on-One Tutor Problems
- No continuity tracking between sessions
- Quality inconsistent day to day
- Student too shy/embarrassed to say "I didn't understand" → gaps compound silently
- No way to verify if student practiced after tutor left
- Expensive: ₹800/session in Tier 1

### Batch Coaching Problems
- One of 20-30 kids, zero personalization
- Pace set for average — fast kids bored, slow kids fall behind
- Teacher can't stop and re-explain for one student
- Same homework for everyone regardless of individual needs

### Common Problems (Both)
- Homework not done → nobody catches it until next session
- Doubts at 9 PM → tutor unavailable
- Math concepts build on each other → gap in Ch. 3 silently breaks Ch. 7, nobody traces back
- Parents have zero visibility → "padhai ho gayi?" → "haan"

### How AI Solves Each

| Tutor Advantage | AI Equivalent / Improvement |
|----------------|----------------------------|
| "Explains in my language" | Hinglish, unlimited patience, multiple explanation approaches |
| "Checks if I understood" | Continuous micro-checks, not just end-of-session |
| "Gives homework" | Gives, checks, knows which problems were hard, adjusts next lesson |
| "Available when needed" | 24/7, no judgment for repeated questions |
| "Parents know progress" | Detailed weekly reports with specific struggle areas |

---

## 7. Prototype Specification

### What to Build
A working web app demonstrating the full tutoring experience for one lesson.

### Tech Stack (Recommended)
- **Frontend**: React (Vite) + Tailwind CSS
- **No backend needed for prototype** — lesson flow and AI responses are pre-scripted with branching logic
- **Deployment**: Netlify (one-click deploy from GitHub)
- **Future backend** (post-prototype): Node.js/Python API → LLM (Claude/GPT) + SymPy math engine

### Project Structure
```
src/
├── data/
│   ├── curriculum.js          # Full curriculum tree (Class 8 CBSE)
│   └── lessons/
│       └── quadrilaterals.js  # Complete lesson script with branching
├── components/
│   ├── CurriculumSidebar.jsx  # Left panel — chapter/topic tree
│   ├── ChatInterface.jsx      # Center — AI tutor conversation
│   ├── ProgressPanel.jsx      # Right — progress, streaks, summary
│   ├── MessageBubble.jsx      # Individual chat messages
│   ├── QuizQuestion.jsx       # Interactive micro-check questions
│   ├── VideoEmbed.jsx         # Embedded video player
│   └── LessonSummary.jsx      # End-of-lesson recap
├── engine/
│   └── tutorEngine.js         # State machine — drives lesson flow
├── App.jsx
└── main.jsx
```

### Lesson Content: Class 8 CBSE — Chapter 3: Understanding Quadrilaterals

#### NCERT Syllabus Breakdown

**Section 3.1: Introduction**
- Introduction to quadrilaterals as four-sided polygons

**Section 3.2: Polygons**
- 3.2.1 Classification of Polygons (by number of sides)
- 3.2.2 Diagonals (definition and counting)
- 3.2.3 Convex and Concave Polygons
- 3.2.4 Regular and Irregular Polygons
- 3.2.5 Angle Sum Property: Sum = (n−2) × 180°

**Section 3.3: Sum of Exterior Angles**
- Exterior angles of any polygon = 360°
- Finding sides of regular polygons: sides = 360° ÷ each exterior angle

**Section 3.4: Kinds of Quadrilaterals**
- 3.4.1 Trapezium (one pair of parallel sides)
- 3.4.2 Kite (two pairs of adjacent equal sides)
- 3.4.3 Parallelogram (two pairs of parallel sides)
- 3.4.4-6 Parallelogram properties (angles, diagonals)

**Section 3.5: Special Parallelograms**
- 3.5.1 Rhombus
- 3.5.2 Rectangle
- 3.5.3 Square

#### Properties Reference Table

| Property | Parallelogram | Rhombus | Rectangle | Square | Kite | Trapezium |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| Opposite sides equal | ✓ | ✓ | ✓ | ✓ | ✗ | Partial |
| Opposite angles equal | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Adjacent angles supplementary | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Diagonals bisect each other | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Diagonals perpendicular | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |
| Diagonals equal | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |

#### Common Student Struggles (Design AI responses around these)
1. Confusing similar quadrilaterals — not understanding the hierarchy (square IS a rectangle IS a parallelogram)
2. Angle sum property misapplication — forgetting quadrilateral angles sum to 360°
3. Adjacent vs. opposite angle confusion in parallelograms
4. Diagonal properties — misunderstanding "bisect each other"
5. Multi-step problem solving — not knowing which property to apply first
6. Lack of justification — students skip reasoning, just write the answer

### Prototype Lesson Flow

**Step 1: Welcome & Context** (AI initiates)
```
"Hey! Aaj hum quadrilaterals samjhenge — yaani four-sided shapes.
Tu daily life mein kitne quadrilaterals dekhta hai — phone screen,
book, door — sab quadrilaterals hain! Chal shuru karte hain."
```

**Step 2: Teach Polygon Basics** (2-3 exchanges)
- What's a polygon, types by sides
- Micro-check: "Ek shape ke 6 sides hain — usse kya bolte hain?"

**Step 3: Angle Sum Property** (3-4 exchanges)
- Teach (n-2) × 180° with triangle analogy
- VIDEO EMBED: Visual proof showing diagonal divides quadrilateral into triangles
- Micro-check: "Ek quadrilateral ke 3 angles hain: 90°, 80°, 110°. Fourth angle kitna hoga?"
- If wrong → re-explain with different approach
- If right → celebrate and move forward

**Step 4: Types of Quadrilaterals** (4-5 exchanges)
- Trapezium, Kite, Parallelogram — teach with real-world examples
- Micro-check: "Agar ek shape ke dono pairs of opposite sides parallel hain, toh yeh kya hai?"
- Build the hierarchy: Square → Rectangle → Parallelogram

**Step 5: Parallelogram Properties** (3-4 exchanges)
- Opposite angles equal, adjacent supplementary, diagonals bisect
- Practice problem: "ABCD ek parallelogram hai. Angle A = 70°. Baaki angles bata."

**Step 6: Practice Round** (3-4 problems, increasing difficulty)
- Foundation → Intermediate → Advanced
- AI provides hints if student is stuck (not answers)

**Step 7: Lesson Summary & Progress**
- Recap what was covered
- Show: "Tu ne aaj 6 concepts cover kiye, 4/5 problems sahi kiye. Diagonal properties mein thodi aur practice chahiye — kal ek short revision session rakhte hain."
- Assign 3 homework problems

### Prototype User Flow
1. Student lands on app → sees curriculum sidebar with Class 8 chapters
2. Clicks "Chapter 3: Understanding Quadrilaterals" → sees sub-topics
3. Clicks "3.2: Polygon Basics" → chat opens, AI greets and starts teaching
4. Student progresses through lesson via chat
5. At each micro-check, student selects/types answer → AI responds adaptively
6. Video embeds play inline when triggered
7. Lesson ends → summary card appears → progress bar updates
8. Parent summary is shown (demo of what would be sent via WhatsApp)

### Design Guidelines
- **Tone**: Warm, encouraging, Hinglish. Like a cool college-age tutor, not a strict teacher.
- **AI messages**: Short (3-4 sentences max). Never a wall of text.
- **Student interaction**: Mix of multiple choice, type-in answers, and "hint/skip" options
- **Colors**: Clean, modern — think Duolingo meets WhatsApp. Not childish, not corporate.
- **Mobile-first**: Most Indian students will use this on phones

---

## 8. Economics & Go-to-Market Notes

### Pricing Strategy
- Target: ₹299-499/month (10-20x cheaper than one-on-one tuition)
- Freemium possible: First 2 chapters free, then subscription
- Family plan for siblings

### Key Metrics to Track (Post-Launch)
- Session completion rate (do students finish lessons?)
- Time per session
- Return rate (do they come back tomorrow?)
- Concept mastery progression
- Parent engagement with progress reports

### The "10-Minute Wow Moment"
The single most important thing for the prototype: when a Class 8 student opens the app for the first time, what happens in the first 10 minutes that makes them think "this is better than my tuition teacher"? The prototype must nail this experience.

---

## 9. Reference Sources

### Market Research
- [SparkEd Math — Best Math Solver App India](https://www.sparkedmaths.com/blog/best-math-solver-app-india-students-2026)
- [Super Tutor](https://supertutor.in/)
- [MeraTutor.AI](https://www.meratutor.ai/)
- [Tegore on Y Combinator](https://www.ycombinator.com/companies/tegore)
- [AI Tutoring Services Market Report](https://www.futuremarketinsights.com/reports/ai-tutoring-services-market)
- [Top 10 EdTech AI Tutors 2026](https://www.inventiva.co.in/trends/top-10-edtech-ai-tutors-in-2026/)
- [Best AI Tools Class 9-10 India](https://www.lumichats.com/blog/best-ai-tools-class-9-10-students-india-2026)

### AI Tutor Limitations
- [Khanmigo — Not Ready to Tutor (Richard Tong)](https://www.linkedin.com/pulse/khanmigo-great-ready-tutor-student-richard-tong)
- [Khanmigo Review — Vertech Academy](https://www.vertechacademy.com/blog/khanmigo-review-ai-tutor-worth-it)
- [AI Tutors: Hype or Hope — Education Next](https://www.educationnext.org/ai-tutors-hype-or-hope-for-education-forum/)

### Curriculum Sources
- [Vedantu — NCERT Solutions Ch. 3](https://www.vedantu.com/ncert-solutions/ncert-solutions-class-8-maths-chapter-3-understanding-quadrilaterals)
- [Cuemath — NCERT Solutions](https://www.cuemath.com/ncert-solutions/ncert-solutions-class-8-maths-chapter-3-understanding-quadrilaterals/)
- [Khan Academy — NCERT Class 8 Quadrilaterals](https://www.khanacademy.org/math/ncert-class-8/x4eb5a6db275bcce1:understanding-quadrilaterals-ncert-new)
- [Allen.in — CBSE Notes Ch. 3](https://allen.in/cbse-notes/class-8-maths-notes-chapter-3-understanding-quadrilaterals)
