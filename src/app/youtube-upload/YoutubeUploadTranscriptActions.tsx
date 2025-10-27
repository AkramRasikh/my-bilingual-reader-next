import clsx from 'clsx';
import { useState } from 'react';
import { useYoutubeUpload } from './YoutubeUploadProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ClipboardCopyIcon } from 'lucide-react';
import YoutubeUploadTranscriptTransliterationActions from './YoutubeUploadTranscriptTransliterationActions';
import { arabic } from '../languages';

const YoutubeUploadTranscriptActions = () => {
  const [inputText, setInputText] = useState('');

  const {
    setTranscriptState,
    transcriptState,
    onlyShowNonBaseLangState,
    setOnlyShowNonBaseLangState,
    numberOfBaseLangLessItems,
    form,
  } = useYoutubeUpload();

  const isArabic = form.language === arabic;

  const handleCopy = async () => {
    try {
      const filterForNoTranscript = transcriptState.filter(
        (item) => !item?.baseLang,
      );
      const formattedSubs = [...filterForNoTranscript]
        .slice(0, 200)
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
        return found ? { ...item, baseLang: found.translation } : item;
      }),
    );
    setInputText('');
  };
  return (
    <div className='mx-auto w-lg'>
      <div>
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
            disabled={numberOfBaseLangLessItems === 0}
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
                Show non-translated {numberOfBaseLangLessItems}/
                {transcriptState?.length}
              </Label>
              <Switch
                checked={onlyShowNonBaseLangState}
                onCheckedChange={setOnlyShowNonBaseLangState}
              />
            </div>
          </div>
        </div>
      </div>
      {isArabic && <YoutubeUploadTranscriptTransliterationActions />}
    </div>
  );
};

export default YoutubeUploadTranscriptActions;
