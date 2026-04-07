import type { Message } from '../types/chat';

interface SendMessageParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  systemPrompt: string;
  onChunk: (chunk: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

export async function sendMessage({ messages, systemPrompt, onChunk, onDone, onError }: SendMessageParams) {
  try {
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      onError(`API error: ${response.status} — ${text}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('No response stream');
      return;
    }

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
          if (data === '[DONE]') {
            onDone(fullText);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content') {
              fullText += parsed.text;
              onChunk(parsed.text);
            } else if (parsed.type === 'error') {
              onError(parsed.message);
              return;
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }
    }

    // Stream ended without [DONE]
    onDone(fullText);
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Unknown error');
  }
}

export function formatMessagesForAPI(messages: Message[]) {
  return messages.map(m => ({ role: m.role, content: m.content }));
}
