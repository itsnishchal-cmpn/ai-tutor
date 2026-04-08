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
- Triangle: (3-2)×180° = 180°
- Quadrilateral: (4-2)×180° = 360°
- Pentagon: (5-2)×180° = 540°
- Hexagon: (6-2)×180° = 720°
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
REAL-LIFE EXAMPLES: Diamond shape on playing cards, kite shape during Makar Sankranti, rangoli diamond patterns`,

  'rectangle': `NCERT FACTS:
- A rectangle is a parallelogram with ALL angles equal to 90°
- It has ALL properties of a parallelogram PLUS:
- All angles are right angles (90°)
- Diagonals are EQUAL in length (AC = BD)
- Diagonals bisect each other (but NOT at 90°, unless it's a square)
- NOTE: Opposite sides are equal but not all four sides equal (unless it's a square)
REAL-LIFE EXAMPLES: Door, book, phone screen, TV screen, classroom blackboard`,

  'square': `NCERT FACTS:
- A square is BOTH a rectangle AND a rhombus
- All four sides are equal AND all four angles are 90°
- It has ALL properties of rectangle + ALL properties of rhombus:
- Diagonals are equal (from rectangle)
- Diagonals bisect at 90° (from rhombus)
- Diagonals bisect vertex angles (each corner split into 45°+45°)
- A square is the most "special" quadrilateral — it satisfies every property
REAL-LIFE EXAMPLES: Carrom board, chessboard squares, floor tiles, window panes`,

  'kite': `NCERT FACTS:
- A kite has two pairs of CONSECUTIVE (adjacent) equal sides, NOT opposite sides
- A kite is NOT a parallelogram (opposite sides are NOT parallel or equal)
- One pair of opposite angles are equal (the angles between the unequal sides)
- The longer diagonal bisects the shorter diagonal at 90°
- The longer diagonal also bisects the vertex angles it connects
- Only ONE diagonal is bisected, not both
REAL-LIFE EXAMPLES: Patang (kite) that you fly during Makar Sankranti, arrowhead shape`,

  'trapezium': `NCERT FACTS:
- A trapezium has exactly ONE pair of parallel sides (called bases)
- The non-parallel sides are called legs
- An isosceles trapezium has equal legs, equal base angles, and equal diagonals
- A trapezium is NOT a parallelogram (only one pair of parallel sides, not two)
- The parallel sides are usually drawn as top and bottom (one shorter, one longer)
REAL-LIFE EXAMPLES: A bucket viewed from the side, a table lamp shade, a bridge support`,

  'diagonal-properties': `NCERT FACTS:
- Parallelogram: diagonals bisect each other (but not equal, not perpendicular)
- Rhombus: diagonals bisect each other at 90° (perpendicular bisectors)
- Rectangle: diagonals are equal and bisect each other (but NOT at 90°)
- Square: diagonals are equal, bisect each other at 90°, and bisect vertex angles (ALL properties)
- Kite: only ONE diagonal is bisected by the other, and they cross at 90°
- Trapezium: diagonals are NOT equal (unless isosceles trapezium)
KEY INSIGHT: As you go from parallelogram → rhombus/rectangle → square, more diagonal properties are added`,

  'quadrilateral-family': `NCERT FACTS:
- Family tree: Quadrilateral → Parallelogram → Rectangle → Square
- Also: Quadrilateral → Parallelogram → Rhombus → Square
- A square IS a rectangle (special case with all sides equal)
- A square IS a rhombus (special case with all angles 90°)
- A rectangle IS a parallelogram (special case with 90° angles)
- A rhombus IS a parallelogram (special case with all sides equal)
- A kite and trapezium are NOT parallelograms
- Every square is a rectangle, but not every rectangle is a square
KEY INSIGHT: Square is the most special — it belongs to EVERY category except kite and trapezium`,
};

// Specific hook examples per topic to avoid hallucination
const hookExamples: Record<string, string> = {
  'polygons-basics': 'Use examples like: stop signs (octagon), rangoli patterns, honeycomb (hexagon), tiles on the floor',
  'angle-sum-property': 'Use examples like: why do tiles fit perfectly on a floor? Because angles around a point = 360°',
  'quadrilateral-basics': 'Use examples like: your phone screen, a book, a door — these are all quadrilaterals with angles adding to 360°',
  'parallelogram': 'Use examples like: a door that is slightly tilted/leaning, or a slanted window frame',
  'rhombus': 'Use examples like: diamond shape on playing cards, or the shape of a kite (patang) during Makar Sankranti',
  'rectangle': 'Use examples like: a door, a book, your phone screen — rectangles are everywhere',
  'square': 'Use examples like: a carrom board, a chessboard, or square tiles on the floor',
  'kite': 'Use examples like: a patang (kite) that you fly during Makar Sankranti',
  'trapezium': 'Use examples like: a bucket viewed from the side, or a table lamp shade',
  'diagonal-properties': 'Use examples like: compare what happens when you draw an X inside different shapes',
  'quadrilateral-family': 'Use examples like: think of a family tree — square is the "child" that inherited everything from both parents (rectangle + rhombus)',
};

export function buildLessonGenerationPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  const content = topicContent[template.topicId] ?? '';
  const hookHint = hookExamples[template.topicId] ?? '';

  const cardDescriptions = template.cards.map((c, i) => {
    let instruction = `- Card ${i + 1} (${c.type}, id: "${c.id}"): Sub-concept: "${c.subConcept}"`;
    if (c.type === 'hook') {
      instruction += `\n  INSTRUCTION: Write a warm, relatable real-life hook. ${hookHint}. Do NOT teach math yet — just make the student curious.`;
    } else if (c.type === 'concept') {
      instruction += `\n  INSTRUCTION: Teach this ONE specific sub-concept using ONLY the NCERT facts below. Be precise and factual. 1-2 sentences max.`;
    } else if (c.type === 'formula') {
      instruction += `\n  INSTRUCTION: Present the formula clearly with a one-line explanation. Use the NCERT facts below.`;
    }
    return instruction;
  }).join('\n');

  const quizDescriptions = template.quizzes.map((q, i) => {
    return `- Quiz ${i + 1} (id: "${q.id}"): Test sub-concept "${q.subConcept}"
  INSTRUCTION: The correct answer MUST be factually correct per NCERT. Wrong options must be plausible but clearly wrong. Hints guide thinking, never reveal the answer.`;
  }).join('\n');

  const system = `You are PadhAI's lesson content generator for NCERT Class 8 Mathematics, Chapter 3: Understanding Quadrilaterals.

CRITICAL RULES:
- All text MUST be in Hinglish (natural Hindi + English mix, how Indian students talk)
- Each card text: EXACTLY 1-2 sentences. No more.
- Use ONLY the NCERT facts provided below. Do NOT make up facts or examples that contradict the content.
- Address the student as "${studentName}"
- Be warm and friendly, like a caring didi/bhaiya
- For hook cards: use ONLY the suggested real-life examples. Do NOT invent random examples.
- For concept cards: state the mathematical fact clearly. Be precise.
- For quizzes: correct answer MUST be mathematically correct per NCERT
- Each quiz: exactly 4 options, exactly 2 progressive hints, 1 explanation
- Return ONLY valid JSON. No markdown, no code fences, no extra text.

${content}`;

  const user = `Generate lesson content for student "${studentName}" on topic "${topicTitle}".

Cards to generate:
${cardDescriptions}

Quizzes to generate:
${quizDescriptions}

Summary: ${template.summary.keyPointCount} key points (from NCERT facts only)

Return EXACTLY this JSON structure:
{
  "cards": [
    { "id": "card-id-from-template", "type": "hook|concept|formula|example", "text": "Hinglish text (1-2 sentences ONLY)" }
  ],
  "quizzes": [
    {
      "id": "quiz-id-from-template",
      "question": "Question in Hinglish?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "B",
      "hints": ["Hint 1 — guide thinking", "Hint 2 — more specific guide"],
      "explanation": "Why this answer is correct (Hinglish, 1 sentence)"
    }
  ],
  "summary": {
    "keyPoints": ["Key point 1", "Key point 2", ...]
  }
}`;

  return { system, user };
}

export function buildDoubtChatPrompt(studentName: string, topicTitle: string): string {
  const content = topicContent[topicTitle.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-')] ?? '';

  return `You are PadhAI, a warm and patient AI math tutor for Indian students. The student "${studentName}" is asking a doubt about "${topicTitle}".

RULES:
- Respond in Hinglish (natural Hindi-English mix)
- Keep answers SHORT — 2-3 sentences max
- For math problems: GUIDE, never give direct answers. Ask the student to think step by step.
- Be warm and encouraging
- Use emojis sparingly: ✨ 🎯 💡 ✅

NCERT Class 8, Chapter 3: Understanding Quadrilaterals content is your domain.
${content}`;
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
