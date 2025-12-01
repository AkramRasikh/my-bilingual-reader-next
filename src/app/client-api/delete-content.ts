export const deleteContentAPI = async ({ contentId, title, language }) => {
  try {
    const response = await fetch('/api/deleteContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        id: contentId,
        title,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.status === 200;
  } catch (error) {
    console.log('## deleteSnippetAPI error: ', error);
  }
};
