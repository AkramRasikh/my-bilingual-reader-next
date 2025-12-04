export const sentenceReviewBulkAPI = async ({
  language,
  contentId,
  sentenceIds,
  reviewData,
}) => {
  try {
    const response = await fetch('/api/bulkSentenceReview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        contentId,
        sentenceIds,
        reviewData,
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
