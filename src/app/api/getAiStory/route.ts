import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const VOICEVOX_API = 'http://localhost:50021';

const apiKey = process.env.NEXT_PUBLIC_OPEN_AI;

const openai = new OpenAI({
  apiKey,
});

const jsonResponseObj = {
  targetLang: '[sentence(s) in Japanese]',
  baseLang: '[natural English translation]',
  notes: '[explanation of any word choices, grammar, or cultural nuance]',
  katakana: '<full katakana version of the sentence>',
  chunks: [
    {
      chunk:
        '<original wording of the japanese sentence i.e. 堅苦しい, 居住者, etc would be a seperate chunk in, ignore punctuation here such as commas, full stops etc>',
      reading:
        '<katakana reading of that part. NOTE where を is used, the katakana equal should be オ and not ヲ. where ウ is used, the katakana equal should be オ instead of ヲ>',
    },
  ],
  wordIds: [['ids of the words being used']],
};
export async function POST(request: Request) {
  try {
    const { words, speakerId } = await request.json();

    if (!words || !Array.isArray(words)) {
      return NextResponse.json(
        { error: 'Invalid words array' },
        { status: 400 },
      );
    }

    const formattedWords = words
      .map(
        (w: { id: string | number; word: string; definition: string }) =>
          `- ${w.id} | ${w.word} (${w.definition})`,
      )
      .join('\n');

    const systemPrompt = `You are a bilingual tutor. You will be given Japanese words and asked to build a short sentence using them. Your job is to return a structured JSON object containing the Japanese sentence, its English translation, and helpful notes for learners.`;

    const userPrompt = `Here are some Japanese words with their meanings:\n${formattedWords}    

Please write a short natural-sounding example dialogue using these words. The dialogue should be between two people and include **at least two exchanges** (i.e., a minimum of 2/3 sentences total, alternating speakers). Use questions, imperatives, natural filler words, and varied sentence types to make it conversational and engaging.

Keep the dialogue concise but meaningful, ensuring that the context clearly demonstrates how the words are used naturally.

Return ONLY a JSON object in the following format:

${JSON.stringify(jsonResponseObj)}

`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message?.content?.trim() ?? '';

    // Attempt to parse JSON from the model's response
    let response;
    try {
      response = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse JSON:', raw);
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI' },
        { status: 502 },
      );
    }

    const audioQueryRes = await fetch(
      `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
        response.targetLang,
      )}&speaker=${speakerId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    if (!audioQueryRes.ok) throw new Error('VOICEVOX audio_query failed');
    const audioQueryJson = await audioQueryRes.json();

    const synthesisRes = await fetch(
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

    if (!synthesisRes.ok) throw new Error('VOICEVOX synthesis failed');

    const audioBuffer = Buffer.from(await synthesisRes.arrayBuffer());

    const audioFileName = `voicevox-${Date.now()}.wav`;
    const outputPath = path.join(
      process.cwd(),
      'public',
      'audio',
      audioFileName,
    );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, audioBuffer);

    return NextResponse.json({
      ...response,
      audioQuery: audioQueryJson, // 👈 include here
      hasAudio: true,
      audioUrl: `/audio/${audioFileName}`,
    });
  } catch (error) {
    console.error('Error in getAiStory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
