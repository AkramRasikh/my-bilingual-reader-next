import { NextResponse } from 'next/server';
import path from 'path';
import { generateAllVoiceVoxAudios } from './generate-all-voice-vox-audios';
import { combineAudioFilesWithPromiseWrapper } from '../getDialogue/merge-audio-files';
import { getAudioFileDuration } from '@/utils/get-audio-file-duration';
import { v4 as uuidv4 } from 'uuid';
import OpenAiApi from './openAiApi';
import { genericOpenAiSystemPrompt, getGenericOpenAiPrompt } from './prompt';
import { uploadAudioCloudflare } from '@/app/shared-apis/upload-audio-cloudflare';
import { deleteVoiceVoxFiles } from './remove-generated-files';
import { formatRawTranscript } from './format-youtube-subtitles-response';

export async function POST(req: Request) {
  const body = await req.json();

  const { title, youtubeUrl, language } = body;

  try {
    const youtubeSubsResponse = await fetch(youtubeUrl);

    if (!youtubeSubsResponse.ok) {
      throw new Error('GET Youtube subs failed');
    }
    const yotubeSubsJson = await youtubeSubsResponse.json();

    const youtubeSubsToString = formatRawTranscript(yotubeSubsJson);
    const userPrompt = getGenericOpenAiPrompt(youtubeSubsToString);

    const response = await OpenAiApi({
      systemPrompt: genericOpenAiSystemPrompt,
      userPrompt,
      model: 'gpt-4',
    });
    const parsedResponse = JSON.parse(response);

    const audioTextMap = parsedResponse.map((i) => i.targetLang);

    const generatedAudioUrls = await generateAllVoiceVoxAudios(audioTextMap);

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

    const sortedOrderOfGeneratedUrls = generatedAudioUrls.sort((a, b) => {
      const numA = parseInt(a.match(/voicevox-(\d+)\.wav$/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/voicevox-(\d+)\.wav$/)?.[1] || '0', 10);
      return numA - numB;
    });

    const combinedAudioSuccess = await combineAudioFilesWithPromiseWrapper(
      sortedOrderOfGeneratedUrls,
      outputPathB,
    );

    //

    let currentAudioStartTime = 0;
    let content = [] as any;
    const newContent = [];
    if (combinedAudioSuccess) {
      content = await Promise.all(
        parsedResponse.map(async (transcriptItem, index) => {
          const audioFileName = `voicevox-${index}.wav`;
          const thisAudioFile = path.join(
            process.cwd(),
            'public',
            'audio',
            audioFileName,
          );
          const thisAudioDuration = await getAudioFileDuration(thisAudioFile);

          return {
            id: uuidv4(),
            index,
            targetLang: transcriptItem.targetLang,
            baseLang: transcriptItem.baseLang,
            duration: thisAudioDuration as number,
          };
        }),
      );
    }

    content.sort((a, b) => a.index - b.index);

    content.forEach((item) => {
      const time = currentAudioStartTime;
      newContent.push({
        ...item,
        time,
      });
      currentAudioStartTime += item.duration;
    });

    const localAudioPath =
      'http://localhost:3000' + `/audio/${conbinedOutputFile}`;

    const isUploaded = await uploadAudioCloudflare({
      localAudioPath,
      cloudFlareAudioName: title,
    });

    const contentObjToAdd = {
      title,
      isArticle: true,
      content: newContent,
      hasAudio: isUploaded,
    };

    const addContentRes = await fetch(
      'http://127.0.0.1:5001/language-content-storage/us-central1/addContent',
      {
        method: 'POST',
        headers: {
          Accept: 'audio/wav',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentObjToAdd,
          language,
        }),
      },
    );

    console.log('## addContentRes', addContentRes);

    // Attempt to parse JSON from the model's response
    return NextResponse.json(
      {
        content: contentObjToAdd,
        response: parsedResponse,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in getAiStory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  } finally {
    const pathToAudioFiles = path.join(process.cwd(), 'public', 'audio');
    await deleteVoiceVoxFiles(pathToAudioFiles);
  }
}
