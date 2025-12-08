import { ContentTypes } from '@/app/types/content-types';
import { SentenceTypes } from '@/app/types/sentence-types';
import { WordTypes } from '@/app/types/word-types';

export const content = 'content';
export const words = 'words';
export const sentences = 'sentences';

interface OnLoadTypes {
  content: ContentTypes[];
  words?: WordTypes[];
  sentences?: SentenceTypes[];
}

export const getFormattedData = (loadedData: OnLoadTypes) => {
  const data = {
    contentData: loadedData.content.map((contentWidget, contentIndex) => {
      return {
        ...contentWidget,
        contentIndex,
        generalTopicName: contentWidget.title,
      };
    }),
    wordsData: loadedData?.words,
    sentencesData: loadedData?.sentences,
  };

  return data;
};
