// Initial states
// const initialWordsState = [];

// Reducer for wordsState
export function wordsReducer(state, action) {
  switch (action.type) {
    case 'addWord':
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
