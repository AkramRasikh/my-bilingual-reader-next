import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClipboardCopyIcon } from 'lucide-react';

const YoutubeUploadTranscriptTransliterationActions = () => {
  const [onlyShowNonTransliteratedState, setOnlyShowNonTransliteratedState] =
    useState(false);
  const [inputText, setInputText] = useState('');

  const { setTranscriptState, transcriptState } = useYoutubeUpload();

  const transcriptItemsTransliterationLang = useMemo(
    () => transcriptState?.filter((item) => !item?.transliteration),
    [transcriptState],
  );

  const numberOfTransliterationLessItems =
    transcriptItemsTransliterationLang?.length;

  const handleCopy = async () => {
    try {
      //
      const filterForNoTranscript = transcriptState.filter(
        (item) =>
          !item?.baseLang ||
          item?.baseLang === '' ||
          item?.baseLang?.trim() === '',
      );
      const formattedSubs = [...filterForNoTranscript]
        .slice(0, 50)
        .map((item) => `@@${item.originalIndex}@@ ${item.targetLang}`)
        .join('\n');
      await navigator.clipboard.writeText(formattedSubs);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const parseTranslations = (text: string) => {
    const regex = /@@(\d+)@@\s*([^@]+)/g;
    const results: { index: number; translation: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      results.push({
        index: Number(match[1]),
        translation: match[2].trim(),
      });
    }
    return results;
  };

  const handleApply = () => {
    const parsed = parseTranslations(inputText);
    setTranscriptState((prev) =>
      prev.map((item) => {
        const found = parsed.find((p) => p.index === item.originalIndex);
        return found ? { ...item, transliteration: found.translation } : item;
      }),
    );
    setInputText('');
  };
  return (
    <div
      className={clsx(
        'mx-auto w-lg',
        // numberOfTransliterationLessItems > 0 ? 'opacity-100' : 'opacity-50',
      )}
    >
      <p className='text-center underline'>Transliteration</p>
      <div className='flex gap-5'>
        <Button
          onClick={handleCopy}
          className='active:scale-90 active:bg-amber-600 transition-transform transition-colors duration-150 ease-out text-white'
        >
          <ClipboardCopyIcon />
        </Button>
        <Textarea
          placeholder='Paste translated text here (with @@ markers)...'
          value={inputText}
          disabled={numberOfTransliterationLessItems === 0}
          onChange={(e) => setInputText(e.target.value)}
          className='h-10 w-full'
        />
        <Button
          onClick={handleApply}
          className={clsx(inputText ? 'animate-pulse bg-amber-700' : '')}
          disabled={!inputText.trim()}
        >
          Apply
        </Button>
      </div>

      <div className='m-2'>
        <div className='m-auto'>
          <div className='flex gap-2 justify-center'>
            <Label>
              Show non-translated {numberOfTransliterationLessItems}/
              {transcriptState?.length}
            </Label>
            <Switch
              checked={onlyShowNonTransliteratedState}
              onCheckedChange={setOnlyShowNonTransliteratedState}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YoutubeUploadTranscriptTransliterationActions;
