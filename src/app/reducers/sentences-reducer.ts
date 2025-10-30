// Initial states
// const initialSentencesState = [];

// Reducer for sentencesState
export function sentencesReducer(state, action) {
  switch (action.type) {
    case 'initSentences':
      return action.sentences;
    case 'addSentence':
      return [...state, action.sentence];
    case 'updateSentence': {
      const { sentenceId, isRemoveReview, updatedFieldFromDB, isDueCheck } =
        action;
      const dateNow = new Date();

      const updatedSentences = state
        .map((item) => {
          if (item.id === sentenceId) {
            if (isRemoveReview) {
              delete item.reviewData;
              return item;
            }
            return {
              ...item,
              ...updatedFieldFromDB,
            };
          }
          return item;
        })
        .filter((i) => isDueCheck(i, dateNow));

      return updatedSentences;
    }

    default:
      return state;
  }
}
