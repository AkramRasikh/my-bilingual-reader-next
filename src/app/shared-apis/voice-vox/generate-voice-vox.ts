const VOICEVOX_API = 'http://localhost:50021';

export const generateVoiceVox = async (text: string, speakerNumber: number) => {
  const audioGenerationResult = await fetch(
    `${VOICEVOX_API}/audio_query?text=${encodeURIComponent(
      text,
    )}&speaker=${speakerNumber}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    },
  );
  return audioGenerationResult;
};
