'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  FormData,
  LanguageOption,
  useYoutubeUpload,
} from './YoutubeUploadProvider';
import clsx from 'clsx';

const YouTubeUploadForm = () => {
  const {
    form,
    setForm,
    loading,
    setLoading,
    message,
    setMessage,
    videoTitleState,
    getYoutubeData,
    publicAudioUrlState,
    transcriptState,
    uploadContentToDb,
  } = useYoutubeUpload();

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    await getYoutubeData();
  };

  const handleUploadToDb = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    await uploadContentToDb();
  };

  const disableSubmit = loading || !form.url || !form.title || !form.language;
  const disableUploadToDb =
    loading ||
    !form.url ||
    !form.title ||
    !form.language ||
    !publicAudioUrlState ||
    !transcriptState;

  return (
    <div className={clsx('min-w-xl my-3', videoTitleState ? '' : '')}>
      <form
        onSubmit={handleSubmit}
        className={clsx('space-y-4 max-w-lg mx-auto p-4 border rounded-md')}
      >
        <div>
          <Label htmlFor='url' className='mb-2'>
            YouTube URL
          </Label>
          <Input
            id='url'
            type='text'
            value={form.url}
            onChange={(e) => handleChange('url', e.target.value)}
            placeholder='https://www.youtube.com/watch?v=...'
            required
          />
        </div>

        <div>
          <Label htmlFor='language' className='mb-2'>
            Language
          </Label>
          <Select
            value={form.language}
            onValueChange={(value) =>
              handleChange('language', value as LanguageOption)
            }
          >
            <SelectTrigger id='language'>
              <SelectValue placeholder='Select a language' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='japanese'>Japanese</SelectItem>
              <SelectItem value='chinese'>Chinese</SelectItem>
              <SelectItem value='arabic'>Arabic</SelectItem>
              <SelectItem value='french'>French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='title' className='mb-2'>
            Title
          </Label>
          <Input
            id='title'
            type='text'
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder='Enter a title for the audio file'
            required
          />
        </div>

        <Button type='submit' disabled={disableSubmit}>
          {loading ? 'Processing...' : 'Download Audio'}
        </Button>
        {transcriptState && publicAudioUrlState && (
          <Button
            onClick={handleUploadToDb}
            disabled={disableUploadToDb}
            className='ml-2'
          >
            {loading ? 'Uploading...' : 'Upload to DB'}
          </Button>
        )}
        {message && (
          <div className='mt-2 p-2 border rounded bg-gray-50 text-sm'>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default YouTubeUploadForm;
