import { useMemo } from 'react';
import useData from '../Providers/useData';

const useLandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameMemoized,
}) => {
  const { getYoutubeID, getTopicStatus } = useData();

  const contentSelectionMemoized = useMemo(() => {
    if (generalTopicDisplayNameMemoized?.length === 0) {
      return [];
    }

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

    return sortedComprehensiveState;
  }, [
    generalTopicDisplayNameSelectedState,
    getYoutubeID,
    getTopicStatus,
    generalTopicDisplayNameMemoized,
  ]);

  return contentSelectionMemoized;
};

export default useLandingScreenContentSelection;
