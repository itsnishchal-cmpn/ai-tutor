import OpenAI from 'openai';
import type { Context } from '@netlify/functions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { text, voice } = await req.json();
    if (!text || typeof text !== 'string') return new Response('Bad request: text required', { status: 400 });

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice ?? 'nova',
      input: text,
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'TTS error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
