const VOICEVOX_API = 'http://localhost:50021';

export const synthesisVoiceVox = async (
  audioQueryResponse: unknown,
  speakerNumber: number,
) => {
  const synthesisRes = await fetch(
    `${VOICEVOX_API}/synthesis?speaker=${speakerNumber}`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/wav',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(audioQueryResponse),
    },
  );

  return synthesisRes;
};
