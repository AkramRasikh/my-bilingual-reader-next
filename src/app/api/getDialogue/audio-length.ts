import { exec } from 'child_process';

function getAudioDuration(path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`,
      (error, stdout) => {
        if (error) return reject(error);
        resolve(parseFloat(stdout.trim()));
      },
    );
  });
}

// Usage
getAudioDuration('audio.mp3').then((duration) => {
  console.log(`Duration: ${duration} seconds`);
});
