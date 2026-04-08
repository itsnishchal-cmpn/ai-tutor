import Anthropic from '@anthropic-ai/sdk';
import type { Context } from '@netlify/functions';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { messages, systemPrompt, image } = await req.json();
    if (!messages || !systemPrompt || !image) return new Response('Bad request: messages, systemPrompt, and image required', { status: 400 });

    const apiMessages = messages.map((m: { role: string; content: string; hasImage?: boolean }, i: number) => {
      if (m.hasImage && i === messages.length - 1) {
        return {
          role: m.role as 'user' | 'assistant',
          content: [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: image.mediaType, data: image.data } },
            { type: 'text' as const, text: m.content },
          ],
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    });

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          stream.on('text', (text) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`));
          });
          stream.on('error', (error) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`));
            controller.close();
          });
          await stream.finalMessage();
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
