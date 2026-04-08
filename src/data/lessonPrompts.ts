import type { LessonTemplate } from '../types/lesson';

// NCERT content per topic — the AI must use ONLY these facts
const topicContent: Record<string, string> = {
  'polygons-basics': `NCERT FACTS:
- A polygon is a simple closed curve made of ONLY straight line segments (no curves)
- Classification by number of sides: Triangle (3), Quadrilateral (4), Pentagon (5), Hexagon (6), Heptagon (7), Octagon (8)
- Convex polygon: All interior angles < 180°, all diagonals lie inside
- Concave polygon: At least one interior angle > 180°, some diagonals go outside
- Regular polygon: All sides equal AND all angles equal (e.g., equilateral triangle, square)
- Irregular polygon: Sides or angles are not all equal
- Number of diagonals in an n-sided polygon = n(n-3)/2
REAL-LIFE EXAMPLES: Stop sign (octagon), honeycomb (hexagon), rangoli patterns, tiles on floor`,

  'angle-sum-property': `NCERT FACTS:
- Sum of interior angles of any polygon = (n-2) × 180° where n = number of sides
- This works because any polygon can be divided into (n-2) triangles, each with 180°
- Triangle: (3-2)×180° = 180°, Quadrilateral: (4-2)×180° = 360°
- Pentagon: (5-2)×180° = 540°, Hexagon: (6-2)×180° = 720°
- Sum of exterior angles of ANY convex polygon = 360° (always!)
- For a regular polygon: each exterior angle = 360°/n, each interior angle = (n-2)×180°/n
REAL-LIFE EXAMPLES: Why tiles fit together (angles must add to 360°), clock face angles`,

  'quadrilateral-basics': `NCERT FACTS:
- A quadrilateral has 4 sides, 4 vertices, 4 angles, and 2 diagonals
- Sum of all interior angles = 360° (because diagonal divides it into 2 triangles: 2×180° = 360°)
- Sum of exterior angles = 360° (same as any convex polygon)
- A diagonal connects two non-adjacent vertices
- Number of diagonals = 4(4-3)/2 = 2
REAL-LIFE EXAMPLES: Book, phone screen, door, table top — all quadrilaterals`,

  'parallelogram': `NCERT FACTS:
- A parallelogram has BOTH pairs of opposite sides parallel
- Property 1: Opposite sides are equal (AB = CD, AD = BC)
- Property 2: Opposite angles are equal (∠A = ∠C, ∠B = ∠D)
- Property 3: Consecutive angles are supplementary (∠A + ∠B = 180°)
- Property 4: Diagonals bisect each other (cut each other exactly in half)
- NOTE: Diagonals are NOT necessarily equal in a parallelogram
REAL-LIFE EXAMPLES: A tilted door, a leaning bookshelf, a slanted window frame`,

  'rhombus': `NCERT FACTS:
- A rhombus is a parallelogram with ALL four sides equal
- It has ALL properties of a parallelogram PLUS:
- Diagonals bisect each other at 90° (perpendicular bisectors)
- Diagonals bisect the vertex angles (cut the corner angles in half)
- NOTE: A rhombus does NOT have 90° angles (unless it's a square)
REAL-LIFE EXAMPLES: Diamond shape on playing cards, kite shape during Makar Sankranti`,

  'rectangle': `NCERT FACTS:
- A rectangle is a parallelogram with ALL angles equal to 90°
- It has ALL properties of a parallelogram PLUS:
- All angles are right angles (90°)
- Diagonals are EQUAL in length (AC = BD)
- Diagonals bisect each other (but NOT at 90°, unless it's a square)
REAL-LIFE EXAMPLES: Door, book, phone screen, TV screen, classroom blackboard`,

  'square': `NCERT FACTS:
- A square is BOTH a rectangle AND a rhombus
- All four sides are equal AND all four angles are 90°
- Diagonals are equal (from rectangle), bisect at 90° (from rhombus), bisect vertex angles (45°+45°)
- A square is the most "special" quadrilateral — it satisfies every property
REAL-LIFE EXAMPLES: Carrom board, chessboard squares, floor tiles, window panes`,

  'kite': `NCERT FACTS:
- A kite has two pairs of CONSECUTIVE (adjacent) equal sides, NOT opposite sides
- A kite is NOT a parallelogram
- One pair of opposite angles are equal (the angles between the unequal sides)
- The longer diagonal bisects the shorter diagonal at 90°
- Only ONE diagonal is bisected, not both
REAL-LIFE EXAMPLES: Patang (kite) that you fly during Makar Sankranti`,

  'trapezium': `NCERT FACTS:
- A trapezium has exactly ONE pair of parallel sides (called bases)
- The non-parallel sides are called legs
- An isosceles trapezium has equal legs, equal base angles, and equal diagonals
- A trapezium is NOT a parallelogram
REAL-LIFE EXAMPLES: A bucket viewed from the side, a table lamp shade`,

  'diagonal-properties': `NCERT FACTS:
- Parallelogram: diagonals bisect each other (not equal, not perpendicular)
- Rhombus: diagonals bisect each other at 90°
- Rectangle: diagonals are equal and bisect each other (not at 90°)
- Square: diagonals are equal, bisect at 90°, bisect vertex angles
- Kite: only ONE diagonal is bisected, and they cross at 90°
KEY INSIGHT: More special the quadrilateral → more diagonal properties`,

  'quadrilateral-family': `NCERT FACTS:
- Family tree: Quadrilateral → Parallelogram → Rectangle → Square
- Also: Quadrilateral → Parallelogram → Rhombus → Square
- A square IS a rectangle AND a rhombus
- A rectangle IS a parallelogram, a rhombus IS a parallelogram
- Kite and trapezium are NOT parallelograms
- Every square is a rectangle, but not every rectangle is a square
KEY INSIGHT: Square is the most special — it belongs to every category`,
};

const hookExamples: Record<string, string> = {
  'polygons-basics': 'Use: stop signs (octagon), rangoli patterns, honeycomb (hexagon)',
  'angle-sum-property': 'Use: why do tiles fit on a floor? angles around a point = 360°',
  'quadrilateral-basics': 'Use: phone screen, a book, a door — quadrilaterals with angles adding to 360°',
  'parallelogram': 'Use: a door slightly tilted/leaning, or a slanted window frame',
  'rhombus': 'Use: diamond on playing cards, patang during Makar Sankranti',
  'rectangle': 'Use: a door, a book, phone screen — rectangles everywhere',
  'square': 'Use: carrom board, chessboard, square floor tiles',
  'kite': 'Use: patang that you fly during Makar Sankranti',
  'trapezium': 'Use: bucket from the side, table lamp shade',
  'diagonal-properties': 'Use: draw an X inside different shapes and compare',
  'quadrilateral-family': 'Use: family tree — square inherited everything from rectangle + rhombus',
};

// ============================================================
// CALL 1: Generate concept cards only (fast, ~500 tokens)
// ============================================================
export function buildCardsPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  const content = topicContent[template.topicId] ?? '';
  const hookHint = hookExamples[template.topicId] ?? '';

  const cardInstructions = template.cards.map((c, i) => {
    let inst = `Card ${i + 1} (id: "${c.id}", type: ${c.type}): "${c.subConcept}"`;
    if (c.type === 'hook') {
      inst += `\n  → Write a warm, relatable hook using ONLY these examples: ${hookHint}. Do NOT teach math yet.`;
    } else {
      inst += `\n  → Teach this ONE fact from the NCERT content below. 1-2 sentences max. Be precise.`;
    }
    return inst;
  }).join('\n');

  const system = `You generate concept card text for PadhAI, an AI math tutor for Indian Class 8 students.

RULES:
- ALL text in Hinglish (natural Hindi + English mix)
- Each card: 1-2 sentences MAXIMUM. Short and clear.
- Address the student as "${studentName}"
- Use ONLY the NCERT facts provided. Never invent facts.
- Hook cards: real-life analogy only, no math teaching
- Concept cards: one precise mathematical fact per card
- Return ONLY valid JSON array. No markdown, no code fences.

${content}`;

  const user = `Generate ${template.cards.length} concept cards for "${topicTitle}":

${cardInstructions}

Return JSON array:
[
  { "id": "card-id", "type": "hook|concept|formula|example", "text": "Hinglish text (1-2 sentences)" }
]`;

  return { system, user };
}

// ============================================================
// CALL 2: Generate quizzes (uses actual card text as context)
// ============================================================
export function buildQuizzesPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[] // actual generated card texts for context
): { system: string; user: string } {
  const content = topicContent[template.topicId] ?? '';

  const whatWasTaught = cardTexts.map((t, i) => `Card ${i + 1}: ${t}`).join('\n');

  const quizInstructions = template.quizzes.map((q, i) => {
    const difficulties = ['easy', 'medium', 'hard'];
    const diff = difficulties[i % 3]; // rotate easy → medium → hard
    return `Quiz ${i + 1} (id: "${q.id}", difficulty: ${diff}): Test "${q.subConcept}"`;
  }).join('\n');

  const system = `You generate quiz questions for PadhAI. The student "${studentName}" just learned these concepts through cards. Create quizzes that test their understanding.

RULES:
- ALL text in Hinglish
- Each quiz: exactly 4 options (A, B, C, D), correct answer must be factually correct per NCERT
- Difficulty levels:
  - EASY: Direct recall of a fact taught in the cards. Student just needs to remember.
  - MEDIUM: Apply the concept. Requires thinking one step beyond what was directly stated.
  - HARD: Combine concepts or identify tricky edge cases. Tests deeper understanding.
- 3 HINTS per question (progressive, like a real tutor):
  - Hint 1: Gentle nudge — remind them of the relevant concept area without being specific
  - Hint 2: More specific — point them toward the key property or rule
  - Hint 3: Almost there — rephrase the question in simpler terms or eliminate wrong thinking
  - NEVER reveal the answer in any hint. Guide the student to THINK.
- Return ONLY valid JSON array.

${content}`;

  const user = `The student just learned these cards about "${topicTitle}":

${whatWasTaught}

Generate these quizzes:
${quizInstructions}

Return JSON array:
[
  {
    "id": "quiz-id",
    "question": "Question in Hinglish?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "B",
    "difficulty": "easy|medium|hard",
    "hints": ["Hint 1 (gentle nudge)", "Hint 2 (more specific)", "Hint 3 (almost there)"],
    "explanation": "Why this is correct (1 sentence, Hinglish)"
  }
]`;

  return { system, user };
}

// ============================================================
// CALL 3: Generate summary (uses card texts, tiny call)
// ============================================================
export function buildSummaryPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[]
): { system: string; user: string } {
  const system = `You create lesson summaries for PadhAI. Summarize what the student learned in a warm, encouraging way.

RULES:
- ALL text in Hinglish
- Key points should be clear, concise mathematical facts
- Return ONLY valid JSON. No markdown.`;

  const whatWasTaught = cardTexts.map((t, i) => `Card ${i + 1}: ${t}`).join('\n');

  const user = `Student "${studentName}" completed "${topicTitle}". Here's what was taught:

${whatWasTaught}

Generate a summary with exactly ${template.summary.keyPointCount} key points. Each key point = one important mathematical fact they should remember.

Return JSON:
{ "keyPoints": ["Point 1", "Point 2", ...], "encouragement": "A warm 1-sentence encouragement in Hinglish" }`;

  return { system, user };
}

// ============================================================
// Doubt chat + Vision prompts (unchanged)
// ============================================================
export function buildDoubtChatPrompt(studentName: string, topicTitle: string): string {
  const key = topicTitle.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');
  const content = topicContent[key] ?? '';

  return `You are PadhAI, a warm and patient AI math tutor for Indian students. The student "${studentName}" is asking a doubt about "${topicTitle}".

RULES:
- Respond in Hinglish (natural Hindi-English mix)
- Keep answers SHORT — 2-3 sentences max
- For math problems: GUIDE, never give direct answers
- Be warm and encouraging
- Use emojis sparingly

NCERT Class 8, Chapter 3: Understanding Quadrilaterals.
${content}`;
}

export function buildVisionPrompt(studentName: string, topicTitle: string): string {
  return `You are PadhAI, a warm AI math tutor. Student "${studentName}" is studying "${topicTitle}" and has uploaded an image.

RULES:
- Respond in Hinglish
- TEXTBOOK PAGE: explain in simple Hinglish, break into digestible points
- MATH PROBLEM: DO NOT solve directly. Guide step-by-step. Let student arrive at answer.
- UNCLEAR IMAGE: politely ask for a clearer photo`;
}

// Keep backward compat for any code still using this
export function buildLessonGenerationPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  return buildCardsPrompt(studentName, topicTitle, template);
}
