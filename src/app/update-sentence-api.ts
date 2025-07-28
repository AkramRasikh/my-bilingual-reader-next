export const updateSentenceDataAPI = async ({
  topicName,
  sentenceId,
  fieldToUpdate,
  language,
}) => {
  try {
    const response = await fetch('/api/updateSentence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        title: topicName,
        id: sentenceId,
        fieldToUpdate,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseToJSON = await response.json();

    return responseToJSON;
  } catch (error) {
    console.log('## updateSentenceDataAPI error: ', error);
  }
};
