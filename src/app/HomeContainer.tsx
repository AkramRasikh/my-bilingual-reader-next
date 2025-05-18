'use client';
import { useState } from 'react';
import { getFirebaseVideoURL } from './get-firebase-media-url';
import { getGeneralTopicName } from './get-general-topic-name';
import { japanese } from './languages';

export default function VideoPlayer({ url }) {
  const videoUrl = url;

  return (
    <div className='flex justify-center items-center h-screen'>
      <video
        src={videoUrl}
        controls
        className='w-full max-w-3xl rounded-lg shadow-lg'
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

const LearningScreen = ({ selectedContentState }) => {
  const generalTopic = getGeneralTopicName(selectedContentState.title);
  const videoUrl = getFirebaseVideoURL(generalTopic, japanese);
  const content = selectedContentState.content;
  return (
    <div>
      <h1>{selectedContentState?.title}</h1>
      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <VideoPlayer url={videoUrl} />
        </div>
        <ul>
          {content.map((contentItem, index) => {
            const numberOrder = index + 1 + ') ';
            const baseLang = contentItem.baseLang;
            const targetLang = contentItem.targetLang;
            const id = contentItem.id;
            return (
              <li key={id}>
                <p>
                  <span>{numberOrder}</span>
                  {baseLang}
                </p>
                <p>{targetLang}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export const HomeContainer = ({
  targetLanguageLoadedSentences,
  targetLanguageLoadedWords,
  targetLanguageLoadedSnippetsWithSavedTag,
  sortedContent,
}) => {
  const [snippetsState, setSnippetsState] = useState(
    targetLanguageLoadedSnippetsWithSavedTag,
  );
  const [learningContentState, setLearningContentState] =
    useState(sortedContent);
  const [wordsState, setWordsState] = useState(targetLanguageLoadedWords);
  const [sentencesState, setSentencesState] = useState(
    targetLanguageLoadedSentences,
  );

  const [selectedContentState, setSelectedContentState] = useState(null);

  const handleSelectedContent = (thisYoutubeTitle) => {
    const thisContent = learningContentState.find(
      (item) => item?.title === thisYoutubeTitle,
    );
    setSelectedContentState(thisContent);
  };

  const youtubeContentTags = [];

  learningContentState.forEach((contentItem) => {
    if (contentItem?.origin === 'youtube' && contentItem?.hasVideo) {
      youtubeContentTags.push({
        title: contentItem.title,
        reviewed: contentItem?.reviewHistory,
      });
    }
  });

  return (
    <div style={{ padding: 10 }}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {!selectedContentState &&
          youtubeContentTags.map((youtubeTag, index) => {
            const title = youtubeTag.title;
            const reviewed = youtubeTag.reviewed;

            return (
              <li key={index}>
                <button
                  onClick={() => handleSelectedContent(title)}
                  style={{
                    border: '1px solid grey',
                    padding: 3,
                    backgroundColor: reviewed ? 'red' : 'lightgray',
                    borderRadius: 5,
                  }}
                >
                  {title}
                </button>
              </li>
            );
          })}
      </ul>
      {selectedContentState && (
        <LearningScreen selectedContentState={selectedContentState} />
      )}
    </div>
  );
};
