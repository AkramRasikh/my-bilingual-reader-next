export const getFirebaseVideoURL = (mp3FileName: string, language: string) => {
  const languageParam = `${language}-video%2F`;
  const baseURL = process.env.NEXT_PUBLIC_FIREBASE_ASSETS_URL + languageParam;
  const url = `${baseURL}${mp3FileName}.mp4`;
  return url;
};
