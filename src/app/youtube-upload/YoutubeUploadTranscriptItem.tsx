import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import clsx from 'clsx';
import { Edit2Icon, PauseCircleIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';
import { removeFirstSlashH, slashHIn } from './slashH';

const YoutubeUploadTranscriptItem = ({
  item,
  thisIsPlaying,
  isVideoPlaying,
  handlePause,
  playFromHere,
  isArabic,
  numberOfBaseLangLessItems,
  handleChange,
  indexNum,
}) => {
  const [openToEditState, setOpenToEditState] = useState(false);
  const slashHMatch = slashHIn(item.targetLang ?? '');
  return (
    <div
      className={clsx(
        'flex items-start space-x-4 border p-2 rounded-md',
        thisIsPlaying ? 'bg-yellow-200' : '',
      )}
    >
      <div className='flex flex-col gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={() =>
            isVideoPlaying && thisIsPlaying
              ? handlePause()
              : playFromHere(item.time)
          }
        >
          {isVideoPlaying && thisIsPlaying ? <PauseCircleIcon /> : <PlayIcon />}
        </Button>
        <Button
          onClick={() => setOpenToEditState(!openToEditState)}
          size='sm'
          variant='outline'
        >
          <Edit2Icon />
        </Button>
        {slashHMatch && (
          <Button
            type='button'
            size='sm'
            className='bg-amber-500 px-2 text-white hover:bg-amber-600'
            onClick={() =>
              handleChange(
                indexNum,
                'targetLang',
                removeFirstSlashH(item.targetLang),
              )
            }
          >
            {slashHMatch[0]}
          </Button>
        )}
      </div>
      <div className='flex-1 flex flex-col space-y-1'>
        <div
          className={clsx('w-full', isArabic ? 'text-right' : '')}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <span>{item.originalIndex})</span>
          {openToEditState ? (
            <Textarea
              value={item.targetLang ?? ''}
              placeholder='Target language text'
              onChange={(e) =>
                handleChange(indexNum, 'targetLang', e.target.value)
              }
              className='mt-1'
            />
          ) : (
            <span> {item.targetLang}</span>
          )}
        </div>

        <div>
          {numberOfBaseLangLessItems === 0 && !openToEditState ? (
            <span>{item.baseLang}</span>
          ) : (
            <Textarea
              value={item.baseLang ?? ''}
              placeholder='Base language text'
              onChange={(e) =>
                handleChange(indexNum, 'baseLang', e.target.value)
              }
            />
          )}
        </div>
        {isArabic && (
          <>
            <hr />
            <div>
              {isArabic && item?.transliteration && !openToEditState ? (
                <span>{item.transliteration}</span>
              ) : isArabic ? (
                <Textarea
                  value={item.transliteration ?? ''}
                  placeholder='Transliteration language text'
                  onChange={(e) =>
                    handleChange(indexNum, 'transliteration', e.target.value)
                  }
                />
              ) : null}
            </div>
          </>
        )}
      </div>
      <div className='flex-shrink-0 text-sm font-mono text-gray-600'>
        {item.time}s
      </div>
    </div>
  );
};

export default YoutubeUploadTranscriptItem;
