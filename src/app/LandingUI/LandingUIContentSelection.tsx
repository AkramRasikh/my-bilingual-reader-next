import useLandingScreenContentSelection from './useLandingUIContentSelection';
import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import useLearningScreen from '../LearningScreen/useLearningScreen';

const LandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameMemoized,
}) => {
  const { handleSelectInitialTopic, selectedContentState } =
    useLearningScreen();
  const { contentSelectionState } = useLandingScreenContentSelection({
    generalTopicDisplayNameSelectedState,
    generalTopicDisplayNameMemoized,
  });

  return (
    <ul className='flex flex-wrap gap-2'>
      {!selectedContentState &&
        contentSelectionState?.length > 0 &&
        contentSelectionState.map((youtubeMetaData, index) => {
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
