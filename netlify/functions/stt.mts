import OpenAI from 'openai';
import type { Context } from '@netlify/functions';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: Request, _context: Context) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) return new Response('Bad request: audio file required', { status: 400 });

    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language: 'hi',
      response_format: 'json',
    });

    return new Response(JSON.stringify({ text: transcription.text }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'STT error';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
