import type { RichContentBlock, QuizBlock } from '../types/chat';

let quizCounter = 0;

function parseQuizBlock(raw: string, quizType: 'mcq' | 'type-in'): QuizBlock | null {
  const qMatch = raw.match(/Q:\s*(.+?)(?:\n|$)/);
  const answerMatch = raw.match(/ANSWER:\s*(.+?)(?:\n|$)/);
  const explanationMatch = raw.match(/EXPLANATION:\s*(.+?)(?:\n|$)/);

  if (!qMatch || !answerMatch) return null;

  const question = qMatch[1].trim();
  const correctAnswer = answerMatch[1].trim();
  const explanation = explanationMatch?.[1]?.trim();

  let options: string[] | undefined;
  if (quizType === 'mcq') {
    const optionMatches = raw.match(/^[A-D]\)\s*.+$/gm);
    if (optionMatches) {
      options = optionMatches.map(o => o.replace(/^[A-D]\)\s*/, '').trim());
    }
  }

  quizCounter++;
  return {
    type: 'quiz',
    quizType,
    question,
    options,
    correctAnswer,
    explanation,
    id: `quiz-${Date.now()}-${quizCounter}`,
  };
}

function parseSummaryBlock(raw: string): { content: string; keyPoints: string[] } {
  const topicMatch = raw.match(/Topic:\s*(.+?)(?:\n|$)/);
  const keyMatches = raw.match(/KEY:\s*.+$/gm);
  const content = topicMatch?.[1]?.trim() ?? 'Lesson Summary';
  const keyPoints = keyMatches?.map(k => k.replace(/^KEY:\s*/, '').trim()) ?? [];
  return { content, keyPoints };
}

export function parseAIResponse(text: string): RichContentBlock[] {
  const blocks: RichContentBlock[] = [];
  let remaining = text;

  // Pattern for all special blocks
  const blockPattern = /\[DIAGRAM:([a-z-]+)\]|\[VIDEO:([a-z-]+)\]|\[QUIZ:(MCQ|TYPE)\]([\s\S]*?)\[\/QUIZ\]|\[SUMMARY\]([\s\S]*?)\[\/SUMMARY\]|\$\$([\s\S]*?)\$\$/g;

  let lastIndex = 0;
  let match;

  while ((match = blockPattern.exec(remaining)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const textBefore = remaining.slice(lastIndex, match.index).trim();
      if (textBefore) {
        // Parse inline math within text
        blocks.push(...parseInlineMath(textBefore));
      }
    }

    if (match[1]) {
      // DIAGRAM
      blocks.push({ type: 'diagram', diagramId: match[1] });
    } else if (match[2]) {
      // VIDEO
      blocks.push({ type: 'video', videoId: match[2] });
    } else if (match[3] && match[4]) {
      // QUIZ
      const quizType = match[3].toLowerCase() === 'mcq' ? 'mcq' : 'type-in';
      const quiz = parseQuizBlock(match[4], quizType);
      if (quiz) blocks.push(quiz);
    } else if (match[5]) {
      // SUMMARY
      const summary = parseSummaryBlock(match[5]);
      blocks.push({ type: 'summary', ...summary });
    } else if (match[6]) {
      // DISPLAY MATH
      blocks.push({ type: 'math', content: match[6].trim(), display: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < remaining.length) {
    const textAfter = remaining.slice(lastIndex).trim();
    if (textAfter) {
      blocks.push(...parseInlineMath(textAfter));
    }
  }

  // If no blocks parsed, return as single text block
  if (blocks.length === 0 && text.trim()) {
    blocks.push({ type: 'text', content: text.trim() });
  }

  return blocks;
}

function parseInlineMath(text: string): RichContentBlock[] {
  const blocks: RichContentBlock[] = [];
  // Match $...$ but not $$...$$
  const inlinePattern = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;

  let lastIdx = 0;
  let m;

  // Check if there are any inline math expressions
  const hasInlineMath = inlinePattern.test(text);
  if (!hasInlineMath) {
    return [{ type: 'text', content: text }];
  }

  // Reset regex
  inlinePattern.lastIndex = 0;

  while ((m = inlinePattern.exec(text)) !== null) {
    if (m.index > lastIdx) {
      const before = text.slice(lastIdx, m.index);
      if (before) blocks.push({ type: 'text', content: before });
    }
    blocks.push({ type: 'math', content: m[1].trim(), display: false });
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    const after = text.slice(lastIdx);
    if (after) blocks.push({ type: 'text', content: after });
  }

  return blocks;
}
