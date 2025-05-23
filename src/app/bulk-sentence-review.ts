export const sentenceReviewBulkAPI = async ({
  title,
  fieldToUpdate,
  language,
  removeReview,
}) => {
  try {
    const response = await fetch('/api/bulkSentenceReview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        title,
        fieldToUpdate,
        removeReview,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseToJSON = await response.json();

    return responseToJSON;
  } catch (error) {
    console.log('## sentenceReviewBulk error: ', error);
  }
};
