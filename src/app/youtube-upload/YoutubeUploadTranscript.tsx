'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCallback } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import clsx from 'clsx';

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
  const { transcriptState, setTranscriptState, masterPlay } =
    useYoutubeUpload();
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
        return (
          <div
            key={index}
            className={clsx(
              'flex items-start space-x-4 border p-2 rounded-md',
              thisIsPlaying ? 'bg-yellow-200' : '',
            )}
          >
            <div className='flex-1 flex flex-col space-y-1'>
              <div>
                <Label className='text-sm'>Target Language</Label>
                <Input
                  value={item.targetLang}
                  placeholder='Target language text'
                  onChange={(e) =>
                    handleChange(index, 'targetLang', e.target.value)
                  }
                />
              </div>
              <div>
                <Label className='text-sm'>Base Language</Label>
                <Input
                  value={item.baseLang ?? ''}
                  placeholder='Base language text'
                  onChange={(e) =>
                    handleChange(index, 'baseLang', e.target.value)
                  }
                />
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
