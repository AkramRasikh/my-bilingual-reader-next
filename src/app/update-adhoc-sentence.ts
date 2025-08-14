export const updateAdhocSentenceAPI = async ({
  sentenceId,
  fieldToUpdate,
  language,
}) => {
  console.log('## ', {
    language,
    id: sentenceId,
    fieldToUpdate,
  });

  try {
    const response = await fetch('/api/updateAdhocSentence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        id: sentenceId,
        fieldToUpdate,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseToJSON = await response.json();

    console.log('## responseToJSON', responseToJSON);

    return responseToJSON;
  } catch (error) {
    console.log('## updateAdhocSentenceAPI error: ', error);
  }
};
