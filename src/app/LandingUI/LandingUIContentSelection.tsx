import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import useLearningScreen from '../LearningScreen/useLearningScreen';
import { useMemo } from 'react';
import { useLandingScreen } from '../Providers/LandingScreenProvider';

const LandingUIContentSelection = ({ generalTopicDisplayNameMemoized }) => {
  const {
    handleSelectInitialTopic,
    selectedContentState,
    generalTopicDisplayNameSelectedState,
  } = useLearningScreen();
  const { getTopicStatus } = useLandingScreen();

  const contentSelectionMemoized = useMemo(() => {
    if (generalTopicDisplayNameMemoized?.length === 0) {
      return [];
    }

    const today = new Date();
    const comprehensiveState = generalTopicDisplayNameMemoized.map(
      ({ youtubeId, title }) => {
        const { isThisDue, isThisNew, hasAllBeenReviewed, numberOfDueWords } =
          getTopicStatus(title, today);

        return {
          title,
          youtubeId,
          isThisDue,
          isThisNew,
          hasAllBeenReviewed,
          numberOfDueWords,
        };
      },
    );

    const sortedComprehensiveState = comprehensiveState.sort((a, b) => {
      const rank = (obj) =>
        obj.isThisDue === true
          ? 0 // highest priority
          : obj.hasAllBeenReviewed
          ? 1
          : 2; // lowest

      return rank(a) - rank(b);
    });

    return sortedComprehensiveState;
  }, [generalTopicDisplayNameSelectedState]);

  return (
    <ul className='flex flex-wrap gap-2'>
      {!selectedContentState &&
        contentSelectionMemoized?.length > 0 &&
        contentSelectionMemoized.map((youtubeMetaData, index) => {
          return (
            <li key={index}>
              <LandingUIContentSelectionItem
                handleSelectInitialTopic={handleSelectInitialTopic}
                youtubeMetaData={youtubeMetaData}
              />
            </li>
          );
        })}
    </ul>
  );
};

export default LandingUIContentSelection;
