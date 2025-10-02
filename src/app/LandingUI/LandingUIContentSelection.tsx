import useLandingScreenContentSelection from './useLandingUIContentSelection';
import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import useLearningScreen from '../LearningScreen/useLearningScreen';

const LandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
}) => {
  const { handleSelectInitialTopic, selectedContentState } =
    useLearningScreen();
  const { contentSelectionState } = useLandingScreenContentSelection({
    generalTopicDisplayNameSelectedState,
    generalTopicDisplayNameState,
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
