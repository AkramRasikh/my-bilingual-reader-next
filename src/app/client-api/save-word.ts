import { japanese } from '../languages';

const saveWordAPI = async ({
  highlightedWord,
  highlightedWordSentenceId,
  contextSentence,
  reviewData,
  meaning,
  isGoogle,
  // language,
}) => {
  try {
    const response = await fetch('/api/addWord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: japanese,
        word: highlightedWord,
        context: highlightedWordSentenceId,
        contextSentence,
        isGoogle,
        reviewData,
        meaning,
      }),
    });

    const res = await response.json();
    const wordAdded = res.word;

    return wordAdded;
  } catch (error) {
    console.log('## Error saveWordAPI to text: ', error);
  }
};

export default saveWordAPI;
