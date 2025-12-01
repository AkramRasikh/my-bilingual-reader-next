// Initial states
// const initialContentState = [];
// const initialSelectedContentState = null;

// Reducer for contentState
export function contentReducer(state, action) {
  switch (action.type) {
    case 'initContent':
      // for your first useEffect initialization
      return action.content;

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
    case 'updateSentences':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                action.sentenceIds.includes(s.id)
                  ? { ...s, ...action.fields }
                  : s,
              ),
            }
          : topic,
      );

    case 'removeReview':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              content: topic.content.map((s) =>
                s.id === action.sentenceId
                  ? (({ reviewData, ...rest }) => rest)(s)
                  : s,
              ),
            }
          : topic,
      );

    case 'updateMetaData':
      return state.map((topic, idx) =>
        idx === action.contentIndex
          ? {
              ...topic,
              ...action.fieldToUpdate,
            }
          : topic,
      );

    case 'deleteContent': {
      // 1. Remove the topic with the matching id
      const filtered = state.filter((topic) => topic.id !== action.id);

      // 2. Reindex all remaining topics
      return filtered.map((topic, newIndex) => ({
        ...topic,
        contentIndex: newIndex,
      }));
    }

    default:
      return state;
  }
}

// const removeReviewFromContentStateFunc = ({ sentenceId, contentIndex }) => {
//   setContentState((prev) => {
//     const newContent = [...prev]; // clone top-level array

//     const topic = { ...newContent[contentIndex] }; // clone topic object
//     const updatedContent = topic.content.map((s) =>
//       s.id === sentenceId ? (({ reviewData, ...rest }) => rest)(s) : s,
//     );

//     topic.content = updatedContent;
//     newContent[contentIndex] = topic;

//     return newContent;
//   });
// };
