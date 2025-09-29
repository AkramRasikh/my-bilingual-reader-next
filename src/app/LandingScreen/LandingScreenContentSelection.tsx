import useData from '../useData';
import useLandingScreenContentSelection from './useLandingScreenContentSelection';
import LandingScreenContentSelectionItem from './LandingScreenContentSelectionItem';

const LandingScreenContentSelection = ({
  generalTopicDisplayNameSelectedState,
  generalTopicDisplayNameState,
}) => {
  const { handleSelectInitialTopic } = useData();
  const { contentSelectionState } = useLandingScreenContentSelection({
    generalTopicDisplayNameSelectedState,
    generalTopicDisplayNameState,
  });

  return (
    <ul className='flex flex-wrap gap-2'>
      {!generalTopicDisplayNameSelectedState &&
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
