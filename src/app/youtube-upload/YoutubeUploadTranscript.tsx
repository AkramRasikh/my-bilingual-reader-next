'use client';

import { Input } from '@/components/ui/input';
import { useCallback } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { PauseCircleIcon, PlayIcon } from 'lucide-react';
import { arabic } from '../languages';

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
    <div className='flex flex-col space-y-2 max-w-lg m-auto max-h-200 overflow-y-scroll pr-2.5'>
      {transcriptState.map((item, index) => {
        const thisIsPlaying = item.id === masterPlay;
        if (item?.baseLang && onlyShowNonBaseLangState) {
          return null;
        }
        return (
          <div
            key={index}
            className={clsx(
              'flex items-start space-x-4 border p-2 rounded-md',
              thisIsPlaying ? 'bg-yellow-200' : '',
            )}
          >
            <Button
              size='sm'
              onClick={() =>
                isVideoPlaying && thisIsPlaying
                  ? handlePause()
                  : playFromHere(item.time)
              }
            >
              {isVideoPlaying && thisIsPlaying ? (
                <PauseCircleIcon />
              ) : (
                <PlayIcon />
              )}
            </Button>

            <div className='flex-1 flex flex-col space-y-1'>
              <div
                className={clsx('w-full', isArabic ? 'text-right' : '')}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                <span>
                  {item.originalIndex}) {item.targetLang}
                </span>
              </div>

              <div>
                {numberOfBaseLangLessItems === 0 ? (
                  <span>{item.baseLang}</span>
                ) : (
                  <Input
                    value={item.baseLang ?? ''}
                    placeholder='Base language text'
                    onChange={(e) =>
                      handleChange(index, 'baseLang', e.target.value)
                    }
                  />
                )}
              </div>
            </div>
            <div className='flex-shrink-0 text-sm font-mono text-gray-600'>
              {item.time}s
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default YoutubeUploadTranscript;
