import { useEffect } from 'react';
import useData from '../useData';
import { getGeneralTopicName } from '../../utils/get-general-topic-name';
import { getCloudflareVideoURL } from '../media-utils/get-media-url';
import checkIfVideoExists from '../client-api/check-if-video-exists';
import { japanese } from '../languages';

const useLandingScreenLoadGeneralTopicsDisplay = ({ setIsLoadingState }) => {
  const { contentState, setGeneralTopicDisplayNameState } = useData();

  useEffect(() => {
    const loadYoutubeTags = async () => {
      try {
        setIsLoadingState(true);
        const generalTopicNameTags: string[] = [];
        const generalTopicDisplayName: string[] = [];
        const youtubeContentTags: { title: string; reviewed?: any }[] = [];

        let youtubeTagsWithoutVideoBoolean: string[] = [];
        for (const contentItem of contentState) {
          if (!contentItem?.hasVideo && contentItem?.origin === 'youtube') {
            const generalTopicName = getCloudflareVideoURL(
              getGeneralTopicName(contentItem.title),
              japanese,
            );
            if (!youtubeTagsWithoutVideoBoolean.includes(generalTopicName)) {
              youtubeTagsWithoutVideoBoolean.push(generalTopicName);
              const videoExists = await checkIfVideoExists(generalTopicName);
              if (videoExists) {
                youtubeContentTags.push({
                  title: contentItem.title,
                  reviewed: contentItem?.reviewHistory,
                });
                generalTopicNameTags.push(generalTopicName);
                generalTopicDisplayName.push(
                  getGeneralTopicName(contentItem.title),
                );
              }
            }
          }
        }

        for (const contentItem of contentState) {
          const generalTopicName = getCloudflareVideoURL(
            getGeneralTopicName(contentItem.title),
            japanese,
          );
          const isInYoutubeContent = youtubeContentTags.some(
            (item) => item.title === contentItem.title,
          );

          if (
            generalTopicNameTags.includes(generalTopicName) &&
            !isInYoutubeContent
          ) {
            youtubeContentTags.push({
              title: contentItem.title,
              reviewed: contentItem?.reviewHistory,
            });
          } else if (
            contentItem?.origin === 'youtube' &&
            contentItem?.hasVideo &&
            !isInYoutubeContent
          ) {
            youtubeContentTags.push({
              title: contentItem.title,
              reviewed: contentItem?.reviewHistory,
            });
            generalTopicNameTags.push(generalTopicName);
            generalTopicDisplayName.push(
              getGeneralTopicName(contentItem.title),
            );
          }
        }

        setGeneralTopicDisplayNameState(generalTopicDisplayName);
      } catch (error) {
      } finally {
        setIsLoadingState(false);
      }
    };

    loadYoutubeTags();
  }, []);
};

export default useLandingScreenLoadGeneralTopicsDisplay;
