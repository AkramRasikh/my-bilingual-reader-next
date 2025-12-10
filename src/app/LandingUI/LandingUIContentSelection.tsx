import LandingUIContentSelectionItem from './LandingUIContentSelectionItem';
import { useLandingScreen } from '../Providers/LandingScreenProvider';

const LandingUIContentSelection = () => {
  const { generalTopicDisplayNameMemoized } = useLandingScreen();

  return (
    <ul className='flex flex-wrap gap-2'>
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
