import ffmpeg from 'fluent-ffmpeg';

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
