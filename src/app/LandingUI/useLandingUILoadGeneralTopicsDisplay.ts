import { useEffect } from 'react';
import useData from '../Providers/useData';

const useLandingScreenLoadGeneralTopicsDisplay = () => {
  const { contentState, setGeneralTopicDisplayNameState } = useData();

  useEffect(() => {
    const generalNamesArr = [];

    for (const contentItem of contentState) {
      const itemGenName = contentItem.generalTopicName;
      const isMedia = contentItem?.origin === 'youtube';
      if (
        isMedia &&
        !generalNamesArr.some((item) => item.title === itemGenName)
      ) {
        const youtubeId = contentItem?.url?.split('=')[1];
        generalNamesArr.push({
          title: itemGenName,
          youtubeId,
        });
      }
    }
    setGeneralTopicDisplayNameState(generalNamesArr);
  }, []);
};

export default useLandingScreenLoadGeneralTopicsDisplay;
