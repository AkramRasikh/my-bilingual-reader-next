'use client';

import { useCallback, useState } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import { arabic } from '../languages';
import YoutubeUploadTranscriptItem from './YoutubeUploadTranscriptItem';

interface TranscriptItem {
  time: number;
  targetLang: string;
  baseLang?: string;
}

interface TranscriptEditorProps {
  transcriptState: TranscriptItem[];
  setTranscriptState: (state: TranscriptItem[]) => void;
}

const YoutubeUploadTranscript = () => {
  const {
    transcriptState,
    setTranscriptState,
    masterPlay,
    handlePause,
    playFromHere,
    onlyShowNonBaseLangState,
    numberOfBaseLangLessItems,
    isVideoPlaying,
    form,
  } = useYoutubeUpload();
  const isArabic = form.language === arabic;

  const handleChange = useCallback(
    (index: number, field: keyof TranscriptItem, value: string) => {
      setTranscriptState((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
    },
    [setTranscriptState],
  );

  return (
    <div className='flex flex-col space-y-2 max-w-lg m-auto max-h-160 overflow-y-scroll pr-2.5'>
      {transcriptState.map((item, index) => {
        const thisIsPlaying = item.id === masterPlay;
        if (item?.baseLang && onlyShowNonBaseLangState) {
          return null;
        }
        return (
          <YoutubeUploadTranscriptItem
            key={index}
            indexNum={index}
            item={item}
            thisIsPlaying={thisIsPlaying}
            isVideoPlaying={isVideoPlaying}
            handlePause={handlePause}
            playFromHere={playFromHere}
            isArabic={isArabic}
            numberOfBaseLangLessItems={numberOfBaseLangLessItems}
            handleChange={handleChange}
          />
        );
      })}
    </div>
  );
};

export default YoutubeUploadTranscript;
