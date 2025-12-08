import { WordTypes } from '../types/word-types';

export type WordActions =
  | {
      type: 'initWords';
      words: WordTypes[];
    }
  | {
      type: 'addWord';
      word: WordTypes;
    }
  | {
      type: 'removeWord';
      wordId: WordTypes['id'];
    }
  | {
      type: 'removeWords';
      ids: WordTypes['id'][];
    }
  | {
      type: 'updateWord';
      wordId: WordTypes['id'];
      data: { reviewData: WordTypes['reviewData'] }; // maybe needs review
    }
  | {
      type: 'updateWordData';
      wordId: WordTypes['id'];
      fields: Partial<WordTypes>;
    };

export function wordsReducer(state: WordTypes[], action: WordActions) {
  switch (action.type) {
    case 'initWords':
      // for your first useEffect initialization
      return action.words;

    case 'addWord':
      // Add one or multiple words to the state
      // If duplicates (by id) may occur, you can merge intelligently
      return [...state, action.word];

    case 'removeWord':
      return state.filter((item) => item.id !== action.wordId);

    case 'removeWords':
      return state.filter((item) => !action.ids.includes(item.id));

    case 'updateWord':
      return state.map((item) => {
        if (item.id === action.wordId) {
          const isDue = action?.data?.reviewData?.due < new Date();
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
