export const updateContentMetaDataAPI = async ({
  fieldToUpdate,
  language,
  indexKey,
}) => {
  try {
    const response = await fetch('/api/updateContentMetaData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        fieldToUpdate,
        indexKey,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseToJSON = await response.json();

    return responseToJSON;
  } catch (error) {
    console.log('## updateCreateReviewHistory error: ', error);
  }
};
