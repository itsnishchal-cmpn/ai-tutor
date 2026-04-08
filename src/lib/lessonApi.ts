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
    }),
  });

  if (!response.ok) {
    throw new Error(`Lesson generation failed: ${response.status}`);
  }

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
          if (e instanceof Error && e.message.startsWith('Lesson generation') ||
              (e instanceof Error && !e.message.includes('JSON'))) throw e;
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
