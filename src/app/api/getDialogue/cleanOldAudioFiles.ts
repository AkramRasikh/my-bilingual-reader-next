import fs from 'fs';
import path from 'path';

export const cleanOldAudioFiles = () => {
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  const filesToDelete = [
    'voicevox-speakerA.wav',
    'voicevox-speakerB.wav',
    'combined-a-b.mp3',
  ];

  for (const file of filesToDelete) {
    const filePath = path.join(audioDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`## Deleted old file: ${filePath}`);
      } catch (err) {
        console.error(`## Failed to delete ${filePath}:`, err);
      }
    }
  }
};
