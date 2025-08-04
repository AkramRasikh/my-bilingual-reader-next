import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { voicesSelectionMan, voicesSelectionWoman } from './voice-selection';
import { perfectResponse } from './model-response';

const VOICEVOX_API = 'http://localhost:50021';

const apiKey = process.env.NEXT_PUBLIC_OPEN_AI;

const openai = new OpenAI({
  apiKey,
});

const chunkAtAbstractLevel = {
  chunk:
    '<A chunk should be one logical word/phrase or particle. original wording of the japanese sentence i.e. 堅苦しい, 居住者, etc would be a seperate chunk in, ignore punctuation here such as commas, full stops etc>',
  reading:
    '<katakana reading of that part. NOTE where を is used, the katakana equal should be オ and not ヲ. where ウ is used, the katakana equal should be オ instead of ヲ>',
};

const jsonResponseObj = {
  targetLang: `[A single natural Japanese string that includes **both personA and personB's full dialogue**, back-to-back, without any speaker labels or line breaks. An amalgamation of the dialogue between personA & personB ]`,
  baseLang:
    '[Return the natural English translation of the entire dialogue, including both speakers]',
  notes: '[explanation of any word choices, grammar, or cultural nuance]',
  chunks: {
    personA: [chunkAtAbstractLevel],
    personB: [chunkAtAbstractLevel],
  },
  wordIds: ['ids of the words being used'],
  moodPersonA: 'number id of the voice/mood selected',
  moodPersonB: 'number id of the voice/mood selected',
};

export async function POST(request: Request) {
  try {
    const { words } = await request.json();

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

    const systemPrompt = `
    You are a bilingual tutor. You will be given Japanese words and asked to build a short dialogue using them between a woman (personA) and a man (personB). Your job is to return a structured JSON object containing the Japanese dialogue, its English translation, and helpful notes for learners.`;

    const userPrompt = `Here are some Japanese words with their meanings:\n${formattedWords}    

Please write a short natural-sounding example dialogue using these words. 
The dialogue should be between two people (personA & personB) with each person speaking one time after the other. 
The dialogue **must consist of two turns only**:
- personA speaks first,
- personB responds second.
- breakdown the content in to granular chunks as explained below in the JSON format

Each person must say **at least one full sentence**, and ideally more. 
Use questions, emotional tone, imperatives, and natural filler words to keep the tone conversational and theatrical. 
Both speakers must speak in the dialogue or else the output will be rejected

Keep the dialogue concise but meaningful and ideally theatrical, ensuring that the context clearly demonstrates how the words are used naturally.


Here are a list of voices/mood to choose from personA - a woman ${JSON.stringify(
      voicesSelectionWoman,
    )}

Here are a list of voices/mood to choose from personB - a man ${JSON.stringify(
      voicesSelectionMan,
    )}

given the generated content, pick one mood each

Return ONLY a JSON object in the following format:

${JSON.stringify(jsonResponseObj)}

HERE is an example of a model response structure ${JSON.stringify(
      perfectResponse,
    )}

`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1300,
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

    return NextResponse.json({
      ...response,
      // audioQuery: audioQueryJson, // 👈 include here
      // hasAudio: true,
      // audioUrl: `/audio/${audioFileName}`,
    });

    const audioQueryRes = await fetch(
      `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
        response.targetLang,
      )}&speaker=${response.mood}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );

    if (!audioQueryRes.ok) throw new Error('VOICEVOX audio_query failed');
    const audioQueryJson = await audioQueryRes.json();

    const synthesisRes = await fetch(
      `${VOICEVOX_API}/synthesis?speaker=${response.mood}`,
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
