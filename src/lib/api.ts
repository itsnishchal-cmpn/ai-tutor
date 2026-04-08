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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface SendMessageWithRetryParams extends SendMessageParams {
  maxRetries?: number;
}

export async function sendMessageWithRetry({
  maxRetries = 3,
  onError,
  ...params
}: SendMessageWithRetryParams) {
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= maxRetries - 1; attempt++) {
    let succeeded = false;
    let capturedError = '';

    await new Promise<void>((resolve) => {
      sendMessage({
        ...params,
        onDone: (fullText) => {
          succeeded = true;
          params.onDone(fullText);
          resolve();
        },
        onError: (error) => {
          capturedError = error;
          resolve();
        },
      });
    });

    if (succeeded) return;

    const isLastAttempt = attempt === maxRetries - 1;
    if (isLastAttempt) {
      onError(`${capturedError} (after ${maxRetries} retries)`);
      return;
    }

    await sleep(delays[attempt] ?? 4000);
  }
}
