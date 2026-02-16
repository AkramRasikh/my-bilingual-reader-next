// Initial states
// const initialSentencesState = [];

import { isDueCheck } from '@/utils/is-due-check';
import { SentenceTypes } from '../types/sentence-types';

export type SentenceActions =
  | {
      type: 'initSentences';
      sentences: SentenceTypes[];
    }
  | {
      type: 'addSentence';
      sentence: SentenceTypes;
    }
  | {
      type: 'updateSentence';
      sentenceId: SentenceTypes['id'];
      isRemoveReview?: boolean;
      updatedFieldFromDB?: Partial<SentenceTypes>;
    }
  | {
      type: 'removeSentences';
      sentenceIds: SentenceTypes['id'][];
    };

export function sentencesReducer(
  state: SentenceTypes[],
  action: SentenceActions,
) {
  switch (action.type) {
    case 'initSentences':
      return action.sentences || [];
    case 'addSentence':
      return [...state, action.sentence];
    case 'updateSentence': {
      const { sentenceId, isRemoveReview, updatedFieldFromDB } = action;
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
    case 'removeSentences': {
      const { sentenceIds } = action;
      return state.filter((sentence) => !sentenceIds.includes(sentence.id));
    }

    default:
      return state;
  }
}
