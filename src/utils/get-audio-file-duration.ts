import { parseFile } from 'music-metadata';

export const getAudioFileDuration = async (filePath: string) => {
  const metadata = await parseFile(filePath);
  return metadata.format.duration;
};
