import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export function combineAudio(
  input1: string,
  input2: string,
  silentFile: string,
  output: string,
) {
  ffmpeg()
    .input(input1)
    .input(silentFile)
    .input(input2)
    .on('error', (err) => console.error('Error:', err))
    .on('end', () => console.log('Files successfully combined!'))
    .mergeToFile(output, './tempdir');
}

export function combineAudioFilesWithPromiseWrapper(
  inputFiles: string[],
  outputFile: string,
  tempDir = './tempdir',
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (inputFiles.length === 0) {
      return reject(new Error('No input files provided.'));
    }

    const command = ffmpeg();

    // Add each file as an input
    inputFiles.forEach((file) => {
      command.input(file);
    });

    // Combine them in order
    command
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Audio files combined successfully!');
        resolve(true);
      })
      .mergeToFile(path.resolve(outputFile), tempDir);
  });
}
