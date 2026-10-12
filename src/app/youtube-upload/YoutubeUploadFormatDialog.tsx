'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import clsx from 'clsx';
import { useYoutubeUpload, YoutubeFormat } from './YoutubeUploadProvider';

const formatBytes = (size: number | null) => {
  if (!size) return '';
  const units = ['B', 'KiB', 'MiB', 'GiB'];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const FormatTable = ({
  formats,
  name,
  selectedId,
  onSelect,
}: {
  formats: YoutubeFormat[];
  name: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) => (
  <div className='max-h-64 overflow-auto rounded border'>
    <table className='w-full text-left text-xs'>
      <thead className='sticky top-0 bg-gray-50'>
        <tr>
          <th className='p-2' />
          <th className='p-2'>ID</th>
          <th className='p-2'>Ext</th>
          <th className='p-2'>Resolution</th>
          <th className='p-2'>FPS</th>
          <th className='p-2'>Size</th>
          <th className='p-2'>Video</th>
          <th className='p-2'>Audio</th>
          <th className='p-2'>Note</th>
        </tr>
      </thead>
      <tbody>
        {formats.map((format) => {
          const selected = selectedId === format.id;
          return (
            <tr
              key={`${name}-${format.id}`}
              className={clsx(
                'cursor-pointer border-t',
                selected ? 'bg-amber-100' : 'hover:bg-amber-50',
              )}
              onClick={() => onSelect(format.id)}
            >
              <td className='p-2'>
                <input
                  type='radio'
                  name={name}
                  value={format.id}
                  checked={selected}
                  onChange={() => onSelect(format.id)}
                  aria-label={`${name} ${format.id}`}
                />
              </td>
              <td className='p-2 font-medium'>{format.id}</td>
              <td className='p-2'>{format.ext}</td>
              <td className='p-2'>{format.resolution ?? ''}</td>
              <td className='p-2'>{format.fps ?? ''}</td>
              <td className='p-2'>{formatBytes(format.filesize)}</td>
              <td className='p-2'>{format.vcodec ?? ''}</td>
              <td className='p-2'>{format.acodec ?? ''}</td>
              <td className='p-2'>{format.note ?? ''}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const YoutubeUploadFormatDialog = () => {
  const {
    formats,
    formatDialogOpen,
    setFormatDialogOpen,
    formatListError,
    formatRetryError,
    loading,
    retryVideoDownload,
  } = useYoutubeUpload();
  const [videoFormatId, setVideoFormatId] = useState('');
  const [audioFormatId, setAudioFormatId] = useState('');

  useEffect(() => {
    setVideoFormatId('');
    setAudioFormatId('');
  }, [formats]);

  const videoFormats = formats.filter(
    (format) => format.kind === 'video' || format.kind === 'both',
  );
  const audioFormats = formats.filter(
    (format) => format.kind === 'audio' || format.kind === 'both',
  );

  const handleRetry = async () => {
    await retryVideoDownload({ videoFormatId, audioFormatId });
  };

  return (
    <Dialog open={formatDialogOpen} onOpenChange={setFormatDialogOpen}>
      <DialogContent className='sm:max-w-6xl'>
        <DialogHeader>
          <DialogTitle>Choose video formats</DialogTitle>
          <DialogDescription>
            Formats 136 and 18 were unavailable. Pick one video format and one
            audio format, then retry the video download.
          </DialogDescription>
        </DialogHeader>

        {formatListError && (
          <div className='rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700'>
            {formatListError}
          </div>
        )}
        {formatRetryError && (
          <div className='rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700'>
            {formatRetryError}
          </div>
        )}

        {videoFormats.length === 0 && audioFormats.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            No downloadable formats were found.
          </p>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          <div>
            <p className='mb-2 text-sm font-medium'>Video</p>
            <FormatTable
              formats={videoFormats}
              name='video-format'
              selectedId={videoFormatId}
              onSelect={setVideoFormatId}
            />
          </div>
          <div>
            <p className='mb-2 text-sm font-medium'>Audio</p>
            <FormatTable
              formats={audioFormats}
              name='audio-format'
              selectedId={audioFormatId}
              onSelect={setAudioFormatId}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            onClick={handleRetry}
            disabled={loading || !videoFormatId || !audioFormatId}
          >
            {loading ? 'Retrying...' : 'Retry video download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YoutubeUploadFormatDialog;
