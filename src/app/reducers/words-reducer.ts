// Initial states
// const initialWordsState = [];

// Reducer for wordsState
export function wordsReducer(state, action) {
  switch (action.type) {
    case 'addWord':
      // Add one or multiple words to the state
      // If duplicates (by id) may occur, you can merge intelligently
      return [...state, action.word];

    case 'removeWord':
      return state.filter((item) => item.id !== action.wordId);

    case 'updateWord':
      return state.map((item) => {
        if (item.id === action.wordId) {
          const isDue = action.data?.reviewData?.due < new Date();
          return {
            ...item,
            ...action.data,
            isDue,
          };
        }
        return item;
      });

    case 'updateWordData':
      return state.map((item) => {
        if (item.id === action.wordId) {
          return {
            ...item,
            ...action.fields, // allows updating any field (imageUrl, reviewData, etc.)
          };
        }
        return item;
      });

    default:
      return state;
  }
}
