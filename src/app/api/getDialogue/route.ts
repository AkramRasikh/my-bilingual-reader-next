import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { voicesSelectionMan, voicesSelectionWoman } from './voice-selection';
import { formatChunksComprehensive } from '@/app/words/format-chunks';
import { combineAudio } from './merge-audio-files';
import { getAudioFileDuration } from '@/utils/get-audio-file-duration';
import { cleanOldAudioFiles } from './cleanOldAudioFiles';

function mergeDialogueLines(
  personA: { targetLang: string; baseLang: string },
  personB: { targetLang: string; baseLang: string },
) {
  const targetLang = `${personA.targetLang}${personB.targetLang}`;
  const baseLang = `${personA.baseLang} ${personB.baseLang}`;

  return {
    targetLang,
    baseLang,
  };
}

const VOICEVOX_API = 'http://localhost:50021';

const apiKey = process.env.NEXT_PUBLIC_OPEN_AI;

const openai = new OpenAI({
  apiKey,
});

const chunkAtAbstractLevel = {
  chunk:
    '<A chunk should be one logical word/phrase or particle (granular aspect of the sentence). original wording of the japanese sentence i.e. 堅苦しい, 居住者, etc would be a seperate chunk in, ignore punctuation here such as commas, full stops etc>',
  reading:
    '<katakana (not hiragana) reading of that part. NOTE where を is used, the katakana equal should be オ and not ヲ. where ウ is used, the katakana equal should be オ instead of ヲ>',
};

const jsonResponseObj = {
  personA: {
    chunks: [chunkAtAbstractLevel],
    targetLang: 'The Japanese chunk text together in a standard sentence',
    baseLang: 'Natural English translation of the targetLang',
  },
  personB: {
    chunks: [chunkAtAbstractLevel],
    targetLang: 'The Japanese chunk text together in a standard sentence',
    baseLang: 'Natural English translation of the targetLang',
  },
  wordIds: ['ids of the words being used'],
  moodPersonA: 'number id of the voice/mood selected',
  moodPersonB: 'number id of the voice/mood selected',
  notes: 'explanation of any word choices, grammar, or cultural nuance',
};

export async function POST(request: Request) {
  try {
    const { words, suggested } = await request.json();

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

${
  suggested
    ? `Here is a suggested sentence with the words being used in English. If it is a natural use of the words then use it as inspiration for the sentence generation. Otherwise ignore: ${suggested}`
    : ''
}

Here are a list of voices/mood to choose from personA - a woman ${JSON.stringify(
      voicesSelectionWoman,
    )}

Here are a list of voices/mood to choose from personB - a man ${JSON.stringify(
      voicesSelectionMan,
    )}

given the generated content, pick one mood each

Return ONLY raw & valid JSON in the following format:

interface personResponseTypes {
  targetLang: string;
  baseLang: string;
  chunks: {
    chunk: string;
    reading: string;
  }[];
}

interface responseTypes {
  personA: personResponseTypes;
  personB: personResponseTypes;
  wordIds: string[];
  moodPersonA: number;
  moodPersonB: number;
  notes?: string;
}

${JSON.stringify(jsonResponseObj)}

`;

    cleanOldAudioFiles();
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

    console.log('## raw', raw);

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

    const personAText = response.personA.targetLang;
    const personAMood = response.moodPersonA;

    const audioQueryResSpeakerA = await fetch(
      `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
        personAText,
      )}&speaker=${personAMood}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );
    //

    if (!audioQueryResSpeakerA.ok)
      throw new Error('VOICEVOX audio_query failed');
    const audioQueryJsonA = await audioQueryResSpeakerA.json();

    console.log('## audioQueryJsonA', JSON.stringify(audioQueryJsonA));

    const synthesisResA = await fetch(
      `${VOICEVOX_API}/synthesis?speaker=${personAMood}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/wav',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQueryJsonA),
      },
    );

    if (!synthesisResA.ok) throw new Error('VOICEVOX synthesis failed');

    const audioBufferA = Buffer.from(await synthesisResA.arrayBuffer());

    const audioFileNameSpeakerA = `voicevox-speakerA.wav`;
    // const audioFileName = `voicevox-${Date.now()}.wav`;
    const outputPathA = path.join(
      process.cwd(),
      'public',
      'audio',
      audioFileNameSpeakerA,
    );
    fs.mkdirSync(path.dirname(outputPathA), { recursive: true });
    fs.writeFileSync(outputPathA, audioBufferA);

    const audioADuration = await getAudioFileDuration(outputPathA);

    const personBText = response.personB.targetLang;
    const personBMood = response.moodPersonB;

    // B - Speaker
    const audioQueryResSpeakerB = await fetch(
      `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
        personBText,
      )}&speaker=${personBMood}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
    );
    //

    if (!audioQueryResSpeakerB.ok)
      throw new Error('VOICEVOX audio_query failed');
    const audioQueryJsonB = await audioQueryResSpeakerB.json();

    const synthesisResB = await fetch(
      `${VOICEVOX_API}/synthesis?speaker=${personBMood}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/wav',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audioQueryJsonB),
      },
    );

    if (!synthesisResB.ok) throw new Error('VOICEVOX synthesis failed');

    const audioBufferB = Buffer.from(await synthesisResB.arrayBuffer());

    const audioFileNameSpeakerB = `voicevox-speakerB.wav`;
    // const audioFileName = `voicevox-${Date.now()}.wav`;
    const outputPathB = path.join(
      process.cwd(),
      'public',
      'audio',
      audioFileNameSpeakerB,
    );
    fs.mkdirSync(path.dirname(outputPathB), { recursive: true });
    fs.writeFileSync(outputPathB, audioBufferB);
    //

    const combinedAudioPath = path.join(
      process.cwd(),
      'public',
      'audio',
      'combined-a-b.mp3',
    );
    const silentAudioFilePath = path.join(
      process.cwd(),
      'public',
      'audio',
      'silence.wav',
    );
    combineAudio(
      outputPathA,
      outputPathB,
      silentAudioFilePath,
      combinedAudioPath,
    );

    const aOutput = formatChunksComprehensive({
      audioQuery: audioQueryJsonA,
      chunks: response.personA.chunks,
    });
    const bOutput = formatChunksComprehensive({
      audioQuery: audioQueryJsonB,
      chunks: response.personB.chunks,
    }).map((i) => {
      return {
        ...i,
        start: Number.isFinite(i?.start)
          ? i.start + audioADuration + 0.3
          : i?.start,
        end: Number.isFinite(i?.end) ? i.end + audioADuration + 0.3 : i?.end,
      };
    });

    const dialogueOutput = [...aOutput, ...bOutput];

    return NextResponse.json({
      dialogueOutput,
      targetLang: mergeDialogueLines(response.personA, response.personB)
        .targetLang,
      baseLang: mergeDialogueLines(response.personA, response.personB).baseLang,
      audioUrl: '/audio/combined-a-b.mp3',
      isDialogue: true,
      wordIds: response.wordIds,
      notes: response?.notes,
    });
  } catch (error) {
    console.error('Error in getAiStory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
