import { isDueCheck } from '@/utils/is-due-check';
import { WordTypes } from '../types/word-types';
import { ContentStateTypes } from './content-reducer';

export type WordActions =
  | {
      type: 'initWords';
      words: WordTypes[];
      content: ContentStateTypes[];
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
    }
  | {
      type: 'updateWordContext';
      id: WordTypes['id'];
      newContext: string; // the new context to add
    };

export function wordsReducer(state: WordTypes[], action: WordActions) {
  switch (action.type) {
    case 'initWords':
      if (!action.words || action.words.length === 0) {
        return [];
      }
      // for your first useEffect initialization
      // const sentencesState = action.sentences // need to figure out how this fits in
      const contentState = action.content;

      // Create a map of sentenceId -> content title
      const sentenceIdToTitleMap = contentState?.reduce(
        (acc, contentItem) => {
          contentItem.content.forEach((sentence) => {
            acc[sentence.id] = {
              title: contentItem.title,
              time: sentence.time,
            };
          });
          return acc;
        },
        {} as Record<string, { title: string; time: number }>,
      );

      const now = new Date();

      return action.words.map((word) => {
        const originalContext = word.contexts[0]; // assuming first is not sentenceState
        return {
          ...word,
          originalContext: sentenceIdToTitleMap
            ? sentenceIdToTitleMap[originalContext]?.title || null
            : null,
          isDue: isDueCheck(word, now),
          time: sentenceIdToTitleMap
            ? sentenceIdToTitleMap[originalContext]?.time || null
            : null,
        };
      });

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
          const isDue = action?.data?.reviewData?.due
            ? isDueCheck(action.data, new Date())
            : isDueCheck(item, new Date());
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
    case 'updateWordContext':
      return state.map((item) => {
        if (item.id === action.id) {
          return {
            ...item,
            contexts: [...item.contexts, action.newContext], // Add the new context to the existing array
          };
        }
        return item;
      });

    default:
      return state;
  }
}
