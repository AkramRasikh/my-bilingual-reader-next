import useLandingScreenContentSelection from './useLandingUIContentSelection';
import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import useLearningScreen from '../LearningScreen/useLearningScreen';

const LandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameMemoized,
}) => {
  const { handleSelectInitialTopic, selectedContentState } =
    useLearningScreen();
  const contentSelectionMemoized = useLandingScreenContentSelection({
    generalTopicDisplayNameSelectedState,
    generalTopicDisplayNameMemoized,
  });

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

export default LandingScreenContentSelection;
