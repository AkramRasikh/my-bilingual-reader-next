// Initial states
// const initialSentencesState = [];

// Reducer for sentencesState
export function sentencesReducer(state, action) {
  switch (action.type) {
    case 'updateSentence':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                s.id === action.sentenceId ? { ...s, ...action.fields } : s,
              ),
            }
          : topic,
      );

    default:
      return state;
  }
}
