import { ReviewDataTypes } from '@/app/types/shared-types';

interface HasReviewData {
  reviewData?: ReviewDataTypes;
}

export const isDueCheck = (item: HasReviewData, todayDateObj: Date) => {
  if (!item?.reviewData?.due) {
    return false;
  }
  return new Date(item.reviewData.due) < todayDateObj;
};
