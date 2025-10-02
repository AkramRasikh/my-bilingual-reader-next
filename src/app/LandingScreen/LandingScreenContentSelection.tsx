import useLandingScreenContentSelection from './useLandingScreenContentSelection';
import LandingScreenContentSelectionItem from './LandingScreenContentSelectionItem';
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
              <LandingScreenContentSelectionItem
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
