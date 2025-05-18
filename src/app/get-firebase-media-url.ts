export const getFirebaseVideoURL = (mp3FileName: string, language: string) => {
  const languageParam = `${language}-video%2F`;
  const baseURL = process.env.NEXT_PUBLIC_FIREBASE_ASSETS_URL + languageParam;
  const firebaseToken = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_ID;
  const url = `${baseURL}${mp3FileName}.mp4?alt=media&token=${firebaseToken}`;

  return url;
};
