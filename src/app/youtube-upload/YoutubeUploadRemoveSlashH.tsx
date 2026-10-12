'use client';

import { Button } from '@/components/ui/button';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import { countSlashH, removeAllSlashH } from './slashH';

const YoutubeUploadRemoveSlashH = () => {
  const { transcriptState, setTranscriptState } = useYoutubeUpload();

  const count = transcriptState.reduce(
    (total, item) => total + countSlashH(item.targetLang ?? ''),
    0,
  );

  if (count === 0) return null;

  const removeAll = () => {
    setTranscriptState((prev) =>
      prev.map((item) => ({
        ...item,
        targetLang: removeAllSlashH(item.targetLang ?? ''),
      })),
    );
  };

  return (
    <div className='my-2 flex items-center justify-center gap-2'>
      <Button
        type='button'
        className='bg-amber-500 text-white hover:bg-amber-600'
        onClick={removeAll}
      >
        Remove all \h
      </Button>
      <span className='text-sm text-muted-foreground'>{count}</span>
    </div>
  );
};

export default YoutubeUploadRemoveSlashH;
