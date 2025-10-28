import { useEffect, useState } from 'react';
import useData from '../Providers/useData';

const useLandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameMemoized,
}) => {
  const { getYoutubeID, checkTopicNeedsReviewBool, getTopicStatus } = useData();
  const [contentSelectionState, setContentSelectionState] = useState([]);

  useEffect(() => {
    if (
      generalTopicDisplayNameMemoized?.length > 0 &&
      contentSelectionState?.length === 0
    ) {
      const today = new Date();
      const comprehensiveState = generalTopicDisplayNameMemoized.map(
        ({ youtubeId, title }) => {
          const { isThisDue, isThisNew, hasAllBeenReviewed } = getTopicStatus(
            title,
            today,
          );

          return {
            title,
            youtubeId,
            isThisDue,
            isThisNew,
            hasAllBeenReviewed,
          };
        },
      );

      const sortedComprehensiveState = comprehensiveState.sort((a, b) => {
        const rank = (obj) =>
          obj.isThisDue === true
            ? 0 // highest priority
            : obj.isThisNew === true
            ? 1 // second
            : obj.hasAllBeenReviewed
            ? 3
            : 2; // lowest

        return rank(a) - rank(b);
      });
      setContentSelectionState(sortedComprehensiveState);
    }
  }, [
    generalTopicDisplayNameSelectedState,
    checkTopicNeedsReviewBool,
    getYoutubeID,
    generalTopicDisplayNameMemoized,
  ]);

  return { contentSelectionState };
};

export default useLandingScreenContentSelection;
