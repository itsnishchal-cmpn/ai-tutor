import type { LessonTemplate, GeneratedCard, GeneratedQuiz, GeneratedLesson } from '../types/lesson';
import { buildCardsPrompt, buildQuizzesPrompt, buildSummaryPrompt } from '../data/lessonPrompts';

// Shared SSE reader for all calls
async function callChatAPI(system: string, user: string): Promise<string> {
  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: user }],
      systemPrompt: system,
    }),
  });

  if (!response.ok) throw new Error(`API call failed: ${response.status}`);

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
          if (parsed.type === 'content') fullText += parsed.text;
          else if (parsed.type === 'error') throw new Error(parsed.message);
        } catch (e) {
          if (e instanceof Error && !e.message.includes('JSON input')) throw e;
        }
      }
    }
  }

  // Strip markdown code fences
  let text = fullText.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return text;
}

// CALL 1: Generate concept cards (~500 tokens, fast)
export async function generateCards(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): Promise<GeneratedCard[]> {
  const { system, user } = buildCardsPrompt(studentName, topicTitle, template);
  const json = await callChatAPI(system, user);
  const cards: GeneratedCard[] = JSON.parse(json);

  return cards.map((card, i) => ({
    ...card,
    diagramConfig: template.cards[i]?.diagramConfig ?? card.diagramConfig,
  }));
}

// CALL 2: Generate quizzes (~800 tokens, uses card text as context)
export async function generateQuizzes(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[]
): Promise<GeneratedQuiz[]> {
  const { system, user } = buildQuizzesPrompt(studentName, topicTitle, template, cardTexts);
  const json = await callChatAPI(system, user);
  const quizzes: GeneratedQuiz[] = JSON.parse(json);

  return quizzes.map(q => ({
    ...q,
    hints: [
      q.hints[0] ?? 'Socho, kya property yaad aa rahi hai?',
      q.hints[1] ?? 'Dhyan se socho — concept cards mein kya padha tha?',
      q.hints[2] ?? 'Ek aur try — galat options eliminate karo.',
    ] as [string, string, string],
  }));
}

// CALL 3: Generate summary (~200 tokens, tiny and fast)
export async function generateSummary(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate,
  cardTexts: string[]
): Promise<{ keyPoints: string[]; encouragement: string }> {
  const { system, user } = buildSummaryPrompt(studentName, topicTitle, template, cardTexts);
  const json = await callChatAPI(system, user);
  return JSON.parse(json);
}

// Legacy compat for old cached lessons
export async function generateLessonContent(
  studentName: string,
  topicTitle: string,
  template: LessonTemplate
): Promise<GeneratedLesson> {
  const cards = await generateCards(studentName, topicTitle, template);
  const cardTexts = cards.map(c => c.text);
  const quizzes = await generateQuizzes(studentName, topicTitle, template, cardTexts);
  const { keyPoints } = await generateSummary(studentName, topicTitle, template, cardTexts);
  return { cards, quizzes, summary: { keyPoints } };
}
