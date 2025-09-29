import { useEffect, useState } from 'react';
import useData from '../useData';

const useLandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
}) => {
  const { getYoutubeID, checkTopicNeedsReviewBool, getTopicStatus } = useData();
  const [contentSelectionState, setContentSelectionState] = useState([]);

  useEffect(() => {
    if (generalTopicDisplayNameState?.length > 0) {
      const today = new Date();
      const comprehensiveState = generalTopicDisplayNameState.map(
        (youtubeTag) => {
          const youtubeId = getYoutubeID(youtubeTag);
          const { isThisDue, isThisNew, hasAllBeenReviewed } = getTopicStatus(
            youtubeTag,
            today,
          );

          return {
            youtubeTag,
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
    generalTopicDisplayNameState,
  ]);

  return { contentSelectionState };
};

export default useLandingScreenContentSelection;
