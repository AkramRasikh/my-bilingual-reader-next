import { createEmptyCard, generatorParameters, fsrs, State } from 'ts-fsrs';
import { getTimeDiffSRS } from './get-time-diff-srs';
import { ReviewDataTypes } from '../types/shared-types';

interface SRSContentTypeOptions {
  vocab: 'vocab';
  sentences: 'sentences';
  topic: 'topic';
  media: 'media';
  snippet: 'snippet';
}

export const isMoreThanADayAhead = (date: Date, currentDue: Date) => {
  const diffMs = new Date(date).getTime() - currentDue.getTime();

  return diffMs >= (23 * 60 + 50) * 60 * 1000;
};

export const setToFiveAM = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(5, 0, 0, 0);
  return newDate;
};

export const srsCalculationAndText = ({
  reviewData,
  contentType,
  timeNow,
}: {
  contentType: keyof SRSContentTypeOptions;
  timeNow: Date;
  reviewData?: ReviewDataTypes;
}) => {
  const cardDataRelativeToNow =
    reviewData ?? (getEmptyCard() as ReviewDataTypes);

  const nextScheduledOptions = getNextScheduledOptions({
    card: cardDataRelativeToNow,
    contentType,
  });
  const againDue = nextScheduledOptions['1'].card.due;
  const hardDue = nextScheduledOptions['2'].card.due;
  const goodDue = nextScheduledOptions['3'].card.due;
  const easyDue = nextScheduledOptions['4'].card.due;

  const isScheduledForDeletion = isEasyIntervalScheduledForDeletion({
    contentType,
    easyDue,
    timeNow,
  });

  const againText = getTimeDiffSRS({
    dueTimeStamp: againDue,
    timeNow,
  }) as string;
  const hardText = getTimeDiffSRS({ dueTimeStamp: hardDue, timeNow }) as string;
  const goodText = getTimeDiffSRS({ dueTimeStamp: goodDue, timeNow }) as string;
  const easyText = getTimeDiffSRS({ dueTimeStamp: easyDue, timeNow }) as string;

  return {
    againText,
    hardText,
    goodText,
    easyText,
    nextScheduledOptions,
    isScheduledForDeletion,
  };
};

// grade = [1,2,3,4]
export const srsRetentionKey = {
  vocab: 0.98,
  sentences: 0.97,
  topic: 0.95,
  media: 0.93,
  snippet: 0.93,
} as Record<keyof SRSContentTypeOptions, number>;

export const srsRetentionKeyTypes = {
  vocab: 'vocab',
  sentences: 'sentences',
  topic: 'topic',
  media: 'media',
  snippet: 'snippet',
} as SRSContentTypeOptions;

export const VOCAB_EASY_DELETE_AFTER_DAYS = 45;
export const SENTENCE_EASY_DELETE_AFTER_DAYS = 30;

export const isEasyIntervalScheduledForDeletion = ({
  contentType,
  easyDue,
  timeNow,
}: {
  contentType: keyof SRSContentTypeOptions;
  easyDue: Date;
  timeNow: Date;
}) => {
  const deleteAfterDays =
    contentType === srsRetentionKeyTypes.vocab
      ? VOCAB_EASY_DELETE_AFTER_DAYS
      : contentType === srsRetentionKeyTypes.sentences
        ? SENTENCE_EASY_DELETE_AFTER_DAYS
        : null;

  if (deleteAfterDays == null) {
    return false;
  }

  const daysAhead =
    (new Date(easyDue).getTime() - new Date(timeNow).getTime()) /
    (1000 * 60 * 60 * 24);

  return daysAhead >= deleteAfterDays;
};

const initFsrs = ({
  contentType,
}: {
  contentType: keyof SRSContentTypeOptions;
}) => {
  const retentionKey = srsRetentionKey[contentType] as number;
  const params = generatorParameters({
    maximum_interval: 1000,
    request_retention: retentionKey,
  });
  return fsrs(params);
};

export const getNextScheduledOptions = ({
  card,
  contentType,
}: {
  card: ReviewDataTypes;
  contentType: keyof SRSContentTypeOptions;
}) => {
  const f = initFsrs({ contentType });
  return f.repeat(card, new Date());
};

// last_review: new Date('2024-10-11T11:09:52.190Z'),
export const getEmptyCard = () => {
  const card = createEmptyCard() as ReviewDataTypes;
  card.ease = 2.5; // Default ease factor for a new card
  card.interval = 0; // Initial interval for a new card
  card.state = State.New; // Set the card state
  return card;
};
