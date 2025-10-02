import { createEmptyCard, generatorParameters, fsrs } from 'ts-fsrs';
import { getTimeDiffSRS } from './get-time-diff-srs';

const sentenceHelperUpperLimit = 30;

export const srsCalculationAndText = ({ reviewData, contentType, timeNow }) => {
  const hasDueDate = reviewData?.due ? new Date(reviewData?.due) : null; // check if due yet

  const cardDataRelativeToNow = hasDueDate ? reviewData : getEmptyCard();

  const nextScheduledOptions = getNextScheduledOptions({
    card: cardDataRelativeToNow,
    contentType, // srsRetentionKeyTypes.vocab
  });
  const againDue = nextScheduledOptions['1'].card.due;
  const hardDue = nextScheduledOptions['2'].card.due;
  const goodDue = nextScheduledOptions['3'].card.due;
  const easyDue = nextScheduledOptions['4'].card.due;

  const date1 = new Date(timeNow);
  const date2 = new Date(easyDue);
  const diffMs = date1 - date2;

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
};
export const srsRetentionKeyTypes = {
  vocab: 'vocab',
  sentences: 'sentences',
  topic: 'topic',
  media: 'media',
};

const initFsrs = ({ contentType }) => {
  const retentionKey = srsRetentionKey[contentType];
  const params = generatorParameters({
    maximum_interval: 1000,
    request_retention: retentionKey,
  });
  return fsrs(params);
};

export const getNextScheduledOptions = ({ card, contentType }) => {
  const f = initFsrs({ contentType });
  return f.repeat(card, new Date());
};

// last_review: new Date('2024-10-11T11:09:52.190Z'),
export const getEmptyCard = () => {
  const card = createEmptyCard() as any;
  card.ease = 2.5; // Default ease factor for a new card
  card.interval = 0; // Initial interval for a new card
  card.state = 'new'; // Set the card state
  return card;
};

export const initCardWithPreviousDateInfo = ({
  lastReviewDate,
  dueDate,
  reps,
}) => {
  const card = createEmptyCard() as any;
  card.due = new Date(dueDate);
  card.ease = 2.5; // Default ease factor for a new card
  card.interval = 0; // Initial interval for a new card
  card.reps = reps || 0;
  card.last_review = new Date(lastReviewDate); // Set the last review date to now
  return card;
};

export const getDueDate = (reviewData) => {
  if (reviewData?.due) {
    return new Date(reviewData?.due);
  }
  return null;
};

export const getCardDataRelativeToNow = ({
  hasDueDate,
  reviewData,
  nextReview,
  reviewHistory,
}) => {
  if (hasDueDate) {
    return reviewData;
  }

  if (nextReview) {
    return initCardWithPreviousDateInfo({
      lastReviewDate: reviewHistory[reviewHistory.length - 1],
      dueDate: nextReview,
      reps: reviewHistory.length,
    });
  }

  return getEmptyCard();
};
