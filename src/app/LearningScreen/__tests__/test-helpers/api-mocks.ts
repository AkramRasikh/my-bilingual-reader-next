import { ContentTranscriptTypes } from '@/app/types/content-types';
import { ReviewDataTypes } from '@/app/types/shared-types';
import * as apiLib from '@/lib/api-request-wrapper';

export const DEFAULT_REVIEW_DATA: ReviewDataTypes = {
  due: new Date(),
  stability: 0.40255,
  difficulty: 7.1949,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 1,
  lapses: 0,
  state: 1,
  last_review: new Date(),
  ease: 2.5,
  interval: 0,
};

const dueTime2daysAway = new Date();
dueTime2daysAway.setDate(dueTime2daysAway.getDate() + 2);

export const REVIEW_DATA_2_DAYS_AWAY: ReviewDataTypes = {
  due: dueTime2daysAway,
  stability: 0.7,
  difficulty: 6.5,
  elapsed_days: 0,
  scheduled_days: 2,
  reps: 2,
  lapses: 0,
  state: 1,
  last_review: new Date(),
  ease: 2.6,
  interval: 2,
};

export const JAPANESE_WORD_FOR_REVIEW_1 = {
  baseForm: '世界',
  surfaceForm: '世界',
  contexts: ['sentence-1'],
  definition: 'world',
  id: 'mocked-id-sekai',
  notes: 'In this context, 世界 refers to the world or universe as a whole.',
  phonetic: 'せかい',
  reviewData: {
    ...DEFAULT_REVIEW_DATA,
  },
  transliteration: 'sekai',
};
export const JAPANESE_WORD_FOR_REVIEW_2 = {
  baseForm: '元気',
  surfaceForm: '元気',
  contexts: ['sentence-2'],
  definition: 'healthy; energetic',
  id: 'mocked-id-genki',
  notes: 'In this context, 元気 refers to being healthy or energetic.',
  phonetic: 'げんき',
  reviewData: {
    ...DEFAULT_REVIEW_DATA,
  },
  transliteration: 'genki',
};

export const MOCK_SNIPPET_1 = {
  id: 'mocked-snippet-id-1',
  time: 10,
  isContracted: true,
  contentId: 'content-1',
  targetLang: 'またね、友達！また公園ですぐに会いましょう。',
  baseLang: 'See you later, friend! Let us meet again soon at the park.',
  suggestedFocusText: '！また公園ですぐ',
  focusedText: '！また公園ですぐ',
  reviewData: DEFAULT_REVIEW_DATA,
};

export const mockUpdateSentenceReview = (
  mockUpdateSentenceReviewResponse: ContentTranscriptTypes['reviewData'],
) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateSentence') {
      return { reviewData: mockUpdateSentenceReviewResponse };
    }
    return {};
  });
};

export const mockUpdateWord = (wordData: any, daysToAdd: number = 0) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateWord') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToAdd);
      return {
        reviewData: { ...wordData.reviewData, due: dueDate.toISOString() },
      };
    }
    return {};
  });
};

export const mockSaveWord = (wordResponse: any) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/saveWord') {
      return { word: wordResponse };
    }
    return {};
  });
};

export const mockDeleteWord = (wordId: string) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/deleteWord') {
      return { id: wordId };
    }
    return {};
  });
};

export const mockUpdateContentMetaData = (contentResponse: any) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/updateContentMetaData') {
      return contentResponse;
    }
    return {};
  });
};

export const mockGetOnLoadData = (
  contentData: any[],
  wordsData: any[] = [],
  sentencesData: any[] = [],
) => {
  jest.spyOn(apiLib, 'apiRequestWrapper').mockImplementation(async (params) => {
    if (params.url === '/api/getOnLoadData') {
      return {
        contentData,
        wordsData,
        sentencesData,
      };
    }
    return {};
  });
};
