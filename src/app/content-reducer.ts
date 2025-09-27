// Initial states
// const initialContentState = [];
// const initialSelectedContentState = null;

// Reducer for contentState
export function contentReducer(state, action) {
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
