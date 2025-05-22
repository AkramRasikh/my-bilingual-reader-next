import { createEmptyCard, generatorParameters, fsrs } from 'ts-fsrs';

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
