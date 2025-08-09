import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { transcript, yoooJapanese } from './data';
import { generateAllVoiceVoxAudios } from './generate-all-voice-vox-audios';
import { combineAudioFilesWithPromiseWrapper } from '../getDialogue/merge-audio-files';
import { getAudioFileDuration } from '@/utils/get-audio-file-duration';
import { getSilencePath } from '@/app/shared-apis/get-silence-path';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // const systemPrompt = genericOpenAiSystemPrompt

    // const userPrompt =  getGenericOpenAiPrompt(transcript)

    // const completion = await OpenAiApi({systemPrompt,userPrompt})

    // const raw = completion.choices[0].message?.content?.trim() ?? '';

    // const parsedResponse = JSON.parse(yoooJapanese);
    const parsedResponse = yoooJapanese;
    const body = {
      title: 'richard-wolf-rabble',
    };

    const { title } = body;

    const generatedAudioUrls = await generateAllVoiceVoxAudios(parsedResponse);

    const timeStampedAudios = [] as number[];

    generatedAudioUrls.forEach(async (audioUrl) => {
      const thisAudioDuration = (await getAudioFileDuration(
        audioUrl,
      )) as number;
      timeStampedAudios.push(thisAudioDuration);
    });

    const conbinedOutputFile = `voicevox-${title}.wav`;
    const outputPathB = path.join(
      process.cwd(),
      'public',
      'audio',
      conbinedOutputFile,
    );

    const combinedAudioSuccess = await combineAudioFilesWithPromiseWrapper(
      generatedAudioUrls,
      outputPathB,
    );

    let content = [];
    if (combinedAudioSuccess) {
      parsedResponse.forEach((transcriptItem, index) => {
        const thisStartTime = timeStampedAudios[index];
        content.push({
          id: uuidv4(),
          targetLang: transcriptItem,
          time: thisStartTime,
        });
      });
    }

    // Attempt to parse JSON from the model's response
    return NextResponse.json(
      {
        response: parsedResponse,
        generatedAudioUrls,
        timeStampedAudios,
        content,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in getAiStory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
