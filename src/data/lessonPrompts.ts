import type { LessonTemplate } from '../types/lesson';
import { getNCERTContent } from './ncertContent';

// Hinglish language instruction — used in ALL prompts
const HINGLISH_RULES = `
LANGUAGE RULES — EXTREMELY IMPORTANT:
- Write in HINGLISH using ONLY Roman/English script (A-Z alphabet).
- NEVER use Devanagari script or any Hindi Unicode characters.
- Hinglish means Hindi words written in English letters.
- CORRECT: "Polygon ek aisi shape hoti hai jo sirf straight lines se bani ho."
- CORRECT: "Dekho, opposite sides hamesha equal hoti hain."
- CORRECT: "Kya tum bata sakte ho ki isme kitne sides hain?"
- WRONG: "होती हैain" — NEVER mix Hindi script with English
- WRONG: "पॉलीगन" — NEVER write Hindi script
- Math terms stay in English: polygon, angle, perpendicular, parallel, diagonal, bisect, congruent, etc.
- Hindi grammar with English technical words: "Isme do pairs of parallel sides hoti hain."
`;

const hookExamples: Record<string, string> = {
  'polygons-basics': 'stop sign (octagon), rangoli patterns, honeycomb (hexagon), floor tiles',
  'angle-sum-property': 'floor tiles fit perfectly because angles around a point add to 360 degrees',
  'quadrilateral-basics': 'phone screen, book, door, table top — all quadrilaterals',
  'parallelogram': 'tilted door, leaning bookshelf, slanted window frame',
  'rhombus': 'diamond on playing cards, patang during Makar Sankranti',
  'rectangle': 'door, book, phone screen, TV screen, classroom blackboard',
  'square': 'carrom board, chessboard, floor tiles, window panes',
  'kite': 'patang that kids fly during Makar Sankranti, Uttarayan',
  'trapezium': 'bucket from the side, table lamp shade, bridge supports',
  'diagonal-properties': 'draw an X inside different shapes and compare what happens',
  'quadrilateral-family': 'family tree — square inherited everything from rectangle + rhombus',
};

// ============================================================
// CALL 1: Generate concept cards
// ============================================================
export function buildCardsPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  const ncert = getNCERTContent(template.topicId);
  const hookHint = hookExamples[template.topicId] ?? '';

  const cardInstructions = template.cards.map((c, i) => {
    let inst = `Card ${i + 1} (id: "${c.id}", type: ${c.type}): "${c.subConcept}"`;
    if (c.type === 'hook') {
      inst += `\n  INSTRUCTION: Write a warm real-life hook using these examples: ${hookHint}. Do NOT teach math yet — just make the student curious.`;
    } else if (c.type === 'formula') {
      inst += `\n  INSTRUCTION: Present the formula clearly with a one-line explanation. Use ONLY facts from the NCERT content below.`;
    } else {
      inst += `\n  INSTRUCTION: Teach this ONE specific fact. Use ONLY the NCERT content below. 1-2 sentences max.`;
    }
    return inst;
  }).join('\n');

  const system = `You generate concept card text for PadhAI, an AI math tutor for Class 8 Indian students.
${HINGLISH_RULES}
OTHER RULES:
- Each card: 1-2 sentences MAXIMUM.
- Address the student as "${studentName}".
- Use ONLY facts from the NCERT content provided. Do NOT invent or add facts.
- Return ONLY a valid JSON array. No markdown, no code fences, no extra text.

NCERT TEXTBOOK CONTENT FOR THIS TOPIC:
${ncert}`;

  const user = `Generate ${template.cards.length} concept cards for topic "${topicTitle}":

${cardInstructions}

Return JSON array:
[{ "id": "card-id", "type": "hook|concept|formula|example", "text": "Hinglish text in Roman script only" }]`;

  return { system, user };
}

// ============================================================
// CALL 2: Generate quizzes (with card text as context)
// ============================================================
export function buildQuizzesPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[]
): { system: string; user: string } {
  const ncert = getNCERTContent(template.topicId);
  const whatWasTaught = cardTexts.map((t, i) => `Card ${i + 1}: ${t}`).join('\n');

  const quizInstructions = template.quizzes.map((q, i) => {
    const difficulties = ['easy', 'medium', 'hard'];
    const diff = difficulties[i % 3];
    return `Quiz ${i + 1} (id: "${q.id}", difficulty: ${diff}): Test "${q.subConcept}"`;
  }).join('\n');

  const system = `You generate quiz questions for PadhAI. The student "${studentName}" just learned through concept cards. Create quizzes testing their understanding.
${HINGLISH_RULES}
QUIZ RULES:
- Each quiz: exactly 4 options (A, B, C, D). Correct answer must match NCERT facts.
- Difficulty levels:
  - EASY: Direct recall. Student remembers a fact from the cards.
  - MEDIUM: Apply the concept one step further than what was stated.
  - HARD: Combine concepts, spot tricky edge cases, deeper understanding.
- 3 HINTS per question (like a real tutor guiding step by step):
  - Hint 1 (gentle nudge): Remind them which concept area to think about.
  - Hint 2 (more specific): Point toward the key property or rule.
  - Hint 3 (almost there): Rephrase simpler or help eliminate wrong options.
  - NEVER reveal the answer in any hint. Make the student THINK.
- Return ONLY a valid JSON array.

NCERT TEXTBOOK CONTENT:
${ncert}`;

  const user = `The student learned these cards about "${topicTitle}":
${whatWasTaught}

Generate quizzes:
${quizInstructions}

Return JSON array:
[{
  "id": "quiz-id",
  "question": "Question in Hinglish (Roman script)?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "B",
  "difficulty": "easy|medium|hard",
  "hints": ["Hint 1", "Hint 2", "Hint 3"],
  "explanation": "Why correct (1 sentence, Hinglish Roman script)"
}]`;

  return { system, user };
}

// ============================================================
// CALL 3: Generate summary
// ============================================================
export function buildSummaryPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[]
): { system: string; user: string } {
  const whatWasTaught = cardTexts.map((t, i) => `Card ${i + 1}: ${t}`).join('\n');

  const system = `You create lesson summaries for PadhAI.
${HINGLISH_RULES}
- Key points: clear, concise mathematical facts in Hinglish (Roman script only).
- Return ONLY valid JSON.`;

  const user = `Student "${studentName}" completed "${topicTitle}". Cards taught:
${whatWasTaught}

Generate ${template.summary.keyPointCount} key points (important facts to remember) and a warm 1-sentence encouragement.

Return JSON:
{ "keyPoints": ["Point 1 in Hinglish", "Point 2", ...], "encouragement": "Warm encouragement in Hinglish" }`;

  return { system, user };
}

// ============================================================
// Doubt chat + Vision prompts
// ============================================================
export function buildDoubtChatPrompt(studentName: string, topicTitle: string): string {
  // Try to find NCERT content by matching topic title to topic ID
  const topicMap: Record<string, string> = {
    'polygons & classification': 'polygons-basics',
    'angle sum property': 'angle-sum-property',
    'quadrilateral basics': 'quadrilateral-basics',
    'parallelogram': 'parallelogram',
    'rhombus': 'rhombus',
    'rectangle': 'rectangle',
    'square': 'square',
    'kite': 'kite',
    'trapezium': 'trapezium',
    'diagonal properties': 'diagonal-properties',
    'quadrilateral family tree': 'quadrilateral-family',
  };
  const topicId = topicMap[topicTitle.toLowerCase()] ?? '';
  const ncert = topicId ? getNCERTContent(topicId) : '';

  return `You are PadhAI, a warm AI math tutor for Indian students. Student "${studentName}" is asking about "${topicTitle}".
${HINGLISH_RULES}
- Keep answers SHORT: 2-3 sentences max.
- For math problems: GUIDE step by step, never give direct answers.
- Be warm and encouraging.

NCERT CONTENT:
${ncert}`;
}

export function buildVisionPrompt(studentName: string, topicTitle: string): string {
  return `You are PadhAI, a warm AI math tutor. Student "${studentName}" is studying "${topicTitle}" and uploaded an image.
${HINGLISH_RULES}
- TEXTBOOK PAGE: explain in simple Hinglish, break into points.
- MATH PROBLEM: DO NOT solve directly. Guide step-by-step.
- UNCLEAR IMAGE: politely ask for clearer photo.`;
}

// Backward compat
export function buildLessonGenerationPrompt(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): { system: string; user: string } {
  return buildCardsPrompt(studentName, topicTitle, template);
}
