export const deleteWordAPI = async ({ wordId, language }) => {
  try {
    const response = await fetch('/api/deleteWord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        id: wordId,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return wordId;
  } catch (error) {
    console.log('## deleteSnippetAPI error: ', error);
  }
};
