import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VOICEVOX_API = 'http://localhost:50021';
const speakerId = 13; // Takehiro Genno

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Step 1: audio_query
    const queryRes = await fetch(
      `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
        text,
      )}&speaker=${speakerId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    if (!queryRes.ok) throw new Error('VOICEVOX /audio_query failed');
    const audioQueryJson = await queryRes.json();

    // Step 2: synthesis
    const synthRes = await fetch(
      `${VOICEVOX_API}/synthesis?speaker=${speakerId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/wav',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQueryJson),
      },
    );

    if (!synthRes.ok) throw new Error('VOICEVOX /synthesis failed');

    const audioBuffer = Buffer.from(await synthRes.arrayBuffer());

    // Save to file (e.g., under /tmp or /public/audio)
    const outputPath = path.join(
      process.cwd(),
      'public',
      'audio',
      'output.wav',
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, audioBuffer);

    return NextResponse.json({
      success: true,
      url: '/audio/output.wav',
      phonemes: audioQueryJson.moras ?? [],
    });
  } catch (err) {
    console.error('VOICEVOX error:', err);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 },
    );
  }
}
