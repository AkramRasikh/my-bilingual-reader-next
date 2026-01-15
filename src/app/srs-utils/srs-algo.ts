import { createEmptyCard, generatorParameters, fsrs, State } from 'ts-fsrs';
import { getTimeDiffSRS } from './get-time-diff-srs';
import { ReviewDataTypes } from '../types/shared-types';

const sentenceHelperUpperLimit = 30;

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
  const hasDueDate = reviewData?.due ? new Date(reviewData?.due) : null; // check if due yet

  const cardDataRelativeToNow = hasDueDate
    ? reviewData
    : (getEmptyCard() as ReviewDataTypes);

  const nextScheduledOptions = getNextScheduledOptions({
    card: cardDataRelativeToNow,
    contentType,
  });
  const againDue = nextScheduledOptions['1'].card.due;
  const hardDue = nextScheduledOptions['2'].card.due;
  const goodDue = nextScheduledOptions['3'].card.due;
  const easyDue = nextScheduledOptions['4'].card.due;

  const date1 = new Date(timeNow);
  const date2 = new Date(easyDue);
  const diffMs = date1.getTime() - date2.getTime();

  // Convert to seconds, minutes, hours, days
  const diffSeconds = diffMs / 1000;
  const diffMinutes = diffSeconds / 60;
  const diffHours = diffMinutes / 60;
  const diffDays = diffHours / 24;

  const isScheduledForDeletion =
    srsRetentionKeyTypes.sentences === contentType &&
    Math.abs(diffDays) > sentenceHelperUpperLimit;

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
