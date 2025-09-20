export const getFirebaseVideoURL = (mp3FileName: string, language: string) => {
  const languageParam = `${language}-video%2F`;
  const baseURL = process.env.NEXT_PUBLIC_FIREBASE_ASSETS_URL + languageParam;
  const url = `${baseURL}${mp3FileName}.mp4`;
  return url;
};
export const getCloudflareImageURL = (
  mp3FileName: string,
  language: string,
) => {
  const languageParam = `${language}-words/`;
  const baseURL = process.env.NEXT_PUBLIC_FIREBASE_ASSETS_URL + languageParam;
  const url = `${baseURL}${mp3FileName}`;
  return url;
};

export const getAudioURL = (mp3FileName: string, language: string) => {
  const languageParam = `${language}-audio%2F`;
  const baseURL = process.env.NEXT_PUBLIC_FIREBASE_ASSETS_URL + languageParam;
  const url = `${baseURL}${mp3FileName}.mp3`;
  return url;
};
