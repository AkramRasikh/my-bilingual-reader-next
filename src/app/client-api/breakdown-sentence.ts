export const breakdownSentenceAPI = async ({
  topicName,
  sentenceId,
  language,
  targetLang,
}) => {
  try {
    const response = await fetch('/api/breakdownSentence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        title: topicName,
        id: sentenceId,
        targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseToJSON = await response.json();

    return responseToJSON;
  } catch (error) {
    console.log('## breakdownSentenceAPI error: ', error);
  }
};
