import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import { useLandingUI } from './Provider/LandingUIProvider';

const LandingUIContentSelection = () => {
  const { generalTopicDisplayNameMemoized } = useLandingUI();

  return (
    <ul className='flex flex-wrap gap-4'>
      {generalTopicDisplayNameMemoized.map((youtubeMetaData, index) => {
        return (
          <li key={index}>
            <LandingUIContentSelectionItem {...youtubeMetaData} />
          </li>
        );
      })}
    </ul>
  );
};

export default LandingUIContentSelection;
