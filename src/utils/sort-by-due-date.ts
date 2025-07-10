export const sortByDueDate = (a, b) => {
  const aDate = a?.reviewData?.due;
  const bDate = b?.reviewData?.due;

  const aDateLegacy = a.nextReview;
  const bDateLegacy = b.nextReview;
  if ((aDate || aDateLegacy) < (bDate || bDateLegacy)) {
    return -1;
  }
  if ((aDate || aDateLegacy) > (bDate || bDateLegacy)) {
    return 1;
  }
  return 0;
};

export const sortByDueDateWords = (a, b) => {
  const aDate = a?.reviewData?.due ? a.reviewData.due : null;
  const bDate = b?.reviewData?.due ? b.reviewData.due : null;

  if (!aDate) return 1; // Push `a` to the end if `aDate` is missing
  if (!bDate) return -1; // Push `b` to the end if `bDate` is missing

  if (aDate < bDate) {
    return -1;
  }
  if (aDate > bDate) {
    return 1;
  }

  return 0;
};
