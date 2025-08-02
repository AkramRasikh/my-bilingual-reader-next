import { Button } from '@/components/ui/button';
import { KaraokePlayer } from './KaraokePlayer';
import useWords from './useWords';

const StoryComponent = ({ story }) => {
  const { addGeneratedSentence } = useWords();
  return (
    <div className='flex flex-col gap-2 mb-2'>
      <KaraokePlayer
        originalText={story?.targetLang}
        audioUrl={story?.audioUrl}
        audioQuery={story?.audioQuery}
        katakanaSentence={story?.katakana}
        chunks={story?.chunks}
      />
      <div>
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇯🇵{story.targetLang}
        </p>
        <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
          🇬🇧{story.baseLang}
        </p>
        {story?.notes && (
          <p className='mt-4 p-2 border rounded bg-gray-100 text-lg'>
            👀{story.notes}
          </p>
        )}
        <Button
          onClick={async () =>
            await addGeneratedSentence({
              targetLang: story?.targetLang,
              baseLang: story?.baseLang,
            })
          }
        >
          Add sentence
        </Button>
      </div>
    </div>
  );
};

export default StoryComponent;
