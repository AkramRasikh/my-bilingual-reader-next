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

export const mockUpdateSentenceReview = (
  mockUpdateSentenceReviewResponse: ReviewDataTypes,
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
