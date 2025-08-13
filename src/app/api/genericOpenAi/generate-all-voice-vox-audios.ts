import fs from 'fs';
import path from 'path';
import { generateVoiceVox } from '@/app/shared-apis/voice-vox/generate-voice-vox';
import { synthesisVoiceVox } from '@/app/shared-apis/voice-vox/synthesis-voice-vox';

const SPEAKER_NUMBER = 2;

export const generateAllVoiceVoxAudios = async (
  parsedTranscriptResult: string[],
) => {
  const audioUrls: string[] = [];
  await Promise.all(
    parsedTranscriptResult.map(async (text, index) => {
      try {
        const audioGenerationResult = await generateVoiceVox(
          text,
          SPEAKER_NUMBER,
        );

        if (!audioGenerationResult.ok) {
          throw new Error('VOICEVOX audio_query failed');
        }

        const audioQueryRes = await audioGenerationResult.json();

        const synthesisRes = await synthesisVoiceVox(
          audioQueryRes,
          SPEAKER_NUMBER,
        );

        if (!synthesisRes.ok) throw new Error('VOICEVOX synthesis failed');

        const audioBuffer = Buffer.from(await synthesisRes.arrayBuffer());

        const audioFileName = `voicevox-${index}.wav`;
        const outputPath = path.join(
          process.cwd(),
          'public',
          'audio',
          audioFileName,
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, audioBuffer);

        audioUrls.push(outputPath);

        return outputPath;
      } catch (error) {
        console.log('## generateAudioAndCombine error', error);
      }
    }),
  );
  return audioUrls;
};
