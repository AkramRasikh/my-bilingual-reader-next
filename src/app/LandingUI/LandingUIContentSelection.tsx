import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import { useMemo } from 'react';
import { useLandingScreen } from '../Providers/LandingScreenProvider';
import { useRouter } from 'next/navigation';

const LandingUIContentSelection = ({ generalTopicDisplayNameMemoized }) => {
  const router = useRouter();
  const { getTopicStatus } = useLandingScreen();

  const handleSelectInitialTopic = (topicName) => {
    router.push(`/content?topic=${topicName}`);
  };

  const contentSelectionMemoized = useMemo(() => {
    const today = new Date();
    const comprehensiveState = generalTopicDisplayNameMemoized.map(
      ({ youtubeId, title }) => {
        const {
          isThisDue,
          isThisNew,
          hasAllBeenReviewed,
          numberOfDueWords,
          snippetsDue,
        } = getTopicStatus(title, today);

        return {
          title,
          youtubeId,
          isThisDue,
          isThisNew,
          hasAllBeenReviewed,
          numberOfDueWords,
          snippetsDue,
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
  }, []);

  return (
    <ul className='flex flex-wrap gap-2'>
      {contentSelectionMemoized?.length > 0 &&
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
